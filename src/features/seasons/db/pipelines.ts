import type { PipelineStage } from "mongoose";

// ===========================================
// Результаты агрегаций
// ===========================================

export interface AggWinner {
  _id: number;
  total_size: number;
  nickname: string;
}

// ===========================================
// Пайплайны
// ===========================================

/** Топ-3 победителя сезона по суммарному размеру. */
export const pSeasonWinners = (startDate: Date, endDate: Date): PipelineStage[] => [
  { $match: { requested_at: { $gte: startDate, $lt: endDate } } },
  { $group: { _id: "$user_id", total_size: { $sum: "$size" }, nickname: { $first: "$nickname" } } },
  { $sort: { total_size: -1 } },
  { $limit: 3 },
];

/** Количество уникальных пользователей, участвовавших в сезоне. */
export const pSeasonCockersCount = (startDate: Date, endDate: Date): PipelineStage[] => [
  { $match: { requested_at: { $gte: startDate, $lt: endDate } } },
  { $group: { _id: "$user_id" } },
  { $count: "total" },
];

/** Позиция пользователя в сезоне (1-based). */
export const pUserPositionInSeason = (userId: number, startDate: Date, endDate: Date): PipelineStage[] => [
  { $match: { requested_at: { $gte: startDate, $lt: endDate } } },
  { $group: { _id: "$user_id", total_size: { $sum: "$size" } } },
  { $sort: { total_size: -1 } },
  { $group: { _id: null, users: { $push: { user_id: "$_id", total_size: "$total_size" } } } },
  { $unwind: { path: "$users", includeArrayIndex: "position" } },
  { $match: { "users.user_id": userId } },
  { $project: { _id: 0, position: { $add: ["$position", 1] } } },
];

/** Окно из 3 позиций вокруг указанной в сезоне (соседи). */
export const pNeighborhoodInSeason = (position: number, startDate: Date, endDate: Date): PipelineStage[] => {
  const skip = Math.max(position - 2, 0);
  return [
    { $match: { requested_at: { $gte: startDate, $lt: endDate } } },
    { $group: { _id: "$user_id", total_size: { $sum: "$size" }, nickname: { $first: "$nickname" } } },
    { $sort: { total_size: -1 } },
    { $skip: skip },
    { $limit: 3 },
  ];
};

/** Дата первого кока в коллекции (начало истории). */
export const pFirstCockDate = (): PipelineStage[] => [{ $sort: { requested_at: 1 } }, { $limit: 1 }, { $project: { _id: 0, first_date: "$requested_at" } }];

interface CompletedSeasonRange {
  start: Date;
  end: Date;
  season_num: number;
}

/**
 * Считает количество завершённых сезонов, в которых userId входил в топ-3.
 */
export const pUserSeasonWins = (userId: number, completedSeasons: CompletedSeasonRange[]): PipelineStage[] => {
  if (completedSeasons.length === 0) return [{ $limit: 0 }, { $count: "wins" }];

  const first = completedSeasons[0];
  const last = completedSeasons[completedSeasons.length - 1];
  if (!first || !last) return [{ $limit: 0 }, { $count: "wins" }];

  const thenKey = "then";
  const switchBranches = completedSeasons.map((s) => ({
    case: { $and: [{ $gte: ["$requested_at", s.start] }, { $lt: ["$requested_at", s.end] }] },
    [thenKey]: s.season_num,
  }));

  return [
    { $match: { requested_at: { $gte: first.start, $lt: last.end } } },
    { $addFields: { season_num: { $switch: { branches: switchBranches, default: null } } } },
    { $match: { season_num: { $ne: null } } },
    { $group: { _id: { season_num: "$season_num", user_id: "$user_id" }, total_size: { $sum: "$size" } } },
    { $sort: { "_id.season_num": 1, total_size: -1 } },
    { $group: { _id: "$_id.season_num", top: { $push: { user_id: "$_id.user_id", total_size: "$total_size" } } } },
    { $project: { _id: 1, top: { $slice: ["$top", 3] } } },
    { $unwind: "$top" },
    { $match: { "top.user_id": userId } },
    { $count: "wins" },
  ];
};
