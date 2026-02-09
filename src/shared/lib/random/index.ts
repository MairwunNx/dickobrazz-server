import type { AppConfig } from "@/shared/config/schema";
import { di } from "@/shared/injection";
import { logger } from "@/shared/lib/logger";
import { createTicker } from "@/shared/lib/profiling/timing";
import { createTrng } from "./randomorg";
import { urandom } from "./urandom";

export const random = (config: AppConfig) => {
  const rndCfg = config.svc.rnd;
  const trng = rndCfg.rndorg.enabled && rndCfg.rndorg.token ? createTrng(config) : null;

  return async (min: number, max: number): Promise<number> => {
    const ticker = createTicker();

    if (trng) {
      const value = await trng(min, max);

      if (value !== null) {
        logger.info("Random integer generated via Random.org", {
          service: "random",
          operation: "generate",
          source: "random.org",
          value,
          duration_ms: ticker(),
        });
        return value;
      }

      logger.warn("Random.org failed, falling back to urandom", {
        service: "random",
        operation: "generate",
        duration_ms: ticker(),
      });
    }

    if (!rndCfg.urandom.enabled) {
      throw new Error("All random sources are disabled");
    }

    const value = urandom(min, max);

    logger.info("Random integer generated via urandom", {
      service: "random",
      operation: "generate",
      source: "urandom",
      value,
      duration_ms: ticker(),
    });

    return value;
  };
};

random.inject = [di.config] as const;

export type Random = ReturnType<typeof random>;
