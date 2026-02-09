import type { RedisClient } from "bun";
import mongoose from "mongoose";
import { di } from "@/shared/injection";
import { logger } from "@/shared/lib/logger";
import { createTicker } from "@/shared/lib/profiling";
import type { HealthResponse, HealthStatus } from "./types";

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

const checkRedis = async (client: RedisClient): Promise<HealthStatus> => {
  const ticker = createTicker();
  try {
    await client.ping();
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

export const createCheckAction = (redis: RedisClient) => async (): Promise<HealthResponse> => {
  const ticker = createTicker();

  const [mongoStatus, redisStatus] = await Promise.all([checkMongo(), checkRedis(redis)]);

  const versionFile = Bun.file(".version");
  const version = (await versionFile.text()).trim();
  const uptimeSec = Math.floor((Date.now() - startTime) / 1000);
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
    uptime_sec: uptimeSec,
    checks: { mongo: mongoStatus, redis: redisStatus },
  };
};

createCheckAction.inject = [di.redis] as const;
