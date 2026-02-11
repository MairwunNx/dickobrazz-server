import type { UserDal, UserProfile } from "@/entities/user";
import { getAuthUser } from "@/shared/context";
import { di } from "@/shared/injection";
import { logger } from "@/shared/lib/logger";
import { createTicker } from "@/shared/lib/profiling";
import type { UpdatePrivacyParams } from "./types";

export const createUpdatePrivacyAction =
  (userDal: UserDal) =>
  async (params: UpdatePrivacyParams): Promise<UserProfile> => {
    const ticker = createTicker();
    const authUser = getAuthUser();
    const userId = authUser.id;

    const updated = await userDal.updatePrivacy(userId, params.is_hidden);

    const result: UserProfile = {
      id: userId,
      username: updated?.username ?? authUser.username,
      first_name: authUser.first_name,
      last_name: authUser.last_name,
      photo_url: authUser.photo_url,
      is_hidden: updated?.is_hidden ?? params.is_hidden,
    };

    logger.debug("User privacy updated", {
      service: "users",
      operation: "updatePrivacy",
      user_id: userId,
      is_hidden: result.is_hidden,
      duration_ms: ticker(),
    });

    return result;
  };

createUpdatePrivacyAction.inject = [di.userDal] as const;
