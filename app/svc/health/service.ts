import mongoose from "mongoose";
import { getRedis } from "@/db/redis";
import type { HealthResponse, HealthStatus } from "@/dto/health";
import { logger } from "@/log";

const startTime = Date.now();

const checkMongo = async (): Promise<HealthStatus> => {
  try {
    const db = mongoose.connection.db;
    if (!db) return "down";
    await db.command({ ping: 1 });
    return "ok";
  } catch (error) {
    logger.error("MongoDB health check failed", {
      service: "health",
      operation: "checkMongo",
      error: { message: error instanceof Error ? error.message : String(error) },
    });
    return "down";
  }
};

const checkRedis = async (): Promise<HealthStatus> => {
  try {
    await getRedis().ping();
    return "ok";
  } catch (error) {
    logger.error("Redis health check failed", {
      service: "health",
      operation: "checkRedis",
      error: { message: error instanceof Error ? error.message : String(error) },
    });
    return "down";
  }
};

export const check = async (): Promise<HealthResponse> => {
  const [mongoStatus, redisStatus] = await Promise.all([checkMongo(), checkRedis()]);

  const versionFile = Bun.file(".version");
  const version = (await versionFile.text()).trim();
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  const overallStatus: HealthStatus = mongoStatus === "ok" && redisStatus === "ok" ? "ok" : mongoStatus === "down" || redisStatus === "down" ? "down" : "degraded";

  logger.debug("Health check completed", {
    service: "health",
    operation: "check",
    status: overallStatus,
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
