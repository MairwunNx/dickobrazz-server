import RandomOrg from "random-org";
import { getConfig } from "@/cfg";
import { logger } from "@/log";

let activeClient: RandomOrg | null = null;

export const generateRandomOrgIntegers = async (min: number, max: number, count = 1): Promise<number[] | null> => {
  const startTime = Date.now();
  if (!activeClient) {
    activeClient = new RandomOrg({ apiKey: getConfig().svc.rnd.rndorg.token ?? "похуй" });
  }
  const client = activeClient;

  try {
    const response = await client.generateIntegers({ n: count, min, max });
    const rawNumbers = response?.random?.data;
    const numbers0 = Array.isArray(rawNumbers) ? rawNumbers.map((val) => (typeof val === "number" ? val : parseInt(String(val), 10))) : null;

    if (!numbers0) {
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
    const errorCode = error && typeof error === "object" && "code" in error ? String((error as { code: unknown }).code) : "unknown";
    logger.warn("Random.org API request failed", {
      service: "random.org",
      operation: "generateIntegers",
      error: {
        message: error instanceof Error ? error.message : String(error),
        code: errorCode,
      },
      duration_ms: Date.now() - startTime,
    });

    return null;
  }
};
