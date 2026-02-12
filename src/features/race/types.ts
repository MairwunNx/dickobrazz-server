import { z } from "zod";
import { PageMetaSchema } from "@/shared/net/pagination/pagination";

export const SeasonInfoSchema = z.object({
  season_num: z.number(),
  start_date: z.string(),
  end_date: z.string(),
});

export const RaceEntrySchema = z.object({
  user_id: z.number(),
  nickname: z.string(),
  total_size: z.number(),
});

export const RaceNeighborhoodSchema = z.object({
  above: RaceEntrySchema.array(),
  self: RaceEntrySchema.optional(),
  below: RaceEntrySchema.array(),
});

export const CockRaceResponseSchema = z.object({
  season: SeasonInfoSchema.optional(),
  leaders: RaceEntrySchema.array(),
  total_participants: z.number(),
  user_position: z.number().nullable(),
  neighborhood: RaceNeighborhoodSchema,
  page: PageMetaSchema,
});

export type SeasonInfo = z.infer<typeof SeasonInfoSchema>;
export type RaceEntry = z.infer<typeof RaceEntrySchema>;
export type RaceNeighborhood = z.infer<typeof RaceNeighborhoodSchema>;
export type CockRaceResponse = z.infer<typeof CockRaceResponseSchema>;
