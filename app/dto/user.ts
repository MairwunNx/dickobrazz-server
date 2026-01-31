import { z } from "zod";

export const UserProfileSchema = z.object({
  id: z.number(),
  username: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  photo_url: z.string().optional(),
  is_hidden: z.boolean(),
});

export const UpdatePrivacyPayloadSchema = z.object({
  is_hidden: z.boolean(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;
export type UpdatePrivacyPayload = z.infer<typeof UpdatePrivacyPayloadSchema>;
