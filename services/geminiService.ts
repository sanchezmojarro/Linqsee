
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { CommentGenerationRequest, CommentType, UserProfile, AuditResult } from "../types";

const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY;
const openAiApiKey = import.meta.env.VITE_OPENAI_API_KEY;
const openAiModel = import.meta.env.VITE_OPENAI_MODEL || "gpt-4o-mini";

const resolveProvider = () => {
  if (openAiApiKey) return "openai";
  if (geminiApiKey) return "gemini";
  throw new Error("Missing API key. Set VITE_OPENAI_API_KEY or VITE_GEMINI_API_KEY.");
};

const getGeminiClient = () => {
  if (!geminiApiKey) {
    throw new Error("Missing Gemini API key. Set VITE_GEMINI_API_KEY.");
  }
  return new GoogleGenAI({ apiKey: geminiApiKey });
};

const runOpenAi = async ({
  system,
  user,
  temperature = 0.2,
  responseFormat,
}: {
  system: string;
  user: string;
  temperature?: number;
  responseFormat?: { type: "json_object" };
}) => {
  if (!openAiApiKey) {
    throw new Error("Missing OpenAI API key. Set VITE_OPENAI_API_KEY.");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openAiApiKey}`,
    },
    body: JSON.stringify({
      model: openAiModel,
      temperature,
      response_format: responseFormat,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };

  return data.choices?.[0]?.message?.content || "";
};

export const parseLinkedInData = async (rawText: string): Promise<Partial<UserProfile>> => {
  const prompt = `
    Analyze this raw text from a LinkedIn profile and extract the relevant information for a Ghostwriter AI.
    Format the response as JSON.
    RAW TEXT: """ ${rawText} """
  `;

  try {
    const provider = resolveProvider();
    if (provider === "openai") {
      const content = await runOpenAi({
        system: "You are an assistant that returns only valid JSON objects.",
        user: prompt,
        responseFormat: { type: "json_object" },
      });
      return JSON.parse(content || "{}");
    }

    const response = await getGeminiClient().models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            expertise: { type: Type.STRING },
            bio: { type: Type.STRING },
            tone: {
              type: Type.STRING,
              description: "Suggest a tone from: Professional, Enthusiastic, Ironic, Direct, Empathetic",
            },
            language: { type: Type.STRING },
          },
          required: ["name", "expertise", "bio", "tone", "language"],
        },
      },
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error parsing LinkedIn data:", error);
    throw error;
  }
};

export const generateLinkedInComment = async (request: CommentGenerationRequest): Promise<string> => {
  const { profile, postContent, type } = request;
  const systemInstruction = `
    Eres ${profile.name}, experto en ${profile.expertise}. COMENTA en posts ajenos para generar autoridad.
    IDENTIDAD: ${profile.bio}
    TONO: ${profile.tone}
    IDIOMA: ${profile.language}
    REGLAS: No resumas el post original, aporta valor desde tu experiencia, sé auténtico, usa primera persona.
  `;

  let specific = "";
  if (type === CommentType.QUICK) specific = "Máx 15 palabras, 1 emoji natural.";
  else if (type === CommentType.SHORT) specific = "2-3 frases conectando con tu visión profesional.";
  else specific = "Alto valor. Estructura: Gancho disruptivo -> Aporte de valor técnico/estratégico -> Pregunta abierta de engagement.";

  try {
    const provider = resolveProvider();
    if (provider === "openai") {
      const content = await runOpenAi({
        system: `${systemInstruction}\n${specific}`,
        user: `POST: """ ${postContent} """`,
        temperature: 0.8,
      });
      return content || "Error.";
    }

    const response = await getGeminiClient().models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `POST: """ ${postContent} """`,
      config: { systemInstruction: `${systemInstruction}\n${specific}`, temperature: 0.8 },
    });
    return response.text || "Error.";
  } catch (e) {
    return "Error de API.";
  }
};

export interface SectionImprovement {
  current: string;
  suggested: string;
  why: string;
  howToApply: string;
}

export interface EnhancedAuditResult extends AuditResult {
  headline: SectionImprovement;
  about: SectionImprovement;
  experience: SectionImprovement;
}

export const auditProfile = async (profile: UserProfile): Promise<EnhancedAuditResult> => {
  const prompt = `
    Analiza este perfil de LinkedIn y genera mejoras específicas divididas por secciones.
    Devuelve un JSON con:
    - score: Puntuación 0-100.
    - strengths: Array de strings.
    - weaknesses: Array de strings.
    - headline: { current, suggested, why, howToApply }
    - about: { current, suggested, why, howToApply }
    - experience: { current, suggested, why, howToApply }
    - suggestions: Array de objetos {title, description}.
    
    PERFIL ACTUAL:
    Nombre: ${profile.name}
    Headline/Expertise: ${profile.expertise}
    About/Bio: ${profile.bio}
  `;
  try {
    const provider = resolveProvider();
    if (provider === "openai") {
      const content = await runOpenAi({
        system: "You are an assistant that returns only valid JSON objects.",
        user: prompt,
        responseFormat: { type: "json_object" },
      });
      return JSON.parse(content || "{}");
    }

    const response = await getGeminiClient().models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            headline: {
              type: Type.OBJECT,
              properties: {
                current: { type: Type.STRING },
                suggested: { type: Type.STRING },
                why: { type: Type.STRING },
                howToApply: { type: Type.STRING },
              },
            },
            about: {
              type: Type.OBJECT,
              properties: {
                current: { type: Type.STRING },
                suggested: { type: Type.STRING },
                why: { type: Type.STRING },
                howToApply: { type: Type.STRING },
              },
            },
            experience: {
              type: Type.OBJECT,
              properties: {
                current: { type: Type.STRING },
                suggested: { type: Type.STRING },
                why: { type: Type.STRING },
                howToApply: { type: Type.STRING },
              },
            },
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
              },
            },
          },
        },
      },
    });
    return JSON.parse(response.text || "{}");
  } catch (e) { throw e; }
};
