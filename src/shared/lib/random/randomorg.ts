import RandomOrg from "random-org";
import type { AppConfig } from "@/shared/config/schema";
import { logger } from "@/shared/lib/logger";
import { createTicker } from "@/shared/lib/profiling/timing";
import { withTimeout } from "@/shared/lib/sync";

const TIMEOUT_MS = 5000;

export const createTrng = (config: AppConfig) => {
  const client = new RandomOrg({ apiKey: config.svc.rnd.rndorg.token ?? "" });

  return async (min: number, max: number): Promise<number | null> => {
    const ticker = createTicker();

    try {
      const response = await withTimeout(client.generateIntegers({ n: 1, min, max }), TIMEOUT_MS, "Random.org");
      const numbers = response.random.data;
      const value = numbers[0] ?? null;

      logger.debug("Random.org integers generated", {
        service: "random.org",
        operation: "trng",
        value,
        duration_ms: ticker(),
      });

      return value;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      const errorCode = error && typeof error === "object" && "code" in error ? String((error as { code?: unknown }).code ?? "N/A") : "N/A";

      logger.warn("Random.org API request failed", {
        service: "random.org",
        operation: "trng",
        error: { message: errorMessage, code: errorCode },
        duration_ms: ticker(),
      });

      return null;
    }
  };
};
