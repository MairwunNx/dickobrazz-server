export const generateRequestId = (headers: Headers): string => {
  const existingId = headers.get("X-Request-Id");
  return existingId || crypto.randomUUID();
};
