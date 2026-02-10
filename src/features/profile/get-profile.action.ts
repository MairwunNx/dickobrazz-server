import type { UserProfile } from "@/entities/user";
import { getAuthUser } from "@/shared/context";
import { logger } from "@/shared/lib/logger";
import { createTicker } from "@/shared/lib/profiling";

export const createGetProfileAction = () => async (): Promise<UserProfile> => {
  const ticker = createTicker();
  const userId = getAuthUser().id;

  // TODO: реализовать бизнес-логику получения профиля пользователя
  const result: UserProfile = {
    id: userId,
    username: undefined,
    first_name: undefined,
    last_name: undefined,
    photo_url: undefined,
    is_hidden: true,
  };

  logger.debug("User profile retrieved", {
    service: "users",
    operation: "getProfile",
    user_id: userId,
    duration_ms: ticker(),
  });

  return result;
};
