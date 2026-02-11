import type { CockDal } from "@/entities/cock";
import { getAuthUser } from "@/shared/context";
import { di } from "@/shared/injection";
import { logger } from "@/shared/lib/logger";
import { createTicker } from "@/shared/lib/profiling";
import type { PersonalGrowthSpeedResult, PersonalLast5FacetResult, PersonalRecordAndDatesResult, PersonalTotalsAndRatiosResult } from "./db/pipelines_personal";
import { pPersonalGrowthSpeed, pPersonalLast5Facet, pPersonalRecordAndDates, pPersonalTotalsAndRatios } from "./db/pipelines_personal";
import type { CockDynamicIndividual } from "./types";

export const createGetDynamicPersonalAction = (cockDal: CockDal) => async (): Promise<CockDynamicIndividual> => {
  const ticker = createTicker();
  const userId = getAuthUser().id;

  const [totalsAndRatios, last5Facet, recordAndDates, growthSpeed] = await Promise.all([
    cockDal.aggregate<PersonalTotalsAndRatiosResult>(pPersonalTotalsAndRatios(userId)),
    cockDal.aggregate<PersonalLast5FacetResult>(pPersonalLast5Facet(userId)),
    cockDal.aggregate<PersonalRecordAndDatesResult>(pPersonalRecordAndDates(userId)),
    cockDal.aggregate<PersonalGrowthSpeedResult>(pPersonalGrowthSpeed(userId)),
  ]);

  const totals = totalsAndRatios[0];

  const l5 = last5Facet[0];
  const userRecent = l5?.recent[0];
  const dailyGrowth = l5?.daily_growth[0];
  const dailyDynamics = l5?.daily_dynamics[0];
  const fiveCocks = l5?.five_cocks[0];
  const luck = l5?.luck[0];
  const vol = l5?.volatility[0];

  const rd = recordAndDates[0];
  const userRecord = rd?.record[0];
  const firstDate = rd?.first_date[0];

  const userGrowth = growthSpeed[0];

  const result: CockDynamicIndividual = {
    total_size: totals?.user_total ?? 0,
    recent_average: userRecent?.average ?? 0,
    irk: totals?.irk ?? 0,
    record: {
      requested_at: userRecord?.requested_at?.toISOString() ?? new Date().toISOString(),
      total: userRecord?.total ?? 0,
    },
    dominance: totals?.dominance ?? 0,
    daily_growth_average: dailyGrowth?.average ?? 0,
    daily_dynamics: {
      yesterday_cock_change: dailyDynamics?.yesterday_cock_change ?? 0,
      yesterday_cock_change_percent: dailyDynamics?.yesterday_cock_change_percent ?? 0,
    },
    five_cocks_dynamics: {
      five_cocks_change: fiveCocks?.five_cocks_change ?? 0,
      five_cocks_change_percent: fiveCocks?.five_cocks_change_percent ?? 0,
    },
    growth_speed: userGrowth?.growth_speed ?? 0,
    first_cock_date: firstDate?.first_date?.toISOString() ?? new Date().toISOString(),
    luck_coefficient: luck?.luck_coefficient ?? 1.0,
    volatility: vol?.volatility ?? 0,
    cocks_count: totals?.user_count ?? 0,
  };

  logger.info("Get personal cock dynamics", {
    service: "cocks",
    operation: "getDynamicPersonal",
    user_id: userId,
    duration_ms: ticker(),
  });

  return result;
};

createGetDynamicPersonalAction.inject = [di.cockDal] as const;
