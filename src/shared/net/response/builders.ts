import { z } from "zod";

export const APIErrorSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
});

export const APIResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema.optional(),
    error: APIErrorSchema.optional(),
  });

export type APIError = z.infer<typeof APIErrorSchema>;
export type APIResponse<T = unknown> = {
  data?: T;
  error?: APIError;
};

export const success = <T>(data: T, status = 200): Response => {
  const response: APIResponse<T> = { data };
  return Response.json(response, { status });
};

export const failure = (message: string, code = "ERROR", status = 400): Response => {
  const error: APIError = { message, code };
  const response: APIResponse = { error };
  return Response.json(response, { status });
};
