import { logger } from "@/shared/lib/logger";
import { createTicker } from "@/shared/lib/profiling";
import type { CockRaceResponse } from "./types";

interface PaginationParams {
  limit?: number;
  page?: number;
}

export const createGetRaceAction =
  () =>
  async (params: PaginationParams): Promise<CockRaceResponse> => {
    const ticker = createTicker();

    // TODO: реализовать бизнес-логику
    const result: CockRaceResponse = {
      season: undefined,
      leaders: [],
      total_participants: 0,
      user_position: 0,
      neighborhood: { above: [], self: undefined, below: [] },
      page: { limit: params.limit || 13, total: 0 },
    };

    logger.info("Get season race (stub)", {
      service: "cocks",
      operation: "getRace",
      limit: params.limit,
      duration_ms: ticker(),
    });

    return result;
  };
