export const extractCookieToken = (headers: Headers, cookieName = "session_token"): string | null => {
  const cookieHeader = headers.get("cookie");
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";").map((part) => part.trim());
  for (const part of parts) {
    const [key, value] = part.split("=");
    if (key === cookieName && value) return value;
  }
  return null;
};
