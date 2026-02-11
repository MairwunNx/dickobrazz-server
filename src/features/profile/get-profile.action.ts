import type { UserDal, UserProfile } from "@/entities/user";
import { getAuthUser } from "@/shared/context";
import { di } from "@/shared/injection";
import { logger } from "@/shared/lib/logger";
import { createTicker } from "@/shared/lib/profiling";

export const createGetProfileAction = (userDal: UserDal) => async (): Promise<UserProfile> => {
  const ticker = createTicker();
  const authUser = getAuthUser();
  const userId = authUser.id;

  const userDoc = await userDal.findByUserId(userId);

  const result: UserProfile = {
    id: userId,
    username: userDoc?.username ?? authUser.username,
    first_name: authUser.first_name,
    last_name: authUser.last_name,
    photo_url: authUser.photo_url,
    is_hidden: userDoc?.is_hidden ?? false,
  };

  logger.debug("User profile retrieved", {
    service: "users",
    operation: "getProfile",
    user_id: userId,
    duration_ms: ticker(),
  });

  return result;
};

createGetProfileAction.inject = [di.userDal] as const;
