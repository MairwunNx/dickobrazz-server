import { z } from "zod";

export const DailyStatsSchema = z.object({
  date: z.date(),
  size: z.number(),
  rank: z.number().optional(),
});

export const GlobalStatsSchema = z.object({
  total_users: z.number(),
  total_measurements: z.number(),
  average_size: z.number(),
  max_size: z.number(),
  min_size: z.number(),
});

export const UserStatsSchema = z.object({
  total_measurements: z.number(),
  average_size: z.number(),
  max_size: z.number(),
  min_size: z.number(),
  best_rank: z.number().optional(),
  current_streak: z.number(),
  longest_streak: z.number(),
});

export const CockDynamicResponseSchema = z.object({
  user_stats: UserStatsSchema.optional(),
  global_stats: GlobalStatsSchema.optional(),
  daily_history: DailyStatsSchema.array().optional(),
});

export type DailyStats = z.infer<typeof DailyStatsSchema>;
export type GlobalStats = z.infer<typeof GlobalStatsSchema>;
export type UserStats = z.infer<typeof UserStatsSchema>;
export type CockDynamicResponse = z.infer<typeof CockDynamicResponseSchema>;
