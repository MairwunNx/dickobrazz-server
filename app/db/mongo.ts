import type { Db } from "mongodb";
import mongoose from "mongoose";
import { createTicker, logger } from "@/log";

let db: Db | null = null;

export const connectMongo = async (url: string): Promise<Db> => {
  if (db) return db;

  const ticker = createTicker();

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
    db = connectionDb;

    logger.info("MongoDB connected", { service: "mongo", operation: "connect", duration_ms: ticker() });

    return db;
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

export const closeMongo = async (): Promise<void> => {
  if (!db) return;

  const ticker = createTicker();

  try {
    await mongoose.disconnect();
    db = null;
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

export const getMongo = (): Db => {
  if (!db) throw new Error("MongoDB not connected");
  return db;
};
