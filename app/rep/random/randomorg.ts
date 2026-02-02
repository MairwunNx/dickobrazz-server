import RandomOrg from "random-org";
import { config } from "@/cfg";
import { logger } from "@/log";
import { createTicker } from "@/log/timing";
import { once } from "@/snc/once";

const client = once(async () => new RandomOrg({ apiKey: (await config()).svc.rnd.rndorg.token ?? "похуй" }), { cachePromise: true });

export const trng = async (min: number, max: number): Promise<number | null> => {
  const ticker = createTicker();
  const instance = await client();

  try {
    const response = await instance.generateIntegers({ n: 1, min, max });
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
      error: {
        message: errorMessage,
        code: errorCode,
      },
      duration_ms: ticker(),
    });

    return null;
  }
};
