import type { Db } from "mongodb";
import mongoose from "mongoose";
import { config } from "@/cfg";
import { createTicker, logger } from "@/log";
import { once } from "@/snc/once";

export const mongo = once(
  async (): Promise<Db> => {
    const ticker = createTicker();
    const url = (await config()).svc.db.mongo.url;

    try {
      logger.info("Connecting to MongoDB", { service: "mongo", operation: "connect" });

      await mongoose.connect(url, {
        maxPoolSize: 127,
        minPoolSize: 2,
        timeoutMS: 1000,
        compressors: "none",
        appName: "dickobrazz-server",
        retryReads: true,
        retryWrites: true,
        serverSelectionTimeoutMS: 5000,
      });

      const connectionDb = mongoose.connection.db;
      if (!connectionDb) throw new Error("MongoDB connection has no db");

      logger.info("MongoDB connected", { service: "mongo", operation: "connect", duration_ms: ticker() });

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
  },
  { cachePromise: true }
);

export const closeMongo = async (): Promise<void> => {
  if (!mongo.called()) return;

  const ticker = createTicker();

  try {
    await mongoose.disconnect();
    mongo.reset();
    logger.info("MongoDB connection closed", { service: "mongo", operation: "close", duration_ms: ticker() });
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
