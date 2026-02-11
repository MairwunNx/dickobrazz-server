import type { PipelineStage } from "mongoose";

// ===========================================
// Результаты агрегаций
// ===========================================

export interface AggLeader {
  _id: number;
  total_size: number;
}

export interface AggLeadersAndCount {
  leaders: AggLeader[];
  total: [{ count: number }] | [];
}

export interface AggUserContext {
  _id: number;
  total_size: number;
  position: number;
  above_id: number | null;
  above_size: number | null;
  below_id: number | null;
  below_size: number | null;
}

// ===========================================
// Пайплайны
// ===========================================

const dateMatch = (startDate?: Date, endDate?: Date): PipelineStage[] => (startDate && endDate ? [{ $match: { requested_at: { $gte: startDate, $lt: endDate } } }] : []);

/** Лидерборд за период или all-time: leaders с пагинацией + total. Без дат — all-time. */
export const pRaceLeadersAndCount = (limit: number, page: number, startDate?: Date, endDate?: Date): PipelineStage[] => [
  ...dateMatch(startDate, endDate),
  { $group: { _id: "$user_id", total_size: { $sum: "$size" } } },
  { $sort: { total_size: -1 as const } },
  {
    $facet: {
      leaders: [{ $skip: Math.max(page - 1, 0) * limit }, { $limit: limit }],
      total: [{ $count: "count" }],
    },
  },
];

/** Позиция пользователя в race + соседи сверху/снизу. Без дат — all-time. */
export const pRaceUserContext = (userId: number, startDate?: Date, endDate?: Date): PipelineStage[] => [
  ...dateMatch(startDate, endDate),
  { $group: { _id: "$user_id", total_size: { $sum: "$size" } } },
  {
    $setWindowFields: {
      sortBy: { total_size: -1 as const },
      output: {
        position: { $rank: {} },
        above_id: { $shift: { output: "$_id", by: -1, default: null } },
        above_size: { $shift: { output: "$total_size", by: -1, default: null } },
        below_id: { $shift: { output: "$_id", by: 1, default: null } },
        below_size: { $shift: { output: "$total_size", by: 1, default: null } },
      },
    },
  },
  { $match: { _id: userId } },
];

/** Дата первого кока в коллекции (начало истории). */
export const pFirstCockDate = (): PipelineStage[] => [{ $sort: { requested_at: 1 as const } }, { $limit: 1 }, { $project: { _id: 0, first_date: "$requested_at" } }];
