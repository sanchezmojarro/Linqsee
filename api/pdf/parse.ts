import Busboy from "busboy";
import pdf from "pdf-parse";

export const config = {
  api: { bodyParser: false },
};

type ParsedProfile = {
  name: string;
  email: string;
  phone: string;
  linkedinUrl: string;
  about: string;
  skills: string[];
  experience: { company: string; title: string; dates: string; description: string }[];
  education: { school: string; degree: string; dates: string; description: string }[];
};

const findSection = (text: string, header: string, nextHeaders: string[]) => {
  const start = text.toLowerCase().indexOf(header.toLowerCase());
  if (start === -1) return "";
  const end = nextHeaders
    .map((h) => text.toLowerCase().indexOf(h.toLowerCase(), start + header.length))
    .filter((idx) => idx !== -1)
    .sort((a, b) => a - b)[0];
  const slice = text.slice(start + header.length, end ?? text.length);
  return slice.trim();
};

const parseLines = (section: string) =>
  section
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

const parseExperience = (section: string) => {
  const lines = parseLines(section);
  const entries: ParsedProfile["experience"] = [];
  let current: ParsedProfile["experience"][number] | null = null;

  lines.forEach((line) => {
    if (!current) {
      current = { company: line, title: "", dates: "", description: "" };
      return;
    }
    if (!current.title) {
      current.title = line;
      return;
    }
    if (!current.dates) {
      current.dates = line;
      return;
    }
    if (line === "") return;
    current.description = current.description ? `${current.description} ${line}` : line;
  });

  if (current) entries.push(current);
  return entries;
};

const parseEducation = (section: string) => {
  const lines = parseLines(section);
  const entries: ParsedProfile["education"] = [];
  let current: ParsedProfile["education"][number] | null = null;

  lines.forEach((line) => {
    if (!current) {
      current = { school: line, degree: "", dates: "", description: "" };
      return;
    }
    if (!current.degree) {
      current.degree = line;
      return;
    }
    if (!current.dates) {
      current.dates = line;
      return;
    }
    current.description = current.description ? `${current.description} ${line}` : line;
  });

  if (current) entries.push(current);
  return entries;
};

const parseSkills = (section: string) =>
  section
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);

const parseProfile = (text: string): ParsedProfile => {
  const normalizedText = text.replace(/\r/g, "");
  const lines = parseLines(normalizedText);
  const name = lines[0] || "";
  const email = normalizedText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || "";
  const phone = normalizedText.match(/(\+?\d[\d\s().-]{7,}\d)/)?.[0] || "";
  const linkedinUrl = normalizedText.match(/https?:\/\/(www\.)?linkedin\.com\/[^\s]+/i)?.[0] || "";

  const about = findSection(normalizedText, "Acerca de", ["Experiencia", "Educación", "Aptitudes", "Habilidades"]);
  const experienceSection = findSection(normalizedText, "Experiencia", ["Educación", "Aptitudes", "Habilidades"]);
  const educationSection = findSection(normalizedText, "Educación", ["Aptitudes", "Habilidades"]);
  const skillsSection = findSection(normalizedText, "Aptitudes", ["Habilidades", "Certificaciones"]);
  const skillsFallback = findSection(normalizedText, "Habilidades", ["Certificaciones", "Idiomas"]);

  return {
    name,
    email,
    phone,
    linkedinUrl,
    about: about || "",
    skills: parseSkills(skillsSection || skillsFallback),
    experience: experienceSection ? parseExperience(experienceSection) : [],
    education: educationSection ? parseEducation(educationSection) : [],
  };
};

export default function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  try {
    const bb = Busboy({ headers: req.headers });
    const chunks: Buffer[] = [];
    let fileFound = false;
    let mimeType = "";

    bb.on("file", (_name, file, info) => {
      fileFound = true;
      mimeType = info.mimeType;
      if (mimeType !== "application/pdf") {
        file.resume();
        res.status(400).json({ ok: false, error: "Only PDF allowed", mimeType });
        return;
      }
      file.on("data", (d: Buffer) => chunks.push(d));
    });

    bb.on("finish", async () => {
      if (!fileFound) {
        res.status(400).json({ ok: false, error: "No file field found (expected 'file')" });
        return;
      }

      const buffer = Buffer.concat(chunks);
      if (buffer.length < 10) {
        res.status(400).json({ ok: false, error: "Empty upload" });
        return;
      }

      try {
        const parsed = await pdf(buffer);
        const text = (parsed.text || "").trim();
        console.log("[PDF] Extracted text length:", text.length);

        if (!text) {
          res.status(422).json({
            ok: false,
            error: "PDF parsed but text is empty. Might be scanned image; needs OCR.",
            pages: parsed.numpages,
          });
          return;
        }

        const profile = parseProfile(text);
        res.status(200).json({
          ok: true,
          pages: parsed.numpages,
          chars: text.length,
          text,
          profile,
        });
      } catch (error: any) {
        res.status(500).json({
          ok: false,
          error: "pdf-parse failed",
          detail: String(error?.message || error),
        });
      }
    });

    req.pipe(bb);
  } catch (error: any) {
    res.status(500).json({
      ok: false,
      error: "Upload handler crashed",
      detail: String(error?.message || error),
    });
  }
}
