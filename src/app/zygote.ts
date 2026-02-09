import { config } from "@/shared/config/config";
import { mongo } from "@/shared/infra/mongo";
import { redis } from "@/shared/infra/redis";
import { logger } from "@/shared/lib/logger";
import { createContainer } from "./container";
import { startServer } from "./server/serve";

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

  await startServer(container);
};
