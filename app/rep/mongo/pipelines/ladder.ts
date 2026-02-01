import type { PipelineStage } from "mongoose";

export const pTopUsersBySize = (limit: number, page: number): PipelineStage[] => [
  { $group: { _id: "$user_id", total_size: { $sum: "$size" }, nickname: { $first: "$nickname" } } },
  { $sort: { total_size: -1 } },
  { $skip: Math.max(page - 1, 0) * limit },
  { $limit: limit },
];

export const pTotalCockersCount = (): PipelineStage[] => [{ $group: { _id: "$user_id" } }, { $count: "total" }];

export const pUserPositionInLadder = (userId: number): PipelineStage[] => [
  { $group: { _id: "$user_id", total_size: { $sum: "$size" } } },
  { $sort: { total_size: -1 } },
  { $group: { _id: null, users: { $push: { user_id: "$_id", total_size: "$total_size" } } } },
  { $unwind: { path: "$users", includeArrayIndex: "position" } },
  { $match: { "users.user_id": userId } },
  { $project: { _id: 0, position: { $add: ["$position", 1] } } },
];

export const pNeighborhoodInLadder = (position: number): PipelineStage[] => {
  const skip = Math.max(position - 2, 0);

  return [{ $group: { _id: "$user_id", total_size: { $sum: "$size" }, nickname: { $first: "$nickname" } } }, { $sort: { total_size: -1 } }, { $skip: skip }, { $limit: 3 }];
};

export const pUserTotalSize = (userId: number): PipelineStage[] => [
  { $match: { user_id: userId } },
  { $group: { _id: "$user_id", total_size: { $sum: "$size" }, nickname: { $first: "$nickname" } } },
];
