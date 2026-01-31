export interface PaginationParams {
  limit?: number;
  page?: number;
}

export interface GetSizeParams {
  user_id: number;
  nickname: string;
}

export interface GetLeaderboardParams extends PaginationParams {
  user_id?: number;
}
