import { z } from "zod";

export const UserProfileSchema = z.object({
  user_id: z.number(),
  username: z.string().optional(),
  is_hidden: z.boolean().default(false),
  updated_at: z.date().optional(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;
