import { logger } from "@/log";
import { generateRandomOrgIntegers } from "@/rep/random";
import { secureRandomInRange } from "./urandom";

export interface RandomConfig {
  rndorg: {
    enabled: boolean;
    token?: string;
  };
  urandom: {
    enabled: boolean;
  };
}

export const generateRandomInteger = async (config: RandomConfig, min: number, max: number): Promise<number> => {
  if (config.rndorg.enabled && config.rndorg.token) {
    const numbers = await generateRandomOrgIntegers(config.rndorg.token, min, max, 1);

    if (numbers && numbers.length > 0) {
      logger.info("Random integer generated via Random.org", {
        service: "random",
        operation: "generate",
        source: "random.org",
        value: numbers[0],
      });
      return numbers[0] as number;
    }

    logger.warn("Random.org failed, falling back to urandom", {
      service: "random",
      operation: "generate",
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
  });

  return value;
};
