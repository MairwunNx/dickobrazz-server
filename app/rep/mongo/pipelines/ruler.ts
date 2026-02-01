import type { PipelineStage } from "mongoose";

const pRulerBase = (startDate: Date, endDate: Date): PipelineStage[] => [
  { $match: { requested_at: { $gte: startDate, $lt: endDate } } },
  { $sort: { requested_at: 1 } },
  {
    $group: {
      _id: "$user_id",
      size: { $last: "$size" },
      nickname: { $last: "$nickname" },
      requested_at: { $last: "$requested_at" },
    },
  },
];

export const pRulerLeaders = (startDate: Date, endDate: Date, limit = 13): PipelineStage[] => [
  ...pRulerBase(startDate, endDate),
  { $sort: { size: -1, requested_at: 1 } },
  { $limit: limit },
];

export const pRulerParticipants = (startDate: Date, endDate: Date): PipelineStage[] => [...pRulerBase(startDate, endDate), { $count: "total" }];

export const pRulerUserPosition = (userId: number, startDate: Date, endDate: Date): PipelineStage[] => [
  ...pRulerBase(startDate, endDate),
  { $sort: { size: -1, requested_at: 1 } },
  { $group: { _id: null, users: { $push: { user_id: "$_id", size: "$size" } } } },
  { $unwind: { path: "$users", includeArrayIndex: "position" } },
  { $match: { "users.user_id": userId } },
  { $project: { _id: 0, position: { $add: ["$position", 1] } } },
];

export const pRulerNeighborhood = (position: number, startDate: Date, endDate: Date): PipelineStage[] => {
  const skip = Math.max(position - 2, 0);

  return [...pRulerBase(startDate, endDate), { $sort: { size: -1, requested_at: 1 } }, { $skip: skip }, { $limit: 3 }];
};
