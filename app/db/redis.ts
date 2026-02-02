import { RedisClient } from "bun";
import { config } from "@/cfg";
import { createTicker, logger } from "@/log";
import { once } from "@/snc/once";

export const redis = once(
  async (): Promise<RedisClient> => {
    const ticker = createTicker();
    const url = (await config()).svc.db.redis.url;

    try {
      logger.info("Connecting to Redis", { service: "redis", operation: "connect" });

      const client = new RedisClient(url, { connectionTimeout: 5000 });
      await client.ping();

      logger.info("Redis connected", { service: "redis", operation: "connect", duration_ms: ticker() });

      return client;
    } catch (error) {
      logger.error("Redis connection failed", {
        service: "redis",
        operation: "connect",
        duration_ms: ticker(),
        error: {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        },
      });
      throw error;
    }
  },
  { cachePromise: true }
);

export const closeRedis = async (): Promise<void> => {
  if (!redis.called()) return;
  const ticker = createTicker();

  try {
    const client = await redis();
    client.close?.();
    redis.reset();
    logger.info("Redis connection closed", { service: "redis", operation: "close", duration_ms: ticker() });
  } catch (error) {
    logger.error("Redis close failed", {
      service: "redis",
      operation: "close",
      duration_ms: ticker(),
      error: {
        message: error instanceof Error ? error.message : String(error),
      },
    });
  }
};
