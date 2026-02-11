import { z } from "zod";

export const RespectResponseSchema = z.object({
  total_respect: z.number(),
});

export type RespectResponse = z.infer<typeof RespectResponseSchema>;
