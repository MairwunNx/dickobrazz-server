import type { RedisClient } from "bun";
import { config } from "@/shared/config/config";
import { mongo } from "@/shared/infra/mongo";
import { redis } from "@/shared/infra/redis";
import { di } from "@/shared/injection";
import { getTtlToMoscowMidnight } from "@/shared/lib/datetime";
import { logger } from "@/shared/lib/logger";
import { createContainer } from "./container";
import { startServer } from "./server/serve";

const SCAN_BATCH = 200;
const RULER_KEY = "ruler:daily";

const migrateRulerZset = async (redisClient: RedisClient): Promise<void> => {
  const exists = await redisClient.exists(RULER_KEY);
  if (exists) return;

  const allKeys: string[] = [];
  let cursor = "0";

  do {
    const [nextCursor, keys] = await redisClient.scan(cursor, "MATCH", "cock_size:*", "COUNT", SCAN_BATCH);
    cursor = nextCursor;
    allKeys.push(...keys);
  } while (cursor !== "0");

  if (allKeys.length === 0) return;

  const values = await redisClient.mget(...allKeys);
  const args: (string | number)[] = [];

  for (let i = 0; i < allKeys.length; i++) {
    const value = values[i];
    const key = allKeys[i];
    if (value && key) {
      try {
        const parsed = JSON.parse(value);
        const userId = key.replace("cock_size:", "");
        args.push(String(parsed.size), userId);
      } catch {}
    }
  }

  if (args.length === 0) return;

  await redisClient.zadd(RULER_KEY, ...args);
  await redisClient.expire(RULER_KEY, getTtlToMoscowMidnight());

  logger.info("Migrated cock_size keys to ruler ZSET", {
    service: "migration",
    operation: "migrateRulerZset",
    entries: args.length / 2,
  });
};

export const initialize = async (): Promise<void> => {
  const cfg = await config();

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    throw new Error("TELEGRAM_BOT_TOKEN is required");
  }

  const mongoDb = await mongo(cfg);
  const redisClient = await redis(cfg);

  const container = createContainer(cfg, botToken, mongoDb, redisClient);

  logger.info("DI container assembled", {
    service: "container",
    operation: "create",
  });

  await Promise.all([di.userDal, di.cockDal, di.achievementDal].map((token) => container.resolve(token).syncIndexes()));

  logger.info("Indexes synced", {
    service: "mongo",
    operation: "sync_indexes",
  });

  await migrateRulerZset(redisClient);

  await startServer(container);
};
