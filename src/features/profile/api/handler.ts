import type { Handler } from "@/app/types";
import type { UserProfile } from "@/entities/user";
import { UpdatePrivacyPayloadSchema } from "@/entities/user";
import { di } from "@/shared/injection";
import { failure, success } from "@/shared/net/response";
import type { UpdatePrivacyParams } from "../types";

type GetProfileAction = (userId: number) => Promise<UserProfile>;
type UpdatePrivacyAction = (params: UpdatePrivacyParams) => Promise<UserProfile>;

export const createMeHandler =
  (getProfileAction: GetProfileAction): Handler =>
  async () =>
    success(await getProfileAction(0)); // TODO: userId из контекста

createMeHandler.inject = [di.getProfileAction] as const;

export const createPrivacyHandler =
  (updatePrivacyAction: UpdatePrivacyAction): Handler =>
  async (req) => {
    try {
      const body = await req.json();
      const parsed = UpdatePrivacyPayloadSchema.parse(body);
      const profile = await updatePrivacyAction({ id: 0, is_hidden: parsed.is_hidden }); // TODO: userId из контекста
      return success(profile);
    } catch (error) {
      return failure(error instanceof Error ? error.message : "Invalid payload", "VALIDATION_ERROR", 400);
    }
  };

createPrivacyHandler.inject = [di.updatePrivacyAction] as const;
