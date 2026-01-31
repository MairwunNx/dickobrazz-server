import type { UserProfile } from "@/dto/user";
import { createTicker, logger } from "@/log";
import type { UpdatePrivacyParams } from "./types";

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

export const updatePrivacy = async (params: UpdatePrivacyParams): Promise<UserProfile> => {
  const ticker = createTicker();

  // TODO: реализовать бизнес-логику обновления приватности пользователя

  const result: UserProfile = {
    id: params.id,
    username: undefined,
    first_name: undefined,
    last_name: undefined,
    photo_url: undefined,
    is_hidden: params.is_hidden,
  };

  logger.debug("User privacy updated", {
    service: "users",
    operation: "updatePrivacy",
    user_id: params.id,
    is_hidden: params.is_hidden,
    duration_ms: ticker(),
  });

  return result;
};
