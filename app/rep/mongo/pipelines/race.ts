import type { PipelineStage } from "mongoose";

export const pRaceLeaders = (startDate: Date, endDate: Date, limit: number, page: number): PipelineStage[] => [
  { $match: { requested_at: { $gte: startDate, $lt: endDate } } },
  { $group: { _id: "$user_id", total_size: { $sum: "$size" }, nickname: { $first: "$nickname" } } },
  { $sort: { total_size: -1 } },
  { $skip: Math.max(page - 1, 0) * limit },
  { $limit: limit },
];

export const pRaceParticipants = (startDate: Date, endDate: Date): PipelineStage[] => [
  { $match: { requested_at: { $gte: startDate, $lt: endDate } } },
  { $group: { _id: "$user_id" } },
  { $count: "total" },
];

export const pRaceUserPosition = (userId: number, startDate: Date, endDate: Date): PipelineStage[] => [
  { $match: { requested_at: { $gte: startDate, $lt: endDate } } },
  { $group: { _id: "$user_id", total_size: { $sum: "$size" } } },
  { $sort: { total_size: -1 } },
  { $group: { _id: null, users: { $push: { user_id: "$_id", total_size: "$total_size" } } } },
  { $unwind: { path: "$users", includeArrayIndex: "position" } },
  { $match: { "users.user_id": userId } },
  { $project: { _id: 0, position: { $add: ["$position", 1] } } },
];

export const pRaceNeighborhood = (position: number, startDate: Date, endDate: Date): PipelineStage[] => {
  const skip = Math.max(position - 2, 0);

  return [
    { $match: { requested_at: { $gte: startDate, $lt: endDate } } },
    { $group: { _id: "$user_id", total_size: { $sum: "$size" }, nickname: { $first: "$nickname" } } },
    { $sort: { total_size: -1 } },
    { $skip: skip },
    { $limit: 3 },
  ];
};
