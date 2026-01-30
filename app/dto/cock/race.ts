import { z } from "zod";
import { PageMetaSchema } from "../pagination";

export const RaceEntrySchema = z.object({
  user_id: z.number(),
  nickname: z.string(),
  total_size: z.number(),
  days_participated: z.number(),
  rank: z.number(),
});

export const RaceNeighborhoodSchema = z.object({
  above: RaceEntrySchema.array().optional(),
  current: RaceEntrySchema.optional(),
  below: RaceEntrySchema.array().optional(),
});

export const CockRaceResponseSchema = z.object({
  race: RaceEntrySchema.array(),
  user_position: RaceNeighborhoodSchema.optional(),
  season: z
    .object({
      season_id: z.string(),
      start_date: z.date(),
      end_date: z.date().optional(),
    })
    .optional(),
  meta: PageMetaSchema.optional(),
});

export type RaceEntry = z.infer<typeof RaceEntrySchema>;
export type RaceNeighborhood = z.infer<typeof RaceNeighborhoodSchema>;
export type CockRaceResponse = z.infer<typeof CockRaceResponseSchema>;
