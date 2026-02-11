import type { PipelineStage } from "mongoose";

const tz = "Europe/Moscow";

// ===========================================
// Результаты агрегаций
// ===========================================

export interface PersonalTotalsAndRatiosResult {
  user_total: number;
  user_count: number;
  irk: number;
  dominance: number;
}

export interface PersonalLast5FacetResult {
  recent: Array<{ average: number }>;
  daily_growth: Array<{ average: number }>;
  daily_dynamics: Array<{
    yesterday_cock_change: number;
    yesterday_cock_change_percent: number;
  }>;
  five_cocks: Array<{
    five_cocks_change: number;
    five_cocks_change_percent: number;
  }>;
  luck: Array<{ luck_coefficient: number }>;
  volatility: Array<{ volatility: number }>;
}

export interface PersonalRecordAndDatesResult {
  record: Array<{ requested_at: Date; total: number }>;
  first_date: Array<{ first_date: Date }>;
}

export interface PersonalGrowthSpeedResult {
  growth_speed: number;
}

// ===========================================
// Пайплайны
// ===========================================

/**
 * Один полный скан коллекции: user_total, user_count, IRK, dominance (перцентильный ранг).
 * dominance = «ты выше X% игроков» через $rank / кол-во игроков.
 */
export const pPersonalTotalsAndRatios = (userId: number): PipelineStage[] => [
  {
    $group: {
      _id: "$user_id",
      total: { $sum: "$size" },
      count: { $sum: 1 },
    },
  },
  {
    $setWindowFields: {
      sortBy: { total: 1 },
      output: {
        rank: { $rank: {} },
        total_users: { $count: {} },
      },
    },
  } as PipelineStage,
  {
    $addFields: {
      percentile_rank: {
        $cond: [
          { $lte: ["$total_users", 1] },
          0,
          {
            $divide: [{ $subtract: ["$rank", 1] }, { $subtract: ["$total_users", 1] }],
          },
        ],
      },
    },
  },
  {
    $group: {
      _id: null,
      global_total: { $sum: "$total" },
      user_total: {
        $sum: { $cond: [{ $eq: ["$_id", userId] }, "$total", 0] },
      },
      user_count: {
        $sum: { $cond: [{ $eq: ["$_id", userId] }, "$count", 0] },
      },
      user_dominance: {
        $max: {
          $cond: [{ $eq: ["$_id", userId] }, "$percentile_rank", null],
        },
      },
    },
  },
  {
    $project: {
      _id: 0,
      user_total: 1,
      user_count: 1,
      irk: {
        $round: [
          {
            $cond: [
              { $lte: ["$global_total", 0] },
              0,
              {
                $divide: [
                  {
                    $log10: {
                      $add: [1, "$user_total"],
                    },
                  },
                  {
                    $log10: {
                      $add: [1, "$global_total"],
                    },
                  },
                ],
              },
            ],
          },
          3,
        ],
      },
      dominance: {
        $round: [
          {
            $multiply: [{ $ifNull: ["$user_dominance", 0] }, 100],
          },
          1,
        ],
      },
    },
  },
];

/**
 * Facet по последним 5 кокам пользователя: recent (avg), daily_growth,
 * daily_dynamics (изменение последний/предпоследний), five_cocks (изменение за 5),
 * luck_coefficient (avg/30.5), volatility (стандартное отклонение).
 */
export const pPersonalLast5Facet = (userId: number): PipelineStage[] => [
  { $match: { user_id: userId } },
  { $sort: { requested_at: -1 } },
  { $limit: 5 },
  {
    $facet: {
      // individual.recent_average
      recent: [
        { $group: { _id: null, average: { $avg: "$size" } } },
        {
          $project: {
            _id: 0,
            average: { $round: ["$average", 0] },
          },
        },
      ],

      // individual.daily_growth_average (среднее изменение между соседними коками)
      daily_growth: [
        {
          $setWindowFields: {
            sortBy: { requested_at: -1 },
            output: {
              prev_size: {
                $shift: { output: "$size", by: 1 },
              },
            },
          },
        },
        { $match: { prev_size: { $ne: null } } },
        {
          $group: {
            _id: null,
            average: {
              $avg: {
                $round: [{ $subtract: ["$size", "$prev_size"] }, 1],
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            average: { $round: ["$average", 1] },
          },
        },
      ],

      // individual.daily_dynamics (изменение между последним и предпоследним)
      daily_dynamics: [
        { $sort: { requested_at: -1 } },
        { $limit: 2 },
        {
          $group: {
            _id: null,
            curr_cock: { $first: "$size" },
            prev_cock: { $last: "$size" },
          },
        },
        {
          $project: {
            _id: 0,
            yesterday_cock_change: {
              $subtract: ["$curr_cock", "$prev_cock"],
            },
            yesterday_cock_change_percent: {
              $round: [
                {
                  $multiply: [
                    {
                      $divide: [
                        {
                          $subtract: ["$curr_cock", "$prev_cock"],
                        },
                        {
                          $max: ["$prev_cock", 1],
                        },
                      ],
                    },
                    100,
                  ],
                },
                1,
              ],
            },
          },
        },
      ],

      // individual.five_cocks_dynamics (изменение за 5 коков)
      five_cocks: [
        { $sort: { requested_at: -1 } },
        {
          $group: {
            _id: null,
            first_cock: { $first: "$size" },
            last_cock: { $last: "$size" },
          },
        },
        {
          $project: {
            _id: 0,
            five_cocks_change: {
              $subtract: ["$first_cock", "$last_cock"],
            },
            five_cocks_change_percent: {
              $round: [
                {
                  $cond: [
                    { $eq: ["$last_cock", 0] },
                    0,
                    {
                      $multiply: [
                        {
                          $divide: [
                            {
                              $subtract: ["$first_cock", "$last_cock"],
                            },
                            "$last_cock",
                          ],
                        },
                        100,
                      ],
                    },
                  ],
                },
                1,
              ],
            },
          },
        },
      ],

      // individual.luck_coefficient (avg / 30.5)
      luck: [
        {
          $group: { _id: null, avg_size: { $avg: "$size" } },
        },
        {
          $project: {
            _id: 0,
            luck_coefficient: {
              $round: [{ $divide: ["$avg_size", 30.5] }, 3],
            },
          },
        },
      ],

      // individual.volatility (стандартное отклонение)
      volatility: [
        {
          $group: {
            _id: null,
            sizes: { $push: "$size" },
            avg_size: { $avg: "$size" },
          },
        },
        {
          $project: {
            _id: 0,
            volatility: {
              $round: [
                {
                  $sqrt: {
                    $avg: {
                      $map: {
                        input: "$sizes",
                        as: "size",
                        in: {
                          $pow: [
                            {
                              $subtract: ["$$size", "$avg_size"],
                            },
                            2,
                          ],
                        },
                      },
                    },
                  },
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

/** Рекорд пользователя (размер + дата) и дата первого кока в одном $facet. */
export const pPersonalRecordAndDates = (userId: number): PipelineStage[] => [
  { $match: { user_id: userId } },
  {
    $facet: {
      record: [{ $sort: { size: -1, requested_at: -1 } }, { $limit: 1 }, { $project: { _id: 0, requested_at: 1, total: "$size" } }],
      first_date: [{ $sort: { requested_at: 1 } }, { $limit: 1 }, { $project: { _id: 0, first_date: "$requested_at" } }],
    },
  },
];

/** Средний размер за день за последние 5 дней пользователя. */
export const pPersonalGrowthSpeed = (userId: number): PipelineStage[] => [
  { $match: { user_id: userId } },
  { $sort: { requested_at: 1 } },
  {
    $group: {
      _id: {
        year: { $year: { date: "$requested_at", timezone: tz } },
        month: { $month: { date: "$requested_at", timezone: tz } },
        day: {
          $dayOfMonth: { date: "$requested_at", timezone: tz },
        },
      },
      last_cock_of_day: { $last: "$size" },
      day_timestamp: { $last: "$requested_at" },
    },
  },
  { $sort: { day_timestamp: -1 } },
  { $limit: 5 },
  {
    $group: {
      _id: null,
      daily_sizes: { $push: "$last_cock_of_day" },
      count: { $sum: 1 },
    },
  },
  {
    $project: {
      _id: 0,
      growth_speed: {
        $round: [
          {
            $cond: [
              { $gt: ["$count", 0] },
              {
                $divide: [{ $sum: "$daily_sizes" }, "$count"],
              },
              0,
            ],
          },
          1,
        ],
      },
    },
  },
];
