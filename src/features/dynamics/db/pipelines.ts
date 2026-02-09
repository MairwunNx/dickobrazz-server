import type { PipelineStage } from "mongoose";

const tz = "Europe/Moscow";

export const pIrk = (userId: number): PipelineStage[] => [
  { $match: { user_id: userId } },
  { $group: { _id: null, user_total_size: { $sum: "$size" } } },
  {
    $lookup: {
      from: "cocks",
      pipeline: [{ $group: { _id: null, global_total_size: { $sum: "$size" } } }],
      as: "global_data",
    },
  },
  { $unwind: "$global_data" },
  {
    $project: {
      _id: 0,
      irk: {
        $round: [
          {
            $cond: [
              { $lte: ["$global_data.global_total_size", 0] },
              0,
              { $divide: [{ $log10: { $add: [1, "$user_total_size"] } }, { $log10: { $add: [1, "$global_data.global_total_size"] } }] },
            ],
          },
          3,
        ],
      },
    },
  },
];

export const pDominance = (userId: number): PipelineStage[] => [
  {
    $group: {
      _id: null,
      total_cock: { $sum: "$size" },
      total_user_cock: { $sum: { $cond: [{ $eq: ["$user_id", userId] }, "$size", 0] } },
    },
  },
  {
    $project: {
      _id: 0,
      dominance: {
        $round: [{ $multiply: [{ $cond: [{ $eq: ["$total_cock", 0] }, 0, { $divide: ["$total_user_cock", "$total_cock"] }] }, 100] }, 1],
      },
    },
  },
];

export const pDailyGrowth = (userId: number): PipelineStage[] => [
  { $match: { user_id: userId } },
  { $sort: { requested_at: -1 } },
  { $limit: 5 },
  {
    $setWindowFields: {
      partitionBy: "$user_id",
      sortBy: { requested_at: -1 },
      output: { prev_size: { $shift: { output: "$size", by: 1 } } },
    },
  },
  { $set: { growth: { $round: [{ $subtract: ["$size", "$prev_size"] }, 1] } } },
  { $group: { _id: "$user_id", average_daily_growth: { $avg: "$growth" } } },
  { $project: { _id: 0, average: { $round: ["$average_daily_growth", 1] } } },
];

export const pDailyDynamics = (userId: number): PipelineStage[] => [
  { $match: { user_id: userId } },
  { $project: { requested_at: 1, size: 1 } },
  { $sort: { requested_at: -1 } },
  { $limit: 2 },
  { $group: { _id: null, curr_cock: { $first: "$size" }, prev_cock: { $last: "$size" } } },
  {
    $project: {
      _id: 0,
      yesterday_cock_change: { $subtract: ["$curr_cock", "$prev_cock"] },
      yesterday_cock_change_percent: {
        $round: [{ $multiply: [{ $divide: [{ $subtract: ["$curr_cock", "$prev_cock"] }, { $max: ["$prev_cock", 1] }] }, 100] }, 1],
      },
    },
  },
];

export const pUserTotal = (userId: number): PipelineStage[] => [
  { $match: { user_id: userId } },
  { $group: { _id: null, total: { $sum: "$size" } } },
  { $project: { _id: 0, total: 1 } },
];

export const pUserRecent = (userId: number): PipelineStage[] => [
  { $match: { user_id: userId } },
  { $sort: { requested_at: -1 } },
  { $limit: 5 },
  { $group: { _id: null, avg_val: { $avg: "$size" } } },
  { $project: { _id: 0, average: { $round: ["$avg_val", 0] } } },
];

export const pOverallTotal = (): PipelineStage[] => [{ $group: { _id: null, size: { $sum: "$size" } } }];

export const pOverallRecent = (): PipelineStage[] => [
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
  { $group: { _id: "$_id.user_id", last_5_days: { $push: { size: "$last_cock_of_day", timestamp: "$day_timestamp" } } } },
  { $project: { _id: 0, last_5_days: { $slice: ["$last_5_days", 5] } } },
  { $unwind: "$last_5_days" },
  {
    $group: {
      _id: null,
      median: { $median: { input: "$last_5_days.size", method: "approximate" } },
      average: { $avg: "$last_5_days.size" },
    },
  },
  { $project: { _id: 0, median: 1, average: { $round: ["$average", 0] } } },
];

export const pUniqueUsers = (): PipelineStage[] => [{ $group: { _id: "$user_id" } }, { $count: "count" }];

export const pDistribution = (): PipelineStage[] => [
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
  { $group: { _id: "$_id.user_id", last_5_days: { $push: "$last_cock_of_day" } } },
  { $project: { _id: 0, last_5_days: { $slice: ["$last_5_days", 5] } } },
  { $unwind: "$last_5_days" },
  {
    $group: {
      _id: null,
      huge: { $sum: { $cond: [{ $gte: ["$last_5_days", 19] }, 1, 0] } },
      little: { $sum: { $cond: [{ $lt: ["$last_5_days", 19] }, 1, 0] } },
    },
  },
  { $addFields: { total: { $add: ["$huge", "$little"] } } },
  {
    $project: {
      _id: 0,
      huge: { $cond: [{ $eq: ["$total", 0] }, 0, { $multiply: [{ $divide: ["$huge", "$total"] }, 100] }] },
      little: { $cond: [{ $eq: ["$total", 0] }, 0, { $multiply: [{ $divide: ["$little", "$total"] }, 100] }] },
    },
  },
];

export const pOverallGrowthSpeed = (): PipelineStage[] => [
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
  { $group: { _id: null, daily_totals: { $push: "$daily_total" }, count: { $sum: 1 } } },
  {
    $project: {
      _id: 0,
      growth_speed: { $round: [{ $cond: [{ $gt: ["$count", 0] }, { $divide: [{ $sum: "$daily_totals" }, "$count"] }, 0] }, 1] },
    },
  },
];

export const pRecord = (): PipelineStage[] => [
  {
    $group: {
      _id: {
        year: { $year: { date: "$requested_at", timezone: tz } },
        month: { $month: { date: "$requested_at", timezone: tz } },
        day: { $dayOfMonth: { date: "$requested_at", timezone: tz } },
      },
      requested_at: { $first: "$requested_at" },
      total: { $sum: "$size" },
    },
  },
  { $sort: { total: -1 } },
  { $limit: 1 },
];

export const pUserRecord = (userId: number): PipelineStage[] => [
  { $match: { user_id: userId } },
  { $sort: { size: -1, requested_at: -1 } },
  { $limit: 1 },
  { $project: { _id: 0, requested_at: 1, total: "$size" } },
];

export const pTotalCocksCount = (): PipelineStage[] => [{ $count: "total_count" }];

export const pUserCocksCount = (userId: number): PipelineStage[] => [{ $match: { user_id: userId } }, { $count: "user_count" }];

export const pLuck = (userId: number): PipelineStage[] => [
  { $match: { user_id: userId } },
  { $sort: { requested_at: -1 } },
  { $limit: 5 },
  { $group: { _id: null, avg_size: { $avg: "$size" } } },
  { $project: { _id: 0, luck_coefficient: { $round: [{ $divide: ["$avg_size", 30.5] }, 3] } } },
];

export const pVolatility = (userId: number): PipelineStage[] => [
  { $match: { user_id: userId } },
  { $sort: { requested_at: -1 } },
  { $limit: 5 },
  { $group: { _id: null, sizes: { $push: "$size" }, avg_size: { $avg: "$size" } } },
  {
    $project: {
      _id: 0,
      volatility: {
        $round: [{ $sqrt: { $avg: { $map: { input: "$sizes", as: "size", in: { $pow: [{ $subtract: ["$$size", "$avg_size"] }, 2] } } } } }, 1],
      },
    },
  },
];

export const pFiveCocksDynamics = (userId: number): PipelineStage[] => [
  { $match: { user_id: userId } },
  { $sort: { requested_at: -1 } },
  { $limit: 5 },
  { $group: { _id: null, first_cock: { $first: "$size" }, last_cock: { $last: "$size" } } },
  {
    $project: {
      _id: 0,
      five_cocks_change: { $subtract: ["$first_cock", "$last_cock"] },
      five_cocks_change_percent: {
        $round: [{ $cond: [{ $eq: ["$last_cock", 0] }, 0, { $multiply: [{ $divide: [{ $subtract: ["$first_cock", "$last_cock"] }, "$last_cock"] }, 100] }] }, 1],
      },
    },
  },
];

export const pUserGrowthSpeed = (userId: number): PipelineStage[] => [
  { $match: { user_id: userId } },
  {
    $group: {
      _id: {
        year: { $year: { date: "$requested_at", timezone: tz } },
        month: { $month: { date: "$requested_at", timezone: tz } },
        day: { $dayOfMonth: { date: "$requested_at", timezone: tz } },
      },
      last_cock_of_day: { $last: "$size" },
      day_timestamp: { $last: "$requested_at" },
    },
  },
  { $sort: { day_timestamp: -1 } },
  { $limit: 5 },
  { $group: { _id: null, daily_sizes: { $push: "$last_cock_of_day" }, count: { $sum: 1 } } },
  {
    $project: {
      _id: 0,
      growth_speed: { $round: [{ $cond: [{ $gt: ["$count", 0] }, { $divide: [{ $sum: "$daily_sizes" }, "$count"] }, 0] }, 1] },
    },
  },
];

export const pUserFirstCockDate = (userId: number): PipelineStage[] => [
  { $match: { user_id: userId } },
  { $sort: { requested_at: 1 } },
  { $limit: 1 },
  { $project: { _id: 0, first_date: "$requested_at" } },
];
