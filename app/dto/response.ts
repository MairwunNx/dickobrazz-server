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
