export const buildSessionCookie = (token: string, ttlSec: number, isProduction = process.env.NODE_ENV === "production"): string => {
  const parts = [
    `session_token=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${ttlSec}`,
  ];

  if (isProduction) {
    parts.push("Secure");
  }

  return parts.join("; ");
};
