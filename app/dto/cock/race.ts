import { z } from "zod";
import { PageMetaSchema } from "../pagination";
import { SeasonInfoSchema } from "./seasons";

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
  user_position: z.number(),
  neighborhood: RaceNeighborhoodSchema,
  page: PageMetaSchema,
});

export type RaceEntry = z.infer<typeof RaceEntrySchema>;
export type RaceNeighborhood = z.infer<typeof RaceNeighborhoodSchema>;
export type CockRaceResponse = z.infer<typeof CockRaceResponseSchema>;
