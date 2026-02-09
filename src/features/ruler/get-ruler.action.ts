import { logger } from "@/shared/lib/logger";
import { createTicker } from "@/shared/lib/profiling";
import type { CockRulerResponse } from "./types";

interface PaginationParams {
  limit?: number;
  page?: number;
}

export const createGetRulerAction =
  () =>
  async (params: PaginationParams): Promise<CockRulerResponse> => {
    const ticker = createTicker();

    // TODO: реализовать бизнес-логику
    const result: CockRulerResponse = {
      leaders: [],
      total_participants: 0,
      user_position: 0,
      neighborhood: { above: [], self: undefined, below: [] },
      page: { limit: params.limit || 13, total: 0 },
    };

    logger.info("Get daily ruler (stub)", {
      service: "cocks",
      operation: "getRuler",
      limit: params.limit,
      duration_ms: ticker(),
    });

    return result;
  };
