import type { PipelineStage } from "mongoose";

const tz = "Europe/Moscow";
const HUGE_COCK_THRESHOLD = 19;

// ===========================================
// Результаты агрегаций
// ===========================================

interface GlobalDynamicsRaw {
  totals: [{ total_size: number; total_count: number }] | [];
  uniqueUsers: [{ count: number }] | [];
  recentAndDistribution: [{ average: number; median: number; huge_percent: number; little_percent: number }] | [];
  record: [{ requested_at: Date; total: number }] | [];
  growthSpeed: [{ growth_speed: number }] | [];
}

export type { GlobalDynamicsRaw };

// ===========================================
// Пайплайны
// ===========================================

export const pGlobalDynamics = (): PipelineStage[] => [
  {
    $facet: {
      totals: [
        {
          $group: {
            _id: null,
            total_size: { $sum: "$size" },
            total_count: { $sum: 1 },
          },
        },
        { $project: { _id: 0, total_size: 1, total_count: 1 } },
      ],

      uniqueUsers: [{ $group: { _id: "$user_id" } }, { $count: "count" }],

      recentAndDistribution: [
        { $sort: { requested_at: 1 } },
        {
          $group: {
            _id: {
              user_id: "$user_id",
              year: { $year: { date: "$requested_at", timezone: tz } },
              month: { $month: { date: "$requested_at", timezone: tz } },
              day: { $dayOfMonth: { date: "$requested_at", timezone: tz } },
            },
            last_cock_of_day: { $last: "$size" },
            day_timestamp: { $last: "$requested_at" },
          },
        },
        { $sort: { day_timestamp: -1 } },
        {
          $group: {
            _id: "$_id.user_id",
            last_5_days: { $push: "$last_cock_of_day" },
          },
        },
        { $project: { last_5_days: { $slice: ["$last_5_days", 5] } } },
        { $unwind: "$last_5_days" },
        {
          $group: {
            _id: null,
            average: { $avg: "$last_5_days" },
            median: { $median: { input: "$last_5_days", method: "approximate" } },
            huge: { $sum: { $cond: [{ $gte: ["$last_5_days", HUGE_COCK_THRESHOLD] }, 1, 0] } },
            little: { $sum: { $cond: [{ $lt: ["$last_5_days", HUGE_COCK_THRESHOLD] }, 1, 0] } },
          },
        },
        { $addFields: { total: { $add: ["$huge", "$little"] } } },
        {
          $project: {
            _id: 0,
            average: { $round: ["$average", 0] },
            median: 1,
            huge_percent: {
              $cond: [{ $eq: ["$total", 0] }, 0, { $multiply: [{ $divide: ["$huge", "$total"] }, 100] }],
            },
            little_percent: {
              $cond: [{ $eq: ["$total", 0] }, 0, { $multiply: [{ $divide: ["$little", "$total"] }, 100] }],
            },
          },
        },
      ],

      record: [
        {
          $group: {
            _id: {
              year: { $year: { date: "$requested_at", timezone: tz } },
              month: { $month: { date: "$requested_at", timezone: tz } },
              day: { $dayOfMonth: { date: "$requested_at", timezone: tz } },
            },
            requested_at: { $max: "$requested_at" },
            total: { $sum: "$size" },
          },
        },
        { $sort: { total: -1 } },
        { $limit: 1 },
      ],

      growthSpeed: [
        {
          $group: {
            _id: {
              year: { $year: { date: "$requested_at", timezone: tz } },
              month: { $month: { date: "$requested_at", timezone: tz } },
              day: { $dayOfMonth: { date: "$requested_at", timezone: tz } },
            },
            daily_total: { $sum: "$size" },
            day_timestamp: { $first: "$requested_at" },
          },
        },
        { $sort: { day_timestamp: -1 } },
        { $limit: 5 },
        {
          $group: {
            _id: null,
            daily_totals: { $push: "$daily_total" },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            growth_speed: {
              $round: [
                {
                  $cond: [{ $gt: ["$count", 0] }, { $divide: [{ $sum: "$daily_totals" }, "$count"] }, 0],
                },
                1,
              ],
            },
          },
        },
      ],
    },
  },
];
