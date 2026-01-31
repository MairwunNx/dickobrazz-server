import type { BunRequest } from "bun";

export const extractCookieToken = (req: BunRequest, cookieName = "session_token"): string | null => {
  return req.cookies.get(cookieName) ?? null;
};
