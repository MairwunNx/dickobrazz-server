export const extractBearerToken = (headers: Headers): string | null => {
  const authHeader = headers.get("authorization");
  if (!authHeader) return null;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
};
