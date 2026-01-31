import { createTicker, logger } from "@/log";
import { getAchievementModel, getCockModel, getUserModel } from "./models";

export const createIndexes = async (): Promise<void> => {
  const ticker = createTicker();

  try {
    await Promise.all([getUserModel().syncIndexes(), getCockModel().syncIndexes(), getAchievementModel().syncIndexes()]);

    logger.info("MongoDB indexes created", { service: "mongo", operation: "createIndexes", duration_ms: ticker() });
  } catch (error) {
    logger.error("MongoDB indexes creation failed", {
      service: "mongo",
      operation: "createIndexes",
      duration_ms: ticker(),
      error: { message: error instanceof Error ? error.message : String(error) },
    });
    throw error;
  }
};
