import type { PipelineStage } from "mongoose";

export const pUserProfile = (userId: number): PipelineStage[] => [
  { $match: { user_id: userId } },
  { $project: { _id: 0, user_id: 1, username: 1, is_hidden: 1, updated_at: 1 } },
];

export const pUsersByIds = (userIds: number[]): PipelineStage[] => [
  { $match: { user_id: { $in: userIds } } },
  { $project: { _id: 0, user_id: 1, username: 1, is_hidden: 1, updated_at: 1 } },
];

export const pUsersUpdatedSince = (since: Date): PipelineStage[] => [
  { $match: { updated_at: { $gte: since } } },
  { $sort: { updated_at: -1 } },
  { $project: { _id: 0, user_id: 1, username: 1, is_hidden: 1, updated_at: 1 } },
];
