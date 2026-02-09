import { z } from "zod";
import { AchievementSchema } from "@/entities/achievement";

export const CockAchievementsResponseSchema = z.object({
  achievements: AchievementSchema.array(),
});

export type CockAchievementsResponse = z.infer<typeof CockAchievementsResponseSchema>;
