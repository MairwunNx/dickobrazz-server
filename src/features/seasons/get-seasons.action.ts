import { logger } from "@/shared/lib/logger";
import { createTicker } from "@/shared/lib/profiling";
import type { CockSeasonsResponse } from "./types";

interface PaginationParams {
  limit?: number;
  page?: number;
}

export const createGetSeasonsAction =
  () =>
  async (params: PaginationParams): Promise<CockSeasonsResponse> => {
    const ticker = createTicker();

    // TODO: реализовать бизнес-логику
    const result: CockSeasonsResponse = {
      seasons: [],
      page: { limit: params.limit || 13, total: 0, page: params.page },
    };

    logger.info("Get cock seasons (stub)", {
      service: "cocks",
      operation: "getSeasons",
      limit: params.limit,
      page: params.page,
      duration_ms: ticker(),
    });

    return result;
  };
