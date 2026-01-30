export const generateRequestId = (headers: Headers): string => {
  const existingId = headers.get("x-request-id");
  return existingId || crypto.randomUUID();
};
