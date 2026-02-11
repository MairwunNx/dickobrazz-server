import type { PipelineStage } from "mongoose";
import type { CockSeason } from "@/shared/lib/seasons";

// ===========================================
// Результаты агрегаций
// ===========================================

interface SeasonRange {
  start: Date;
  end: Date;
  season_num: number;
}

export interface AggSeasonPosition {
  season_num: number;
  position: number;
}

// ===========================================
// Пайплайны
// ===========================================

/**
 * Позиция пользователя в каждом завершённом сезоне (1-based).
 * Возвращает массив { season_num, position } только для сезонов, где юзер участвовал.
 */
export const pUserPositionsInSeasons = (userId: number, completedSeasons: SeasonRange[]): PipelineStage[] => {
  if (completedSeasons.length === 0) return [{ $limit: 0 }];

  const first = completedSeasons[0];
  const last = completedSeasons[completedSeasons.length - 1];
  if (!first || !last) return [{ $limit: 0 }];

  const thenKey = "then";
  const branches = completedSeasons.map((s) => ({
    case: { $and: [{ $gte: ["$requested_at", s.start] }, { $lt: ["$requested_at", s.end] }] },
    [thenKey]: s.season_num,
  }));

  return [
    { $match: { requested_at: { $gte: first.start, $lt: last.end } } },
    { $addFields: { season_num: { $switch: { branches, default: null } } } },
    { $match: { season_num: { $ne: null } } },
    { $group: { _id: { season_num: "$season_num", user_id: "$user_id" }, total_size: { $sum: "$size" } } },
    { $sort: { "_id.season_num": 1, total_size: -1 } },
    { $group: { _id: "$_id.season_num", users: { $push: { user_id: "$_id.user_id", total_size: "$total_size" } } } },
    {
      $project: {
        _id: 0,
        season_num: "$_id",
        position: {
          $add: [{ $indexOfArray: ["$users.user_id", userId] }, 1],
        },
      },
    },
    // position=0 означает юзер не найден (indexOfArray вернул -1, +1 = 0)
    { $match: { position: { $gt: 0 } } },
  ];
};

export const toSeasonRanges = (seasons: CockSeason[]): SeasonRange[] =>
  seasons
    .filter((s) => !s.is_active)
    .map((s) => ({
      start: new Date(s.start_date),
      end: new Date(s.end_date),
      season_num: s.season_num,
    }));

/** Дата первого кока в коллекции. */
export const pFirstCockDate = (): PipelineStage[] => [{ $sort: { requested_at: 1 } }, { $limit: 1 }, { $project: { _id: 0, first_date: "$requested_at" } }];
