import { z } from "zod";
import { PageMetaSchema } from "../pagination";

export const AchievementSchema = z.object({
  achievement_id: z.string(),
  title: z.string(),
  description: z.string(),
  icon: z.string().optional(),
  completed: z.boolean(),
  completed_at: z.date().optional(),
  progress: z.number().optional(),
  max_progress: z.number().optional(),
});

export const CockAchievementsResponseSchema = z.object({
  achievements: AchievementSchema.array(),
  total_completed: z.number(),
  total_achievements: z.number(),
  completion_percentage: z.number(),
  meta: PageMetaSchema.optional(),
});

export type Achievement = z.infer<typeof AchievementSchema>;
export type CockAchievementsResponse = z.infer<typeof CockAchievementsResponseSchema>;
