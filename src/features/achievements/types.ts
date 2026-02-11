import { z } from "zod";
import { AchievementSchema } from "@/entities/achievement";

export const CockAchievementsResponseSchema = z.object({
  achievements: AchievementSchema.array(),
  achievements_total: z.number(),
  achievements_done: z.number(),
  achievements_done_percent: z.number(),
});

export type CockAchievementsResponse = z.infer<typeof CockAchievementsResponseSchema>;
