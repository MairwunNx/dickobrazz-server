import { z } from "zod";
import { UserProfileSchema } from "./user";

export const TelegramAuthPayloadSchema = z.object({
  id: z.number(),
  first_name: z.string(),
  last_name: z.string().optional(),
  username: z.string().optional(),
  photo_url: z.string().optional(),
  auth_date: z.number(),
  hash: z.string(),
});

export const AuthResponseSchema = z.object({
  user: UserProfileSchema,
  session_token: z.string().optional(),
});

export type TelegramAuthPayload = z.infer<typeof TelegramAuthPayloadSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
