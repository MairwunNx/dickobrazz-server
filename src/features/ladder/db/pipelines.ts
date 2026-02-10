import type { PipelineStage } from "mongoose";

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

/** Один скан: leaders (с пагинацией) + total count через $facet */
export const pLeadersAndCount = (limit: number, page: number): PipelineStage[] => [
  { $group: { _id: "$user_id", total_size: { $sum: "$size" } } },
  { $sort: { total_size: -1 as const } },
  {
    $facet: {
      leaders: [{ $skip: Math.max(page - 1, 0) * limit }, { $limit: limit }],
      total: [{ $count: "count" }],
    },
  },
];

/** Один скан: позиция юзера + соседи через $setWindowFields ($rank + $shift) */
export const pUserContext = (userId: number): PipelineStage[] => [
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

/** Суммарный размер кока юзера */
export const pUserTotalSize = (userId: number): PipelineStage[] => [
  { $match: { user_id: userId } },
  { $group: { _id: "$user_id", total_size: { $sum: "$size" }, nickname: { $first: "$nickname" } } },
];
