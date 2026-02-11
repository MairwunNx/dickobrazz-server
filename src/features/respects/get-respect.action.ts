import type { AchievementDal } from "@/entities/achievement";
import { ALL_ACHIEVEMENTS } from "@/entities/achievement/lib/catalog";
import type { CockDal } from "@/entities/cock";
import { getAuthUser } from "@/shared/context";
import { di } from "@/shared/injection";
import { getAllSeasons } from "@/shared/lib/seasons";
import type { AggSeasonPosition } from "./db/pipelines";
import { pFirstCockDate, pUserPositionsInSeasons, toSeasonRanges } from "./db/pipelines";
import { calcSeasonRespect } from "./lib/calc";
import type { RespectResponse } from "./types";

const achievementRespectMap = new Map(ALL_ACHIEVEMENTS.map((a) => [a.id, a.respects]));

export const createGetRespectAction = (cockDal: CockDal, achievementDal: AchievementDal) => async (): Promise<RespectResponse> => {
  const userId = getAuthUser().id;

  const [firstCockResult, userAchievements] = await Promise.all([cockDal.aggregate<{ first_date: Date }>(pFirstCockDate()), achievementDal.findByUserId(userId)]);

  // Респект за ачивки
  let achievementRespect = 0;
  for (const ach of userAchievements) {
    if (ach.completed) {
      achievementRespect += achievementRespectMap.get(ach.achievement_id) ?? 0;
    }
  }

  // Респект за сезоны
  let seasonRespect = 0;
  const firstCock = firstCockResult[0];
  if (firstCock) {
    const seasons = getAllSeasons(firstCock.first_date);
    const ranges = toSeasonRanges(seasons);

    if (ranges.length > 0) {
      const positions = await cockDal.aggregate<AggSeasonPosition>(pUserPositionsInSeasons(userId, ranges));
      for (const { position } of positions) {
        seasonRespect += calcSeasonRespect(position);
      }
    }
  }

  return {
    season_respect: seasonRespect,
    achievement_respect: achievementRespect,
    total_respect: seasonRespect + achievementRespect,
  };
};

createGetRespectAction.inject = [di.cockDal, di.achievementDal] as const;
