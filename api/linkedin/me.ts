const parseCookies = (cookieHeader: string | undefined) => {
  if (!cookieHeader) return {} as Record<string, string>;
  return cookieHeader.split(";").reduce((acc, part) => {
    const [key, ...rest] = part.trim().split("=");
    acc[key] = decodeURIComponent(rest.join("="));
    return acc;
  }, {} as Record<string, string>);
};

export default async function handler(req: any, res: any) {
  const cookies = parseCookies(req.headers.cookie);
  const accessToken = cookies.linkedin_access_token;

  if (!accessToken) {
    res.statusCode = 401;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "LinkedIn access token missing" }));
    return;
  }

  try {
    const userInfoResponse = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userInfoResponse.ok) {
      const errorText = await userInfoResponse.text();
      console.error("[LinkedIn] userinfo fetch failed:", errorText);
      res.statusCode = 502;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "LinkedIn userinfo fetch failed" }));
      return;
    }

    const userInfo = await userInfoResponse.json();

    const normalized = {
      name: userInfo.name || userInfo.localizedFirstName || userInfo.given_name || "",
      headline: userInfo.headline || "",
      bio: userInfo.bio || "",
      profileUrl: userInfo.profile || userInfo.profileUrl || "",
      email: userInfo.email || userInfo.email_address || "",
      raw: { userInfo },
    };

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(normalized));
  } catch (error) {
    console.error("[LinkedIn] userinfo request failed:", error);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "LinkedIn userinfo request failed" }));
  }
}
