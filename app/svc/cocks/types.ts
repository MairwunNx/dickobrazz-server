export interface PaginationParams {
  limit?: number;
  page?: number;
}

export interface GetSizeParams {
  user_id: number;
}

export interface GetLeaderboardParams extends PaginationParams {
  user_id?: number;
}
