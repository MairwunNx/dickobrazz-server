type SessionCookieOpts = {
  ttlSec: number;
  domain?: string;
  isProduction?: boolean;
};

export const setSessionCookie = (cookies: Bun.CookieMap, token: string, opts: SessionCookieOpts): void => {
  cookies.set("session_token", token, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: opts.ttlSec,
    secure: opts.isProduction ?? process.env.NODE_ENV === "production",
    domain: opts.domain,
  });
};
