const buildAuthUrl = (state: string) => {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI;

  if (!clientId) {
    throw new Error("LINKEDIN_CLIENT_ID not set");
  }
  if (!redirectUri) {
    throw new Error("LINKEDIN_REDIRECT_URI not set");
  }

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "openid profile email",
    state,
  });

  return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
};

const createState = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
};

const serializeCookie = (name: string, value: string, options: Record<string, string | number | boolean>) => {
  const parts = [`${name}=${value}`];
  Object.entries(options).forEach(([key, optionValue]) => {
    if (optionValue === false) return;
    if (optionValue === true) {
      parts.push(key);
      return;
    }
    parts.push(`${key}=${optionValue}`);
  });
  return parts.join("; ");
};

export default function handler(req: { headers: Record<string, string | string[] | undefined> }, res: any) {
  try {
    const state = createState();
    const authUrl = buildAuthUrl(state);

    res.setHeader(
      "Set-Cookie",
      serializeCookie("linkedin_oauth_state", state, {
        Path: "/",
        "Max-Age": 600,
        HttpOnly: true,
        SameSite: "Lax",
        Secure: true,
      })
    );

    console.log(`[LinkedIn] Redirecting to ${authUrl}`);
    res.writeHead(302, { Location: authUrl });
    res.end();
  } catch (error) {
    const message = error instanceof Error ? error.message : "LinkedIn auth error";
    console.error("[LinkedIn] Auth init failed:", message);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: message }));
  }
}
