import type { RedisClient } from "bun";
import type { CockDal } from "@/entities/cock";
import { getAuthUser } from "@/shared/context";
import { di } from "@/shared/injection";
import { computeHash } from "@/shared/lib/crypto";
import { getMoscowDate, getTtlToMoscowMidnight } from "@/shared/lib/datetime";
import { logger } from "@/shared/lib/logger";
import { createTicker } from "@/shared/lib/profiling";
import type { Random } from "@/shared/lib/random";
import type { CockSizeResponse, GetSizeParams } from "./types";

export const createGenerateSizeAction =
  (cockDal: CockDal, redis: RedisClient, random: Random) =>
  async (params: GetSizeParams): Promise<CockSizeResponse> => {
    const ticker = createTicker();
    const cacheKey = `cock_size:${params.user_id}`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      logger.info("Cock size from cache", {
        service: "cocks",
        operation: "getOrGenerateSize",
        user_id: params.user_id,
        size: parsed.size,
        duration_ms: ticker(),
      });
      return { size: parsed.size, hash: parsed.hash, salt: parsed.salt };
    }

    const size = await random(0, 61);
    const nickname = getAuthUser().username ?? "";

    await cockDal.create({
      _id: crypto.randomUUID(),
      size,
      nickname,
      user_id: params.user_id,
      requested_at: getMoscowDate(),
    });

    const salt = crypto.randomUUID();
    const hash = computeHash(salt, size);

    const ttl = getTtlToMoscowMidnight();
    const cacheValue = JSON.stringify({ user_id: params.user_id, user_name: nickname, size, hash, salt });

    try {
      await redis.set(cacheKey, cacheValue);
      await redis.expire(cacheKey, ttl);
    } catch (error) {
      logger.error("Failed to cache cock size in Redis", {
        service: "cocks",
        operation: "cacheSize",
        user_id: params.user_id,
        error: { message: error instanceof Error ? error.message : String(error) },
      });
    }

    logger.info("Cock size generated", {
      service: "cocks",
      operation: "getOrGenerateSize",
      user_id: params.user_id,
      size,
      duration_ms: ticker(),
    });

    return { size, hash, salt };
  };

createGenerateSizeAction.inject = [di.cockDal, di.redis, di.random] as const;
