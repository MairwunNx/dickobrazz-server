import { z } from "zod";
import { PageMetaSchema } from "../pagination";

export const LeaderboardEntrySchema = z.object({
  user_id: z.number(),
  nickname: z.string(),
  size: z.number(),
});

export const UserNeighborhoodSchema = z.object({
  above: LeaderboardEntrySchema.array(),
  self: LeaderboardEntrySchema.optional(),
  below: LeaderboardEntrySchema.array(),
});

export const CockRulerResponseSchema = z.object({
  leaders: LeaderboardEntrySchema.array(),
  total_participants: z.number(),
  user_position: z.number().nullable().optional(),
  neighborhood: UserNeighborhoodSchema,
  page: PageMetaSchema,
});

export const CockLadderResponseSchema = z.object({
  leaders: LeaderboardEntrySchema.array(),
  total_participants: z.number(),
  user_position: z.number().nullable().optional(),
  neighborhood: UserNeighborhoodSchema,
  page: PageMetaSchema,
});

export type LeaderboardEntry = z.infer<typeof LeaderboardEntrySchema>;
export type UserNeighborhood = z.infer<typeof UserNeighborhoodSchema>;
export type CockRulerResponse = z.infer<typeof CockRulerResponseSchema>;
export type CockLadderResponse = z.infer<typeof CockLadderResponseSchema>;
