import { z } from "zod";

export const CockDynamicRecentStatSchema = z.object({
  average: z.number(),
  median: z.number(),
});

export const CockDynamicPercentileSchema = z.object({
  huge_percent: z.number(),
  little_percent: z.number(),
});

export const CockDynamicRecordSchema = z.object({
  requested_at: z.string(),
  total: z.number(),
});

export const CockDynamicDailyDynamicsSchema = z.object({
  yesterday_cock_change: z.number(),
  yesterday_cock_change_percent: z.number(),
});

export const CockDynamicFiveCocksDynamicsSchema = z.object({
  five_cocks_change: z.number(),
  five_cocks_change_percent: z.number(),
});

export const CockDynamicOverallSchema = z.object({
  total_size: z.number(),
  unique_users: z.number(),
  recent: CockDynamicRecentStatSchema,
  distribution: CockDynamicPercentileSchema,
  record: CockDynamicRecordSchema,
  total_cocks_count: z.number(),
  growth_speed: z.number(),
});

export const CockDynamicIndividualSchema = z.object({
  total_size: z.number(),
  recent_average: z.number(),
  irk: z.number(),
  record: CockDynamicRecordSchema,
  dominance: z.number(),
  daily_growth_average: z.number(),
  daily_dynamics: CockDynamicDailyDynamicsSchema,
  five_cocks_dynamics: CockDynamicFiveCocksDynamicsSchema,
  growth_speed: z.number(),
  first_cock_date: z.string(),
  luck_coefficient: z.number(),
  volatility: z.number(),
  cocks_count: z.number(),
});

export const CockDynamicResponseSchema = z.object({
  overall: CockDynamicOverallSchema,
  individual: CockDynamicIndividualSchema,
});

export const CockDynamicGlobalResponseSchema = z.object({
  overall: CockDynamicOverallSchema,
});

export type CockDynamicResponse = z.infer<typeof CockDynamicResponseSchema>;
export type CockDynamicGlobalResponse = z.infer<typeof CockDynamicGlobalResponseSchema>;
export type CockDynamicOverall = z.infer<typeof CockDynamicOverallSchema>;
export type CockDynamicIndividual = z.infer<typeof CockDynamicIndividualSchema>;
export type CockDynamicRecentStat = z.infer<typeof CockDynamicRecentStatSchema>;
export type CockDynamicPercentile = z.infer<typeof CockDynamicPercentileSchema>;
export type CockDynamicRecord = z.infer<typeof CockDynamicRecordSchema>;
export type CockDynamicDailyDynamics = z.infer<typeof CockDynamicDailyDynamicsSchema>;
export type CockDynamicFiveCocksDynamics = z.infer<typeof CockDynamicFiveCocksDynamicsSchema>;
