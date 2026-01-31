export const setSessionCookie = (cookies: Bun.CookieMap, token: string, ttlSec: number, isProduction = process.env.NODE_ENV === "production"): void => {
  cookies.set("session_token", token, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: ttlSec,
    secure: isProduction,
  });
};
