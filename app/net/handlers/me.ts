import type { Handler } from "@/cmd/types";
import { UpdatePrivacyPayloadSchema } from "@/dto/user";
import { failure, success } from "@/net/responses";
import { getProfile, updatePrivacy } from "@/svc/users/service";

export const me: Handler = async () => success(await getProfile());

export const privacy: Handler = async (req) => {
  try {
    const body = await req.json();
    const parsed = UpdatePrivacyPayloadSchema.parse(body);
    const profile = await updatePrivacy({ is_hidden: parsed.is_hidden });
    return success(profile);
  } catch (error) {
    return failure(error instanceof Error ? error.message : "Invalid payload", "VALIDATION_ERROR", 400);
  }
};
