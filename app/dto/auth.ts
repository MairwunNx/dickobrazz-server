import { z } from "zod";

export const TelegramAuthPayloadSchema = z.object({
  initData: z.string(),
});

export const AuthResponseSchema = z.object({
  user_id: z.number(),
  username: z.string().optional(),
  is_hidden: z.boolean().default(false),
  auth_type: z.enum(["telegram", "internal"]),
});

export type TelegramAuthPayload = z.infer<typeof TelegramAuthPayloadSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
