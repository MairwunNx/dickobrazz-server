import type { PipelineStage } from "mongoose";

const tz = "Europe/Moscow";

export const pAchTotalPulls = (userId: number): PipelineStage[] => [{ $match: { user_id: userId } }, { $count: "count" }];

export const pAchTotalSize = (userId: number): PipelineStage[] => [{ $match: { user_id: userId } }, { $group: { _id: null, total: { $sum: "$size" } } }];

export const pAchSniper30cm = (userId: number): PipelineStage[] => [{ $match: { user_id: userId, size: 30 } }, { $count: "count" }];

export const pAchHalfHundred50cm = (userId: number): PipelineStage[] => [{ $match: { user_id: userId, size: 50 } }, { $count: "count" }];

export const pAchMaximalist61cm = (userId: number): PipelineStage[] => [{ $match: { user_id: userId, size: 61 } }, { $count: "count" }];

export const pAchBeautifulNumbers = (userId: number): PipelineStage[] => [
  { $match: { user_id: userId, size: { $in: [11, 22, 33, 44, 55] } } },
  { $group: { _id: "$size" } },
  { $count: "count" },
];

export const pAchRecent10 = (userId: number): PipelineStage[] => [{ $match: { user_id: userId } }, { $sort: { requested_at: -1 } }, { $limit: 10 }, { $sort: { requested_at: 1 } }];

export const pAchMaxSize = (userId: number): PipelineStage[] => [{ $match: { user_id: userId } }, { $group: { _id: null, max: { $max: "$size" } } }];

export const pAchMinSize = (userId: number): PipelineStage[] => [{ $match: { user_id: userId } }, { $group: { _id: null, min: { $min: "$size" } } }];

export const pAchEarlyBird = (userId: number): PipelineStage[] => [
  { $match: { user_id: userId } },
  { $project: { hour: { $hour: { date: "$requested_at", timezone: tz } } } },
  { $match: { hour: { $lt: 6 } } },
  { $count: "count" },
];

export const pAchSpeedrunner = (userId: number): PipelineStage[] => [
  { $match: { user_id: userId } },
  {
    $project: {
      hour: { $hour: { date: "$requested_at", timezone: tz } },
      minute: { $minute: { date: "$requested_at", timezone: tz } },
      second: { $second: { date: "$requested_at", timezone: tz } },
    },
  },
  { $match: { hour: 0, minute: 0, second: { $lt: 30 } } },
  { $count: "count" },
];

export const pAchMidnightPuller = (userId: number): PipelineStage[] => [
  { $match: { user_id: userId } },
  { $project: { hour: { $hour: { date: "$requested_at", timezone: tz } } } },
  { $match: { hour: 23 } },
  { $count: "count" },
];

export const pAchValentine = (userId: number): PipelineStage[] => [
  { $match: { user_id: userId } },
  {
    $project: {
      size: 1,
      month: { $month: { date: "$requested_at", timezone: tz } },
      day: { $dayOfMonth: { date: "$requested_at", timezone: tz } },
    },
  },
  { $match: { month: 2, day: 14, size: 14 } },
  { $count: "count" },
];

export const pAchNewYearGift = (userId: number): PipelineStage[] => [
  { $match: { user_id: userId } },
  {
    $project: {
      size: 1,
      month: { $month: { date: "$requested_at", timezone: tz } },
      day: { $dayOfMonth: { date: "$requested_at", timezone: tz } },
    },
  },
  { $match: { month: 12, day: 31, size: { $gte: 60 } } },
  { $count: "count" },
];

export const pAchMensSolidarity = (userId: number): PipelineStage[] => [
  { $match: { user_id: userId } },
  {
    $project: {
      size: 1,
      month: { $month: { date: "$requested_at", timezone: tz } },
      day: { $dayOfMonth: { date: "$requested_at", timezone: tz } },
    },
  },
  { $match: { month: 11, day: 19, size: 19 } },
  { $count: "count" },
];

export const pAchFriday13th = (userId: number): PipelineStage[] => [
  { $match: { user_id: userId } },
  {
    $project: {
      size: 1,
      day: { $dayOfMonth: { date: "$requested_at", timezone: tz } },
      day_of_week: { $dayOfWeek: { date: "$requested_at", timezone: tz } },
    },
  },
  { $match: { day: 13, day_of_week: 6, size: 0 } },
  { $count: "count" },
];

export const pAchLeapCock = (userId: number): PipelineStage[] => [
  { $match: { user_id: userId } },
  {
    $project: {
      month: { $month: { date: "$requested_at", timezone: tz } },
      day: { $dayOfMonth: { date: "$requested_at", timezone: tz } },
    },
  },
  { $match: { month: 2, day: 29 } },
  { $count: "count" },
];

export const pAchLightning = (userId: number): PipelineStage[] => [
  { $match: { user_id: userId } },
  { $sort: { requested_at: 1 } },
  {
    $setWindowFields: {
      sortBy: { requested_at: 1 },
      output: { prev_size: { $shift: { output: "$size", by: -1 } } },
    },
  },
  { $project: { growth: { $subtract: ["$size", { $ifNull: ["$prev_size", "$size"] }] } } },
  { $match: { growth: { $gte: 50 } } },
  { $count: "count" },
];

export const pAchLast31 = (userId: number): PipelineStage[] => [{ $match: { user_id: userId } }, { $sort: { requested_at: -1 } }, { $limit: 31 }];

export const pAchRecent3 = (userId: number): PipelineStage[] => [{ $match: { user_id: userId } }, { $sort: { requested_at: -1 } }, { $limit: 3 }, { $sort: { requested_at: 1 } }];

export const pGlobalMaxMin = (): PipelineStage[] => [{ $group: { _id: null, max: { $max: "$size" }, min: { $min: "$size" } } }];

export const pCountSeasons = (userId: number): PipelineStage[] => [
  { $group: { _id: null, first_cock_date: { $min: "$requested_at" } } },
  {
    $lookup: {
      from: "cocks",
      let: { first_date: "$first_cock_date" },
      pipeline: [
        { $match: { user_id: userId } },
        {
          $project: {
            requested_at: 1,
            year: { $year: { date: "$requested_at", timezone: tz } },
            month: { $month: { date: "$requested_at", timezone: tz } },
            first_year: { $year: { date: "$$first_date", timezone: tz } },
            first_month: { $month: { date: "$$first_date", timezone: tz } },
          },
        },
        {
          $project: {
            months_diff: {
              $subtract: [{ $add: [{ $multiply: ["$year", 12] }, "$month"] }, { $add: [{ $multiply: ["$first_year", 12] }, "$first_month"] }],
            },
          },
        },
        { $project: { season_number: { $floor: { $divide: ["$months_diff", 3] } } } },
        { $group: { _id: "$season_number" } },
      ],
      as: "seasons",
    },
  },
  { $unwind: "$seasons" },
  { $count: "count" },
];

export const pCheckTraveler = (userId: number): PipelineStage[] => [{ $match: { user_id: userId } }, { $group: { _id: "$size" } }, { $count: "unique_sizes" }];

export const pCheckMuscovite = (userId: number, startDate: Date): PipelineStage[] => [
  { $match: { user_id: userId, size: 50, requested_at: { $gte: startDate } } },
  { $count: "count" },
];
