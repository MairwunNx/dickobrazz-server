import type { RedisClient } from "bun";
import type { CockDal } from "@/entities/cock";
import { getAuthUser } from "@/shared/context";
import { di } from "@/shared/injection";
import { computeHash } from "@/shared/lib/crypto";
import { getTtlToMoscowMidnight, moscowNow, toDate } from "@/shared/lib/datetime";
import { logger } from "@/shared/lib/logger";
import { createTicker } from "@/shared/lib/profiling";
import type { Random } from "@/shared/lib/random";
import type { CockSizeResponse } from "./types";

export const createGenerateSizeAction = (cockDal: CockDal, redis: RedisClient, random: Random) => async (): Promise<CockSizeResponse> => {
  const ticker = createTicker();
  const user = getAuthUser();
  const userId = user.id;
  const nickname = user.username ?? "";
  const cacheKey = `cock_size:${userId}`;

  const cached = await redis.get(cacheKey);
  logger.info("***************************************** Cached", { cached: cached });
  if (cached) {
    const parsed = JSON.parse(cached);
    logger.info("Cock size from cache", {
      service: "cocks",
      operation: "getOrGenerateSize",
      user_id: userId,
      size: parsed.size,
      duration_ms: ticker(),
    });
    return { size: parsed.size, hash: parsed.hash, salt: parsed.salt, pulled_at: parsed.pulled_at };
  }

  const size = await random(0, 61);

  const pulledAt = toDate(moscowNow());
  await cockDal.create({
    _id: crypto.randomUUID(),
    size,
    nickname,
    user_id: userId,
    requested_at: pulledAt,
  });

  const salt = crypto.randomUUID();
  const hash = computeHash(salt, size);
  const pulledAtISO = pulledAt.toISOString();

  const ttl = getTtlToMoscowMidnight();
  const cacheValue = JSON.stringify({ user_id: userId, user_name: nickname, size, hash, salt, pulled_at: pulledAtISO });

  try {
    await redis.set(cacheKey, cacheValue);
    await redis.expire(cacheKey, ttl);
    await redis.zadd("ruler:daily", String(size), String(userId));
    await redis.expire("ruler:daily", ttl);
  } catch (error) {
    logger.error("Failed to cache cock size in Redis", {
      service: "cocks",
      operation: "cacheSize",
      user_id: userId,
      error: { message: error instanceof Error ? error.message : String(error) },
    });
  }

  logger.info("Cock size generated", {
    service: "cocks",
    operation: "getOrGenerateSize",
    user_id: userId,
    size,
    duration_ms: ticker(),
  });

  return { size, hash, salt, pulled_at: pulledAtISO };
};

createGenerateSizeAction.inject = [di.cockDal, di.redis, di.random] as const;
