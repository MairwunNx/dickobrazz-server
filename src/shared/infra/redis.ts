import { RedisClient } from "bun";
import type { AppConfig } from "@/shared/config/schema";
import { di } from "@/shared/injection";
import { logger } from "@/shared/lib/logger";
import { createTicker } from "@/shared/lib/profiling";

let _client: RedisClient | null = null;

export const redis = async (config: AppConfig): Promise<RedisClient> => {
  const ticker = createTicker();
  const url = config.svc.db.redis.url;

  try {
    logger.info("Connecting to Redis", { service: "redis", operation: "connect" });

    _client = new RedisClient(url, { connectionTimeout: 5000 });
    await _client.ping();

    logger.info("Redis connected", {
      service: "redis",
      operation: "connect",
      duration_ms: ticker(),
    });

    return _client;
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
};

redis.inject = [di.config] as const;

export type Redis = Awaited<ReturnType<typeof redis>>;

export const closeRedis = async (): Promise<void> => {
  if (!_client) return;

  const ticker = createTicker();

  try {
    _client.close?.();
    _client = null;
    logger.info("Redis connection closed", {
      service: "redis",
      operation: "close",
      duration_ms: ticker(),
    });
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
