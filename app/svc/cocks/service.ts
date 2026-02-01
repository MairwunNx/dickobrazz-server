import type { CockAchievementsResponse } from "@/dto/cock/achievements";
import type { CockDynamicGlobalResponse, CockDynamicResponse } from "@/dto/cock/dynamics";
import type { CockLadderResponse, CockRulerResponse } from "@/dto/cock/leaderboard";
import type { CockRaceResponse } from "@/dto/cock/race";
import type { CockSeasonsResponse } from "@/dto/cock/seasons";
import type { CockSizeResponse } from "@/dto/cock/size";
import { createTicker, logger } from "@/log";
import type { GetLeaderboardParams, GetSizeParams, PaginationParams } from "./types";

export const getOrGenerateSize = async (params: GetSizeParams): Promise<CockSizeResponse> => {
  const ticker = createTicker();

  const result = {
    size: 15,
    hash: "stub-hash",
    salt: "stub-salt",
  };

  logger.info("Get or generate cock size (stub)", {
    service: "cocks",
    operation: "getOrGenerateSize",
    user_id: params.user_id,
    duration_ms: ticker(),
  });

  return result;
};

export const getRuler = async (params: GetLeaderboardParams): Promise<CockRulerResponse> => {
  const ticker = createTicker();

  const result = {
    leaders: [],
    total_participants: 0,
    user_position: 0,
    neighborhood: {
      above: [],
      self: undefined,
      below: [],
    },
    page: {
      limit: params.limit || 13,
      total: 0,
    },
  };

  logger.info("Get daily ruler (stub)", {
    service: "cocks",
    operation: "getRuler",
    limit: params.limit,
    duration_ms: ticker(),
  });

  return result;
};

export const getRace = async (params: GetLeaderboardParams): Promise<CockRaceResponse> => {
  const ticker = createTicker();

  const result = {
    season: undefined,
    leaders: [],
    total_participants: 0,
    user_position: 0,
    neighborhood: {
      above: [],
      self: undefined,
      below: [],
    },
    page: {
      limit: params.limit || 13,
      total: 0,
    },
  };

  logger.info("Get season race (stub)", {
    service: "cocks",
    operation: "getRace",
    limit: params.limit,
    duration_ms: ticker(),
  });

  return result;
};

export const getDynamicGlobal = async (): Promise<CockDynamicGlobalResponse> => {
  const ticker = createTicker();

  const result: CockDynamicGlobalResponse = {
    overall: {
      total_size: 0,
      unique_users: 0,
      recent: {
        average: 0,
        median: 0,
      },
      distribution: {
        huge_percent: 0,
        little_percent: 0,
      },
      record: {
        requested_at: new Date().toISOString(),
        total: 0,
      },
      total_cocks_count: 0,
      growth_speed: 0,
    },
  };

  logger.info("Get global cock dynamics (stub)", {
    service: "cocks",
    operation: "getDynamicGlobal",
    duration_ms: ticker(),
  });

  return result;
};

export const getDynamicPersonal = async (userId: number): Promise<CockDynamicResponse> => {
  const ticker = createTicker();

  const result: CockDynamicResponse = {
    overall: {
      total_size: 0,
      unique_users: 0,
      recent: {
        average: 0,
        median: 0,
      },
      distribution: {
        huge_percent: 0,
        little_percent: 0,
      },
      record: {
        requested_at: new Date().toISOString(),
        total: 0,
      },
      total_cocks_count: 0,
      growth_speed: 0,
    },
    individual: {
      total_size: 0,
      recent_average: 0,
      irk: 0,
      record: {
        requested_at: new Date().toISOString(),
        total: 0,
      },
      dominance: 0,
      daily_growth_average: 0,
      daily_dynamics: {
        yesterday_cock_change: 0,
        yesterday_cock_change_percent: 0,
      },
      five_cocks_dynamics: {
        five_cocks_change: 0,
        five_cocks_change_percent: 0,
      },
      growth_speed: 0,
      first_cock_date: new Date().toISOString(),
      luck_coefficient: 0,
      volatility: 0,
      cocks_count: 0,
    },
  };

  logger.info("Get personal cock dynamics (stub)", {
    service: "cocks",
    operation: "getDynamicPersonal",
    user_id: userId,
    duration_ms: ticker(),
  });

  return result;
};

export const getAchievements = async (userId: number): Promise<CockAchievementsResponse> => {
  const ticker = createTicker();

  const result = {
    achievements: [],
  };

  logger.info("Get achievements (stub)", {
    service: "cocks",
    operation: "getAchievements",
    user_id: userId,
    duration_ms: ticker(),
  });

  return result;
};

export const getLadder = async (params: GetLeaderboardParams): Promise<CockLadderResponse> => {
  const ticker = createTicker();

  const result = {
    leaders: [],
    total_participants: 0,
    user_position: 0,
    neighborhood: {
      above: [],
      self: undefined,
      below: [],
    },
    page: {
      limit: params.limit || 13,
      total: 0,
    },
  };

  logger.info("Get overall ladder (stub)", {
    service: "cocks",
    operation: "getLadder",
    limit: params.limit,
    duration_ms: ticker(),
  });

  return result;
};

export const getSeasons = async (params: PaginationParams): Promise<CockSeasonsResponse> => {
  const ticker = createTicker();

  const result: CockSeasonsResponse = {
    seasons: [],
    page: {
      limit: params.limit || 13,
      total: 0,
      page: params.page,
    },
  };

  logger.info("Get cock seasons (stub)", {
    service: "cocks",
    operation: "getSeasons",
    limit: params.limit,
    page: params.page,
    duration_ms: ticker(),
  });

  return result;
};
