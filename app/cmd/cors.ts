const allowedOrigins = new Set(["https://dickobrazz.com", "https://www.dickobrazz.com", "http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000"]);

const subdomainRegex = /^https:\/\/.*\.dickobrazz\.com$/;

export const getCorsHeaders = (origin: string | null): Record<string, string> => {
  if (!origin) return {};
  const isAllowed = allowedOrigins.has(origin) || subdomainRegex.test(origin);
  if (!isAllowed) return {};

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Internal-Token, X-Internal-User-Id, X-Request-Id",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
};
