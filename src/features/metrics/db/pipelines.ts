import type { PipelineStage } from "mongoose";

// ===========================================
// Пайплайны
// ===========================================

/** Подсчёт уникальных пользователей, сделавших хотя бы один pull с указанной даты. */
export const pActiveUsersSince = (since: Date): PipelineStage[] => [{ $match: { requested_at: { $gte: since } } }, { $group: { _id: "$user_id" } }, { $count: "total" }];

/** Распределение размеров по бакетам (0–5, 5–10, …, 60–62, other) для гистограммы. */
export const pSizeDistribution = (): PipelineStage[] => [
  {
    $bucket: {
      groupBy: "$size",
      boundaries: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 62],
      default: "other",
      output: { count: { $sum: 1 } },
    },
  },
];
