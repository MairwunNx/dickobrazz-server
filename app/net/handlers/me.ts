import type { Handler } from "@/cmd/types";
import { getContext } from "@/cmd/context";
import { UpdatePrivacyPayloadSchema } from "@/dto/user";
import { errorResponse, successResponse } from "@/net/responses";
import { getProfile, updatePrivacy } from "@/svc/users/service";

export const meHandler: Handler = async () => {
  const context = getContext();
  if (!context?.user) {
    throw new Error("User not authenticated");
  }

  const profile = await getProfile(context.user.id);
  return successResponse(profile);
};

export const updatePrivacyHandler: Handler = async (req) => {
  const context = getContext();
  if (!context?.user) {
    throw new Error("User not authenticated");
  }

  try {
    const body = await req.json();
    const parsed = UpdatePrivacyPayloadSchema.parse(body);
    const profile = await updatePrivacy({ id: context.user.id, is_hidden: parsed.is_hidden });
    return successResponse(profile);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Invalid payload", "VALIDATION_ERROR", 400);
  }
};
