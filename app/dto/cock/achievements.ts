import { z } from "zod";

export const AchievementSchema = z.object({
  id: z.string(),
  emoji: z.string().optional(),
  respects: z.number().optional(),
  completed: z.boolean(),
  progress: z.number().optional(),
  max_progress: z.number().optional(),
});

export const CockAchievementsResponseSchema = z.object({
  achievements: AchievementSchema.array(),
});

export type Achievement = z.infer<typeof AchievementSchema>;
export type CockAchievementsResponse = z.infer<typeof CockAchievementsResponseSchema>;
