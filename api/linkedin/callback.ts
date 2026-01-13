const parseCookies = (cookieHeader: string | undefined) => {
  if (!cookieHeader) return {} as Record<string, string>;
  return cookieHeader.split(";").reduce((acc, part) => {
    const [key, ...rest] = part.trim().split("=");
    acc[key] = decodeURIComponent(rest.join("="));
    return acc;
  }, {} as Record<string, string>);
};

const serializeCookie = (name: string, value: string, options: Record<string, string | number | boolean>) => {
  const parts = [`${name}=${encodeURIComponent(value)}`];
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

export default async function handler(req: any, res: any) {
  const url = new URL(req.url, `https://${req.headers.host}`);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const cookies = parseCookies(req.headers.cookie);
  const storedState = cookies.linkedin_oauth_state;

  if (!code || !state || !storedState || state !== storedState) {
    console.error("[LinkedIn] Invalid state or missing code");
    res.writeHead(302, { Location: "/?linkedin=error" });
    res.end();
    return;
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    const missing = [
      !clientId && "LINKEDIN_CLIENT_ID",
      !clientSecret && "LINKEDIN_CLIENT_SECRET",
      !redirectUri && "LINKEDIN_REDIRECT_URI",
    ].filter(Boolean);
    console.error(`[LinkedIn] Missing env vars: ${missing.join(", ")}`);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: `${missing.join(", ")} not set` }));
    return;
  }

  try {
    const tokenResponse = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("[LinkedIn] Token exchange failed:", errorText);
      res.writeHead(302, { Location: "/?linkedin=error" });
      res.end();
      return;
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token as string | undefined;

    if (!accessToken) {
      console.error("[LinkedIn] Missing access_token in response");
      res.writeHead(302, { Location: "/?linkedin=error" });
      res.end();
      return;
    }

    res.setHeader("Set-Cookie", [
      serializeCookie("linkedin_access_token", accessToken, {
        Path: "/",
        "Max-Age": tokenData.expires_in ?? 3600,
        HttpOnly: true,
        SameSite: "Lax",
        Secure: true,
      }),
      serializeCookie("linkedin_oauth_state", "", {
        Path: "/",
        "Max-Age": 0,
        HttpOnly: true,
        SameSite: "Lax",
        Secure: true,
      }),
    ]);

    res.writeHead(302, { Location: "/?linkedin=success" });
    res.end();
  } catch (error) {
    console.error("[LinkedIn] Callback failed:", error);
    res.writeHead(302, { Location: "/?linkedin=error" });
    res.end();
  }
}
