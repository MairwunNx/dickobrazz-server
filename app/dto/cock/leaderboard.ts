import { z } from "zod";
import { PageMetaSchema } from "../pagination";

export const LeaderboardEntrySchema = z.object({
  user_id: z.number(),
  nickname: z.string(),
  size: z.number(),
  rank: z.number(),
});

export const UserNeighborhoodSchema = z.object({
  above: LeaderboardEntrySchema.array().optional(),
  current: LeaderboardEntrySchema.optional(),
  below: LeaderboardEntrySchema.array().optional(),
});

export const CockRulerResponseSchema = z.object({
  leaderboard: LeaderboardEntrySchema.array(),
  user_position: UserNeighborhoodSchema.optional(),
  meta: PageMetaSchema.optional(),
});

export const CockLadderResponseSchema = z.object({
  ladder: LeaderboardEntrySchema.array(),
  user_position: UserNeighborhoodSchema.optional(),
  meta: PageMetaSchema.optional(),
});

export type LeaderboardEntry = z.infer<typeof LeaderboardEntrySchema>;
export type UserNeighborhood = z.infer<typeof UserNeighborhoodSchema>;
export type CockRulerResponse = z.infer<typeof CockRulerResponseSchema>;
export type CockLadderResponse = z.infer<typeof CockLadderResponseSchema>;
