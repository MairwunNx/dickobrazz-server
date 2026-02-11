import type { PipelineStage } from "mongoose";

export interface AggWinner {
  _id: number;
  total_size: number;
  nickname: string;
}

export const pSeasonWinners = (startDate: Date, endDate: Date): PipelineStage[] => [
  { $match: { requested_at: { $gte: startDate, $lt: endDate } } },
  { $group: { _id: "$user_id", total_size: { $sum: "$size" }, nickname: { $first: "$nickname" } } },
  { $sort: { total_size: -1 } },
  { $limit: 3 },
];

export const pSeasonCockersCount = (startDate: Date, endDate: Date): PipelineStage[] => [
  { $match: { requested_at: { $gte: startDate, $lt: endDate } } },
  { $group: { _id: "$user_id" } },
  { $count: "total" },
];

export const pUserPositionInSeason = (userId: number, startDate: Date, endDate: Date): PipelineStage[] => [
  { $match: { requested_at: { $gte: startDate, $lt: endDate } } },
  { $group: { _id: "$user_id", total_size: { $sum: "$size" } } },
  { $sort: { total_size: -1 } },
  { $group: { _id: null, users: { $push: { user_id: "$_id", total_size: "$total_size" } } } },
  { $unwind: { path: "$users", includeArrayIndex: "position" } },
  { $match: { "users.user_id": userId } },
  { $project: { _id: 0, position: { $add: ["$position", 1] } } },
];

export const pNeighborhoodInSeason = (position: number, startDate: Date, endDate: Date): PipelineStage[] => {
  const skip = Math.max(position - 2, 0);
  return [
    { $match: { requested_at: { $gte: startDate, $lt: endDate } } },
    { $group: { _id: "$user_id", total_size: { $sum: "$size" }, nickname: { $first: "$nickname" } } },
    { $sort: { total_size: -1 } },
    { $skip: skip },
    { $limit: 3 },
  ];
};

export const pFirstCockDate = (): PipelineStage[] => [{ $sort: { requested_at: 1 } }, { $limit: 1 }, { $project: { _id: 0, first_date: "$requested_at" } }];
