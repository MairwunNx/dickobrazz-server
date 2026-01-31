import type { UserProfile } from "@/dto/user";
import { createTicker, logger } from "@/log";

export const getProfile = async (userId: number): Promise<UserProfile> => {
  const ticker = createTicker();

  // TODO: реализовать бизнес-логику получения профиля пользователя

  const result = {
    id: 3232,
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
