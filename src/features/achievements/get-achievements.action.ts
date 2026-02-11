import type { AchievementDal, AchievementDoc } from "@/entities/achievement";
import type { CockDal } from "@/entities/cock";
import { getAuthUser } from "@/shared/context";
import { di } from "@/shared/injection";
import { fromDate, isSameMoscowDay, moscowNow, toDate } from "@/shared/lib/datetime";
import { logger } from "@/shared/lib/logger";
import { createTicker } from "@/shared/lib/profiling";
import type { AchBulkResult } from "./db/pipelines";
import { pAchBulk, pAchLightning, pCountSeasons } from "./db/pipelines";
import { ALL_ACHIEVEMENTS } from "./lib/catalog";
import type { CockAchievementsResponse } from "./types";

const val = <T extends Record<string, unknown>>(arr: T[], key: keyof T, fallback = 0): number => (arr[0]?.[key] as number) ?? fallback;

export const createGetAchievementsAction = (cockDal: CockDal, achievementDal: AchievementDal) => {
  const getAchievements = async (): Promise<CockAchievementsResponse> => {
    const ticker = createTicker();
    const userId = getAuthUser().id;
    const now = toDate(moscowNow());

    const userAchievements = await achievementDal.findByUserId(userId);

    if (userAchievements.length > 0) {
      const lastChecked = (userAchievements[0] as AchievementDoc).last_checked_at;
      if (lastChecked && isSameMoscowDay(lastChecked, now)) {
        logger.info("Achievements from cache", { service: "cocks", operation: "getAchievements", user_id: userId, duration_ms: ticker() });
        return formatResponse(userAchievements);
      }
    }

    const thirtyOneDaysAgo = toDate(fromDate(now).subtract({ days: 31 }));

    const [bulkResults, lightningResult, seasonResult] = await Promise.all([
      cockDal.aggregate<AchBulkResult>(pAchBulk(userId, thirtyOneDaysAgo)),
      cockDal.aggregate<{ count: number }>(pAchLightning(userId)),
      cockDal.aggregate<{ count: number }>(pCountSeasons(userId)),
    ]);

    const bulk = bulkResults[0];
    if (!bulk) {
      await updateAllLastChecked(achievementDal, userId, now);
      logger.info("Achievements checked (no cocks)", { service: "cocks", operation: "getAchievements", user_id: userId, duration_ms: ticker() });
      return formatResponse([]);
    }

    const achievementMap = new Map(userAchievements.map((a) => [a.achievement_id, a]));
    const updates: Promise<unknown>[] = [];

    const update = (achId: string, completed: boolean, progress: number) => {
      const existing = achievementMap.get(achId);
      if (existing?.completed) return;

      updates.push(
        achievementDal.upsert(userId, achId, {
          user_id: userId,
          achievement_id: achId,
          completed,
          completed_at: completed && !existing?.completed ? now : existing?.completed_at,
          progress,
          last_checked_at: now,
        })
      );
    };

    const pullCount = val(bulk.totalPulls, "count");
    update("not_rubbed_yet", pullCount >= 10, Math.min(pullCount, 10));
    update("diary", pullCount >= 31, Math.min(pullCount, 31));
    update("skillful_hands", pullCount >= 100, Math.min(pullCount, 100));
    update("anniversary", pullCount >= 365, Math.min(pullCount, 365));
    update("wonder_stranger", pullCount >= 500, Math.min(pullCount, 500));
    update("bazooka_hands", pullCount >= 1000, Math.min(pullCount, 1000));
    update("annihilator_cannon", pullCount >= 5000, Math.min(pullCount, 5000));

    const totalSizeValue = val(bulk.totalSize, "total");
    update("golden_hundred", totalSizeValue >= 100, Math.min(totalSizeValue, 100));
    update("solid_thousand", totalSizeValue >= 1000, Math.min(totalSizeValue, 1000));
    update("five_k", totalSizeValue >= 5000, Math.min(totalSizeValue, 5000));
    update("golden_cock", totalSizeValue >= 10000, Math.min(totalSizeValue, 10000));
    update("cosmic_cock", totalSizeValue >= 20000, Math.min(totalSizeValue, 20000));
    update("greek_myth", totalSizeValue >= 30000, Math.min(totalSizeValue, 30000));

    update("sniper", val(bulk.sniper30, "count") >= 5, Math.min(val(bulk.sniper30, "count"), 5));
    update("half_hundred", val(bulk.halfHundred50, "count") >= 1, Math.min(val(bulk.halfHundred50, "count"), 1));
    update("maximalist", val(bulk.maximalist61, "count") >= 10, Math.min(val(bulk.maximalist61, "count"), 10));
    update("number_collector", val(bulk.beautifulNumbers, "count") >= 5, Math.min(val(bulk.beautifulNumbers, "count"), 5));

    const maxSizeVal = bulk.maxSize[0]?.max ?? -1;
    const minSizeVal = bulk.minSize[0]?.min ?? 1;
    update("everest", maxSizeVal === 61, maxSizeVal === -1 ? 0 : maxSizeVal);
    update("mariana_trench", minSizeVal === 0, minSizeVal);

    update("early_bird", val(bulk.earlyBird, "count") >= 20, Math.min(val(bulk.earlyBird, "count"), 20));
    update("speedrunner", val(bulk.speedrunner, "count") >= 5, Math.min(val(bulk.speedrunner, "count"), 5));
    update("midnight_puller", val(bulk.midnightPuller, "count") >= 10, Math.min(val(bulk.midnightPuller, "count"), 10));

    update("valentine", val(bulk.valentine, "count") >= 1, val(bulk.valentine, "count"));
    update("new_year_gift", val(bulk.newYearGift, "count") >= 1, val(bulk.newYearGift, "count"));
    update("mens_solidarity", val(bulk.mensSolidarity, "count") >= 1, val(bulk.mensSolidarity, "count"));
    update("friday_13th", val(bulk.friday13th, "count") >= 1, val(bulk.friday13th, "count"));
    update("leap_cock", val(bulk.leapCock, "count") >= 1, val(bulk.leapCock, "count"));

    update("lightning", val(lightningResult, "count") >= 1, val(lightningResult, "count"));

    checkSequences(bulk.recent10, update);
    checkCollections(bulk.last31, update);
    checkRecent3(bulk.recent3, update);

    const seasonsCount = val(seasonResult, "count");
    update("oldtimer", seasonsCount >= 3, Math.min(seasonsCount, 3));
    update("veteran", seasonsCount >= 5, Math.min(seasonsCount, 5));
    update("keeper", seasonsCount >= 10, Math.min(seasonsCount, 10));

    const uniqueSizes = val(bulk.traveler, "unique_sizes");
    update("traveler", uniqueSizes >= 61, Math.min(uniqueSizes, 61));

    const moscoviteCount = val(bulk.moscovite, "count");
    update("moscovite", moscoviteCount >= 5, Math.min(moscoviteCount, 5));

    await Promise.all(updates);

    const updatedAchievements = await achievementDal.findByUserId(userId);
    logger.info("Achievements checked", { service: "cocks", operation: "getAchievements", user_id: userId, count: updatedAchievements.length, duration_ms: ticker() });
    return formatResponse(updatedAchievements);
  };

  return getAchievements;
};

createGetAchievementsAction.inject = [di.cockDal, di.achievementDal] as const;

type UpdateFn = (achId: string, completed: boolean, progress: number) => void;

const s = (arr: number[], i: number): number => arr[i] as number;

const checkSequences = (recent10: { size: number }[], update: UpdateFn) => {
  const sizes = recent10.map((r) => r.size);

  if (sizes.length >= 2) {
    const last = sizes.length - 1;
    const eq = s(sizes, last) === s(sizes, last - 1);
    update("deja_vu", eq, eq ? 2 : 1);
  }

  for (let i = 0; i <= sizes.length - 3; i++) {
    if (s(sizes, i) === s(sizes, i + 1) && s(sizes, i + 1) === s(sizes, i + 2)) {
      update("triple", true, 3);
      if (i <= sizes.length - 4 && s(sizes, i + 2) === s(sizes, i + 3)) {
        update("poker", true, 4);
        if (i <= sizes.length - 5 && s(sizes, i + 3) === s(sizes, i + 4)) {
          update("diamond_eye", true, 5);
        }
      }
    }
  }

  if (sizes.length >= 5) {
    for (let start = sizes.length - 5; start >= 0; start--) {
      let allGrowth = true;
      let allDecline = true;
      for (let i = start + 1; i < start + 5; i++) {
        if (s(sizes, i) <= s(sizes, i - 1)) allGrowth = false;
        if (s(sizes, i) >= s(sizes, i - 1)) allDecline = false;
      }
      if (allGrowth) update("bull_trend", true, 5);
      if (allDecline) update("bear_market", true, 5);
    }
  }

  if (sizes.length >= 5) {
    const last5 = sizes.slice(-5);
    update(
      "freeze",
      last5.every((v) => v < 20),
      last5.filter((v) => v < 20).length
    );
  }

  if (sizes.length >= 7) {
    const last7 = sizes.slice(-7);
    update(
      "diamond_hands",
      last7.every((v) => v >= 40),
      last7.filter((v) => v >= 40).length
    );
  }

  if (sizes.length >= 10) {
    let turtleCount = 0;
    for (let i = 1; i < 10; i++) {
      if (Math.abs(s(sizes, i) - s(sizes, i - 1)) < 5) turtleCount++;
    }
    update("turtle", turtleCount >= 9, turtleCount);
  }
};

const checkCollections = (last31: { size: number }[], update: UpdateFn) => {
  if (last31.length < 31) return;

  const sizeSet = new Set(last31.map((r) => r.size));

  const rounders = [10, 20, 30, 40, 50, 60];
  const rounderCount = rounders.filter((v) => sizeSet.has(v)).length;
  update("rounder", rounderCount === 6, rounderCount);

  const fibs = [1, 2, 3, 5, 8, 13, 21, 34, 55];
  const fibCount = fibs.filter((v) => sizeSet.has(v)).length;
  update("fibonacci_father", fibCount === 9, fibCount);
};

const checkRecent3 = (recent3: { size: number; requested_at: Date }[], update: UpdateFn) => {
  if (recent3.length < 3) return;
  const r0 = recent3[0] as { size: number; requested_at: Date };
  const r1 = recent3[1] as { size: number; requested_at: Date };
  const r2 = recent3[2] as { size: number; requested_at: Date };

  if (r2.size === r0.size + r1.size) {
    update("sum_of_previous", true, 1);
  }

  if (r1.size >= 60 && r2.size <= 3) {
    update("contrast_shower", true, 1);
  }

  const [a, b, c] = [r0.size, r1.size, r2.size];
  if (a > 0 && b > 0 && c > 0) {
    const isPythagorean = a * a + b * b === c * c || a * a + c * c === b * b || b * b + c * c === a * a;
    if (isPythagorean) update("pythagoras", true, 1);
  }

  if (r1.size === 13 && r2.size === 37) {
    update("leet_speak", true, 1);
  }

  const moscow = fromDate(r2.requested_at);
  const hour = moscow.hour;
  const minute = moscow.minute;
  const day = moscow.day;

  if (minute === r2.size) update("minute_precision", true, 1);
  if (hour === r2.size) update("hour_precision", true, 1);
  if (day === r2.size) update("day_equals_size", true, 1);
};

const formatResponse = (userAchievements: AchievementDoc[]): CockAchievementsResponse => {
  const achievementMap = new Map(userAchievements.map((a) => [a.achievement_id, a]));

  const result = ALL_ACHIEVEMENTS.map((ach) => {
    const userAch = achievementMap.get(ach.id);
    return {
      id: ach.id,
      emoji: ach.emoji,
      respects: ach.respects,
      completed: userAch?.completed ?? false,
      progress: userAch?.progress,
      max_progress: ach.maxProgress,
    };
  });

  result.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? -1 : 1;
    return 0;
  });

  return { achievements: result };
};

const updateAllLastChecked = async (achievementDal: AchievementDal, userId: number, now: Date) => {
  const placeholder = ALL_ACHIEVEMENTS[0];
  if (placeholder) {
    await achievementDal.upsert(userId, placeholder.id, {
      user_id: userId,
      achievement_id: placeholder.id,
      completed: false,
      progress: 0,
      last_checked_at: now,
    });
  }
};
