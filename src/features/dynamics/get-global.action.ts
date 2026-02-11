import type { CockDal } from "@/entities/cock";
import { di } from "@/shared/injection";
import { logger } from "@/shared/lib/logger";
import { createTicker } from "@/shared/lib/profiling";
import type { GlobalDynamicsRaw } from "./db/pipelines_global";
import { pGlobalDynamics } from "./db/pipelines_global";
import type { CockDynamicOverall } from "./types";

export const createGetDynamicGlobalAction = (cockDal: CockDal) => async (): Promise<CockDynamicOverall> => {
  const ticker = createTicker();

  const [raw] = await cockDal.aggregate<GlobalDynamicsRaw>(pGlobalDynamics());

  const totals = raw?.totals[0];
  const uniqueUsers = raw?.uniqueUsers[0];
  const recentDist = raw?.recentAndDistribution[0];
  const record = raw?.record[0];
  const growthSpeed = raw?.growthSpeed[0];

  const result: CockDynamicOverall = {
    total_size: totals?.total_size ?? 0,
    unique_users: uniqueUsers?.count ?? 0,
    recent: {
      average: recentDist?.average ?? 0,
      median: recentDist?.median ?? 0,
    },
    distribution: {
      huge_percent: recentDist?.huge_percent ?? 0,
      little_percent: recentDist?.little_percent ?? 0,
    },
    record: {
      requested_at: record?.requested_at?.toISOString() ?? new Date().toISOString(),
      total: record?.total ?? 0,
    },
    total_cocks_count: totals?.total_count ?? 0,
    growth_speed: growthSpeed?.growth_speed ?? 0,
  };

  logger.info("Get global cock dynamics", {
    service: "cocks",
    operation: "getDynamicGlobal",
    duration_ms: ticker(),
  });

  return result;
};

createGetDynamicGlobalAction.inject = [di.cockDal] as const;
