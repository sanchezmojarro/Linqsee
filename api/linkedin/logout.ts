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

export default function handler(_req: any, res: any) {
  res.setHeader("Set-Cookie", [
    serializeCookie("linkedin_access_token", "", {
      Path: "/",
      "Max-Age": 0,
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

  res.statusCode = 204;
  res.end();
}
