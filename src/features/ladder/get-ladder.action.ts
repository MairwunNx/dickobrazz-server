import { logger } from "@/shared/lib/logger";
import { createTicker } from "@/shared/lib/profiling";
import type { CockLadderResponse } from "./types";

interface PaginationParams {
  limit?: number;
  page?: number;
}

export const createGetLadderAction =
  () =>
  async (params: PaginationParams): Promise<CockLadderResponse> => {
    const ticker = createTicker();

    // TODO: реализовать бизнес-логику
    const result: CockLadderResponse = {
      leaders: [],
      total_participants: 0,
      user_position: 0,
      neighborhood: { above: [], self: undefined, below: [] },
      page: { limit: params.limit || 13, total: 0 },
    };

    logger.info("Get overall ladder (stub)", {
      service: "cocks",
      operation: "getLadder",
      limit: params.limit,
      duration_ms: ticker(),
    });

    return result;
  };
