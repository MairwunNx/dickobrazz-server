import { getAuthUser } from "@/shared/context";
import { logger } from "@/shared/lib/logger";
import { createTicker } from "@/shared/lib/profiling";
import type { CockAchievementsResponse } from "./types";

export const createGetAchievementsAction =
  () =>
  async (): Promise<CockAchievementsResponse> => {
    const ticker = createTicker();
    const userId = getAuthUser().id;

    // TODO: реализовать бизнес-логику
    const result: CockAchievementsResponse = { achievements: [] };

    logger.info("Get achievements (stub)", {
      service: "cocks",
      operation: "getAchievements",
      user_id: userId,
      duration_ms: ticker(),
    });

    return result;
  };
