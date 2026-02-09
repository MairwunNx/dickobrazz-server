import { z } from "zod";

export interface AchievementDoc {
  user_id: number;
  achievement_id: string;
  completed: boolean;
  completed_at?: Date;
  progress: number;
  last_checked_at: Date;
}

export const AchievementSchema = z.object({
  id: z.string(),
  emoji: z.string().optional(),
  respects: z.number().optional(),
  completed: z.boolean(),
  progress: z.number().optional(),
  max_progress: z.number().optional(),
});

export type Achievement = z.infer<typeof AchievementSchema>;
