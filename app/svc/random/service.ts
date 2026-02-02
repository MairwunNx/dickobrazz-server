import { getConfig } from "@/cfg";
import { createTicker, logger } from "@/log";
import { generateRandomOrgIntegers } from "@/rep/random";
import { secureRandomInRange } from "./urandom";

export const generateRandomInteger = async (min: number, max: number): Promise<number> => {
  const ticker = createTicker();
  const config = getConfig().svc.rnd;

  if (config.rndorg.enabled && config.rndorg.token) {
    const numbers = await generateRandomOrgIntegers(min, max, 1);

    if (numbers && numbers.length > 0) {
      logger.info("Random integer generated via Random.org", {
        service: "random",
        operation: "generate",
        source: "random.org",
        value: numbers[0],
        duration_ms: ticker(),
      });
      return numbers[0] as number;
    }

    logger.warn("Random.org failed, falling back to urandom", {
      service: "random",
      operation: "generate",
      duration_ms: ticker(),
    });
  }

  if (!config.urandom.enabled) {
    throw new Error("All random sources are disabled");
  }

  const value = secureRandomInRange(min, max);
  logger.info("Random integer generated via urandom", {
    service: "random",
    operation: "generate",
    source: "urandom",
    value,
    duration_ms: ticker(),
  });

  return value;
};
