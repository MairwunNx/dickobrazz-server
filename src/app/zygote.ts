import type { PipelineStage } from "mongoose";
import { config } from "@/shared/config/config";
import { mongo } from "@/shared/infra/mongo";
import { redis } from "@/shared/infra/redis";
import { di } from "@/shared/injection";
import { logger } from "@/shared/lib/logger";
import { createTicker } from "@/shared/lib/profiling";
import type { Container } from "./container";
import { createContainer } from "./container";
import { startServer } from "./server/serve";

const backfillUsernames = async (container: Container): Promise<void> => {
  const ticker = createTicker();
  const cockDal = container.resolve(di.cockDal);
  const userDal = container.resolve(di.userDal);

  const pipeline: PipelineStage[] = [{ $sort: { requested_at: 1 } }, { $group: { _id: "$user_id", nickname: { $last: "$nickname" } } }, { $match: { nickname: { $ne: "" } } }];

  const entries = await cockDal.aggregate<{ _id: number; nickname: string }>(pipeline);
  if (entries.length === 0) return;

  const result = await userDal.backfillUsernames(entries.map((e) => ({ userId: e._id, username: e.nickname })));

  logger.info("Usernames backfilled from cocks", {
    service: "migration",
    operation: "backfill_usernames",
    total: entries.length,
    modified: result.modifiedCount,
    upserted: result.upsertedCount,
    duration_ms: ticker(),
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

  await backfillUsernames(container);

  await startServer(container);
};
