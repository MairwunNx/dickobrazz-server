import type { PipelineStage } from "mongoose";

const tz = "Europe/Moscow";

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

export interface AchBulkResult {
  totalPulls: { count: number }[];
  totalSize: { total: number }[];
  maxSize: { max: number }[];
  minSize: { min: number }[];
  sniper30: { count: number }[];
  halfHundred50: { count: number }[];
  maximalist61: { count: number }[];
  beautifulNumbers: { count: number }[];
  traveler: { unique_sizes: number }[];
  moscovite: { count: number }[];
  recent10: { size: number }[];
  recent3: { size: number; requested_at: Date }[];
  last31: { size: number }[];
  earlyBird: { count: number }[];
  speedrunner: { count: number }[];
  midnightPuller: { count: number }[];
  valentine: { count: number }[];
  newYearGift: { count: number }[];
  mensSolidarity: { count: number }[];
  friday13th: { count: number }[];
  leapCock: { count: number }[];
}

export const pAchBulk = (userId: number, moscoviteStartDate: Date): PipelineStage[] => [
  { $match: { user_id: userId } },
  {
    $facet: {
      totalPulls: [{ $count: "count" }],
      totalSize: [{ $group: { _id: null, total: { $sum: "$size" } } }],
      maxSize: [{ $group: { _id: null, max: { $max: "$size" } } }],
      minSize: [{ $group: { _id: null, min: { $min: "$size" } } }],
      sniper30: [{ $match: { size: 30 } }, { $count: "count" }],
      halfHundred50: [{ $match: { size: 50 } }, { $count: "count" }],
      maximalist61: [{ $match: { size: 61 } }, { $count: "count" }],
      beautifulNumbers: [{ $match: { size: { $in: [11, 22, 33, 44, 55] } } }, { $group: { _id: "$size" } }, { $count: "count" }],
      traveler: [{ $match: { size: { $gte: 0, $lte: 60 } } }, { $group: { _id: "$size" } }, { $count: "unique_sizes" }],
      moscovite: [{ $match: { size: 50, requested_at: { $gte: moscoviteStartDate } } }, { $count: "count" }],
      recent10: [{ $sort: { requested_at: -1 as const } }, { $limit: 10 }, { $sort: { requested_at: 1 as const } }, { $project: { _id: 0, size: 1 } }],
      recent3: [{ $sort: { requested_at: -1 as const } }, { $limit: 3 }, { $sort: { requested_at: 1 as const } }, { $project: { _id: 0, size: 1, requested_at: 1 } }],
      last31: [{ $sort: { requested_at: -1 as const } }, { $limit: 31 }, { $project: { _id: 0, size: 1 } }],
      earlyBird: [{ $project: { hour: { $hour: { date: "$requested_at", timezone: tz } } } }, { $match: { hour: { $lt: 6 } } }, { $count: "count" }],
      speedrunner: [
        {
          $project: {
            hour: { $hour: { date: "$requested_at", timezone: tz } },
            minute: { $minute: { date: "$requested_at", timezone: tz } },
            second: { $second: { date: "$requested_at", timezone: tz } },
          },
        },
        { $match: { hour: 0, minute: 0, second: { $lt: 30 } } },
        { $count: "count" },
      ],
      midnightPuller: [{ $project: { hour: { $hour: { date: "$requested_at", timezone: tz } } } }, { $match: { hour: 23 } }, { $count: "count" }],
      valentine: [
        { $project: { size: 1, month: { $month: { date: "$requested_at", timezone: tz } }, day: { $dayOfMonth: { date: "$requested_at", timezone: tz } } } },
        { $match: { month: 2, day: 14, size: 14 } },
        { $count: "count" },
      ],
      newYearGift: [
        { $project: { size: 1, month: { $month: { date: "$requested_at", timezone: tz } }, day: { $dayOfMonth: { date: "$requested_at", timezone: tz } } } },
        { $match: { month: 12, day: 31, size: { $gte: 60 } } },
        { $count: "count" },
      ],
      mensSolidarity: [
        { $project: { size: 1, month: { $month: { date: "$requested_at", timezone: tz } }, day: { $dayOfMonth: { date: "$requested_at", timezone: tz } } } },
        { $match: { month: 11, day: 19, size: 19 } },
        { $count: "count" },
      ],
      friday13th: [
        { $project: { size: 1, day: { $dayOfMonth: { date: "$requested_at", timezone: tz } }, day_of_week: { $dayOfWeek: { date: "$requested_at", timezone: tz } } } },
        { $match: { day: 13, day_of_week: 6, size: 0 } },
        { $count: "count" },
      ],
      leapCock: [
        { $project: { month: { $month: { date: "$requested_at", timezone: tz } }, day: { $dayOfMonth: { date: "$requested_at", timezone: tz } } } },
        { $match: { month: 2, day: 29 } },
        { $count: "count" },
      ],
    },
  },
];
