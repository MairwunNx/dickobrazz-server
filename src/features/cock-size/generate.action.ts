import { logger } from "@/shared/lib/logger";
import { createTicker } from "@/shared/lib/profiling";
import type { CockSizeResponse, GetSizeParams } from "./types";

export const createGenerateSizeAction =
  () =>
  async (params: GetSizeParams): Promise<CockSizeResponse> => {
    const ticker = createTicker();

    // TODO: реализовать генерацию размера
    const result: CockSizeResponse = {
      size: 15,
      hash: "stub-hash",
      salt: "stub-salt",
    };

    logger.info("Get or generate cock size (stub)", {
      service: "cocks",
      operation: "getOrGenerateSize",
      user_id: params.user_id,
      duration_ms: ticker(),
    });

    return result;
  };
