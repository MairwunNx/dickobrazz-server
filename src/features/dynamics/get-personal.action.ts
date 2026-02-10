import { getAuthUser } from "@/shared/context";
import { logger } from "@/shared/lib/logger";
import { createTicker } from "@/shared/lib/profiling";
import type { CockDynamicResponse } from "./types";

export const createGetDynamicPersonalAction =
  () =>
  async (): Promise<CockDynamicResponse> => {
    const ticker = createTicker();
    const userId = getAuthUser().id;

    // TODO: реализовать бизнес-логику
    const result: CockDynamicResponse = {
      overall: {
        total_size: 0,
        unique_users: 0,
        recent: { average: 0, median: 0 },
        distribution: { huge_percent: 0, little_percent: 0 },
        record: { requested_at: new Date().toISOString(), total: 0 },
        total_cocks_count: 0,
        growth_speed: 0,
      },
      individual: {
        total_size: 0,
        recent_average: 0,
        irk: 0,
        record: { requested_at: new Date().toISOString(), total: 0 },
        dominance: 0,
        daily_growth_average: 0,
        daily_dynamics: { yesterday_cock_change: 0, yesterday_cock_change_percent: 0 },
        five_cocks_dynamics: { five_cocks_change: 0, five_cocks_change_percent: 0 },
        growth_speed: 0,
        first_cock_date: new Date().toISOString(),
        luck_coefficient: 0,
        volatility: 0,
        cocks_count: 0,
      },
    };

    logger.info("Get personal cock dynamics (stub)", {
      service: "cocks",
      operation: "getDynamicPersonal",
      user_id: userId,
      duration_ms: ticker(),
    });

    return result;
  };
