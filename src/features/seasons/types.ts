import { z } from "zod";
import { PageMetaSchema } from "@/shared/net/pagination/pagination";

export const SeasonInfoSchema = z.object({
  season_num: z.number(),
  start_date: z.string(),
  end_date: z.string(),
  is_active: z.boolean(),
});

export const SeasonWinnerSchema = z.object({
  user_id: z.number(),
  nickname: z.string(),
  total_size: z.number(),
  place: z.number(),
});

export const SeasonNeighborhoodSchema = z.object({
  above: SeasonWinnerSchema.array(),
  self: SeasonWinnerSchema.optional(),
  below: SeasonWinnerSchema.array(),
});

export const SeasonWithWinnersSchema = SeasonInfoSchema.extend({
  winners: SeasonWinnerSchema.array(),
  total_participants: z.number(),
  user_position: z.number().nullable().optional(),
  neighborhood: SeasonNeighborhoodSchema,
});

export const CockSeasonsResponseSchema = z.object({
  seasons: SeasonWithWinnersSchema.array(),
  page: PageMetaSchema,
});

export type SeasonInfo = z.infer<typeof SeasonInfoSchema>;
export type SeasonWinner = z.infer<typeof SeasonWinnerSchema>;
export type SeasonNeighborhood = z.infer<typeof SeasonNeighborhoodSchema>;
export type SeasonWithWinners = z.infer<typeof SeasonWithWinnersSchema>;
export type CockSeasonsResponse = z.infer<typeof CockSeasonsResponseSchema>;
