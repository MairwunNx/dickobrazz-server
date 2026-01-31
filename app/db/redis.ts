import { RedisClient } from "bun";
import { createTicker, logger } from "@/log";

let client: RedisClient | null = null;

const withRedisPassword = (url: string, password?: string): string => {
  if (!password) return url;

  try {
    const parsed = new URL(url);
    if (parsed.password) return url;
    parsed.password = password;
    return parsed.toString();
  } catch {
    return url;
  }
};

export const connectRedis = async (url: string, password?: string): Promise<RedisClient> => {
  if (client) return client;

  const ticker = createTicker();

  try {
    logger.info("Connecting to Redis", { service: "redis", operation: "connect" });

    const resolvedUrl = withRedisPassword(url, password);
    client = new RedisClient(resolvedUrl, { connectionTimeout: 5000 });
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
};

export const closeRedis = async (): Promise<void> => {
  if (!client) return;

  const ticker = createTicker();

  try {
    client.close?.();
    client = null;
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

export const getRedis = (): RedisClient => {
  if (!client) throw new Error("Redis not connected");
  return client;
};
