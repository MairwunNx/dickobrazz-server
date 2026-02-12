import { z } from "zod";

export const CockSizeResponseSchema = z.object({
  size: z.number(),
  hash: z.string(),
  salt: z.string(),
  pulled_at: z.string(),
});

export type CockSizeResponse = z.infer<typeof CockSizeResponseSchema>;
