import type { Db } from "mongodb";
import mongoose from "mongoose";
import type { AppConfig } from "@/shared/config/schema";
import { di } from "@/shared/injection";
import { logger } from "@/shared/lib/logger";
import { createTicker } from "@/shared/lib/profiling";

export const mongo = async (config: AppConfig): Promise<Db> => {
  const ticker = createTicker();
  const url = config.svc.db.mongo.url;

  try {
    logger.info("Connecting to MongoDB", { service: "mongo", operation: "connect" });

    await mongoose.connect(url, {
      maxPoolSize: 30,
      minPoolSize: 2,
      timeoutMS: 5000,
      compressors: "none",
      appName: "dickobrazz-server",
      retryReads: true,
      retryWrites: true,
      serverSelectionTimeoutMS: 5000,
    });

    const connectionDb = mongoose.connection.db;
    if (!connectionDb) throw new Error("MongoDB connection has no db");

    logger.info("MongoDB connected", {
      service: "mongo",
      operation: "connect",
      duration_ms: ticker(),
    });

    return connectionDb;
  } catch (error) {
    logger.error("MongoDB connection failed", {
      service: "mongo",
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

mongo.inject = [di.config] as const;

export type Mongo = Awaited<ReturnType<typeof mongo>>;

export const closeMongo = async (): Promise<void> => {
  if (mongoose.connection.readyState === 0) return;

  const ticker = createTicker();

  try {
    await mongoose.disconnect();
    logger.info("MongoDB connection closed", {
      service: "mongo",
      operation: "close",
      duration_ms: ticker(),
    });
  } catch (error) {
    logger.error("MongoDB close failed", {
      service: "mongo",
      operation: "close",
      duration_ms: ticker(),
      error: {
        message: error instanceof Error ? error.message : String(error),
      },
    });
  }
};
