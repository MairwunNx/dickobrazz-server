import type { UserProfile } from "@/entities/user";
import { logger } from "@/shared/lib/logger";
import { createTicker } from "@/shared/lib/profiling";
import type { UpdatePrivacyParams } from "./types";

export const createUpdatePrivacyAction =
  () =>
  async (params: UpdatePrivacyParams): Promise<UserProfile> => {
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
