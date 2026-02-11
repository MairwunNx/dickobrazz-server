import { z } from "zod";

export const RespectResponseSchema = z.object({
  season_respect: z.number(),
  achievement_respect: z.number(),
  total_respect: z.number(),
});

export type RespectResponse = z.infer<typeof RespectResponseSchema>;
