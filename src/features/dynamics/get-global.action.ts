import { logger } from "@/shared/lib/logger";
import { createTicker } from "@/shared/lib/profiling";
import type { CockDynamicGlobalResponse } from "./types";

export const createGetDynamicGlobalAction = () => async (): Promise<CockDynamicGlobalResponse> => {
  const ticker = createTicker();

  // TODO: реализовать бизнес-логику
  const result: CockDynamicGlobalResponse = {
    overall: {
      total_size: 0,
      unique_users: 0,
      recent: { average: 0, median: 0 },
      distribution: { huge_percent: 0, little_percent: 0 },
      record: { requested_at: new Date().toISOString(), total: 0 },
      total_cocks_count: 0,
      growth_speed: 0,
    },
  };

  logger.info("Get global cock dynamics (stub)", {
    service: "cocks",
    operation: "getDynamicGlobal",
    duration_ms: ticker(),
  });

  return result;
};
