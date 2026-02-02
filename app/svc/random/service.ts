import { config } from "@/cfg";
import { createTicker, logger } from "@/log";
import { trng } from "@/rep/random";
import { urandom } from "./urandom";

export const rndint = async (min: number, max: number): Promise<number> => {
  const ticker = createTicker();
  const cfg = (await config()).svc.rnd;

  if (cfg.rndorg.enabled && cfg.rndorg.token) {
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

  if (!cfg.urandom.enabled) {
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
