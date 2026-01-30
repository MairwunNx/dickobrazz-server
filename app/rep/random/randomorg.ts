import { RandomOrgClient, RandomOrgRANDOMORGError } from "@randomorg/core";
import { logger } from "@/log";

const clientCache = new Map<string, RandomOrgClient>();

const getClient = (apiKey: string): RandomOrgClient => {
  const cached = clientCache.get(apiKey);
  if (cached) return cached;

  const client = new RandomOrgClient(apiKey, { httpTimeout: 2000 });
  clientCache.set(apiKey, client);
  return client;
};

export const generateRandomOrgIntegers = async (apiKey: string, min: number, max: number, count = 1): Promise<number[] | null> => {
  const startTime = Date.now();
  const client = getClient(apiKey);

  try {
    const numbers = await client.generateIntegers(count, min, max);
    const numbers0 = numbers.map(val => (typeof val === 'number' ? val : parseInt(String(val), 10)));

    if (!numbers || !Array.isArray(numbers)) {
      logger.warn("Random.org API returned invalid data", {
        service: "random.org",
        operation: "generateIntegers",
        duration_ms: Date.now() - startTime,
      });
      return null;
    }

    if (numbers0.some(Number.isNaN)) {
      logger.error("Random.org API returned non-numeric strings");
      return null;
    }

    logger.debug("Random.org integers generated", {
      service: "random.org",
      operation: "generateIntegers",
      count: numbers0.length,
      duration_ms: Date.now() - startTime,
    });

    return numbers0;
  } catch (error) {
    const isRandomOrgError = error instanceof RandomOrgRANDOMORGError;
    logger.warn("Random.org API request failed", {
      service: "random.org",
      operation: "generateIntegers",
      error: {
        message: error instanceof Error ? error.message : String(error),
        code: isRandomOrgError ? "randomorg" : "unknown",
      },
      duration_ms: Date.now() - startTime,
    });

    return null;
  }
};
