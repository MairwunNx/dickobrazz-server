import { z } from "zod";

export const SeasonInfoSchema = z.object({
  season_id: z.string(),
  start_date: z.date(),
  end_date: z.date().optional(),
  is_active: z.boolean(),
  total_participants: z.number().optional(),
});

export const SeasonWinnerSchema = z.object({
  user_id: z.number(),
  nickname: z.string(),
  total_size: z.number(),
  days_participated: z.number(),
  rank: z.number(),
});

export type SeasonInfo = z.infer<typeof SeasonInfoSchema>;
export type SeasonWinner = z.infer<typeof SeasonWinnerSchema>;
