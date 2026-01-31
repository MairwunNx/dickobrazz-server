import mongoose from "mongoose";
import { getRedis } from "@/db/redis";
import type { HealthResponse, HealthStatus } from "@/dto/health";
import { createTicker, logger } from "@/log";

const startTime = Date.now();

const checkMongo = async (): Promise<HealthStatus> => {
  const ticker = createTicker();

  try {
    const db = mongoose.connection.db;
    if (!db) return "down";
    await db.command({ ping: 1 });
    logger.debug("MongoDB health check passed", {
      service: "health",
      operation: "checkMongo",
      duration_ms: ticker(),
    });
    return "ok";
  } catch (error) {
    logger.error("MongoDB health check failed", {
      service: "health",
      operation: "checkMongo",
      duration_ms: ticker(),
      error: { message: error instanceof Error ? error.message : String(error) },
    });
    return "down";
  }
};

const checkRedis = async (): Promise<HealthStatus> => {
  const ticker = createTicker();

  try {
    await getRedis().ping();
    logger.debug("Redis health check passed", {
      service: "health",
      operation: "checkRedis",
      duration_ms: ticker(),
    });
    return "ok";
  } catch (error) {
    logger.error("Redis health check failed", {
      service: "health",
      operation: "checkRedis",
      duration_ms: ticker(),
      error: { message: error instanceof Error ? error.message : String(error) },
    });
    return "down";
  }
};

export const check = async (): Promise<HealthResponse> => {
  const ticker = createTicker();

  const [mongoStatus, redisStatus] = await Promise.all([checkMongo(), checkRedis()]);

  const versionFile = Bun.file(".version");
  const version = (await versionFile.text()).trim();
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  const overallStatus: HealthStatus = mongoStatus === "ok" && redisStatus === "ok" ? "ok" : mongoStatus === "down" || redisStatus === "down" ? "down" : "degraded";

  logger.debug("Health check completed", {
    service: "health",
    operation: "check",
    status: overallStatus,
    duration_ms: ticker(),
  });

  return {
    status: overallStatus,
    version,
    uptime,
    components: {
      mongo: mongoStatus,
      redis: redisStatus,
    },
  };
};
