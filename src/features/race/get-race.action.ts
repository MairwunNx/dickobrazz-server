import type { CockDal } from "@/entities/cock";
import type { UserDal, UserDoc } from "@/entities/user";
import { normalizeNickname } from "@/entities/user";
import { getContext } from "@/shared/context";
import { di } from "@/shared/injection";
import { logger } from "@/shared/lib/logger";
import { createTicker } from "@/shared/lib/profiling";
import { findActiveSeason } from "@/shared/lib/seasons";
import { createPageMeta } from "@/shared/net/pagination";
import type { AggLeadersAndCount, AggUserContext } from "./db/pipelines";
import { pFirstCockDate, pRaceLeadersAndCount, pRaceUserContext } from "./db/pipelines";
import type { CockRaceResponse, RaceEntry, RaceNeighborhood } from "./types";

interface PaginationParams {
  limit?: number;
  page?: number;
}

const toRaceEntry = (userId: number, totalSize: number, userMap: Map<number, UserDoc>): RaceEntry => ({
  user_id: userId,
  nickname: normalizeNickname(userMap.get(userId) ?? null, userId),
  total_size: totalSize,
});

const EMPTY_NEIGHBORHOOD: RaceNeighborhood = { above: [], self: undefined, below: [] };

export const createGetRaceAction =
  (cockDal: CockDal, userDal: UserDal) =>
  async (params: PaginationParams): Promise<CockRaceResponse> => {
    const ticker = createTicker();
    const limit = params.limit || 13;
    const page = params.page || 1;

    const ctx = getContext();
    const userId = ctx?.user?.id ?? null;

    const firstCockResult = await cockDal.aggregate<{ first_date: Date }>(pFirstCockDate());
    const firstCockDate = firstCockResult[0]?.first_date;

    if (!firstCockDate) {
      return {
        season: undefined,
        leaders: [],
        total_participants: 0,
        user_position: null,
        neighborhood: EMPTY_NEIGHBORHOOD,
        page: createPageMeta(limit, 0, page),
      };
    }

    const currentSeason = findActiveSeason(firstCockDate);
    const startDate = currentSeason ? new Date(currentSeason.start_date) : undefined;
    const endDate = currentSeason ? new Date(currentSeason.end_date) : undefined;

    const [facetResult, userContextResult] = await Promise.all([
      cockDal.aggregate<AggLeadersAndCount>(pRaceLeadersAndCount(limit, page, startDate, endDate)),
      userId ? cockDal.aggregate<AggUserContext>(pRaceUserContext(userId, startDate, endDate)) : Promise.resolve([]),
    ]);

    const facet = facetResult[0] ?? { leaders: [], total: [] };
    const totalParticipants = facet.total[0]?.count ?? 0;
    const rawLeaders = facet.leaders;

    const userCtx = userContextResult[0] as AggUserContext | undefined;
    const userPosition = userCtx?.position ?? null;

    const neededIds = new Set(rawLeaders.map((r) => r._id));
    if (userCtx) {
      neededIds.add(userCtx._id);
      if (userCtx.above_id !== null) neededIds.add(userCtx.above_id);
      if (userCtx.below_id !== null) neededIds.add(userCtx.below_id);
    }

    const users = neededIds.size > 0 ? await userDal.findByUserIds([...neededIds]) : [];
    const userMap = new Map(users.map((u) => [u.user_id, u]));

    const leaders = rawLeaders.map((r) => toRaceEntry(r._id, r.total_size, userMap));

    let neighborhood: RaceNeighborhood = EMPTY_NEIGHBORHOOD;

    if (userCtx) {
      const leaderIds = new Set(rawLeaders.map((r) => r._id));

      neighborhood = {
        above: userCtx.above_id !== null && userCtx.above_size !== null && !leaderIds.has(userCtx.above_id) ? [toRaceEntry(userCtx.above_id, userCtx.above_size, userMap)] : [],
        self: toRaceEntry(userCtx._id, userCtx.total_size, userMap),
        below: userCtx.below_id !== null && userCtx.below_size !== null && !leaderIds.has(userCtx.below_id) ? [toRaceEntry(userCtx.below_id, userCtx.below_size, userMap)] : [],
      };
    }

    logger.info("Race fetched", {
      service: "cocks",
      operation: "getRace",
      user_id: userId ?? undefined,
      total_participants: totalParticipants,
      leaders_count: leaders.length,
      season_num: currentSeason?.season_num,
      duration_ms: ticker(),
    });

    return {
      season: currentSeason
        ? {
            season_num: currentSeason.season_num,
            start_date: currentSeason.start_date,
            end_date: currentSeason.end_date,
          }
        : undefined,
      leaders,
      total_participants: totalParticipants,
      user_position: userPosition,
      neighborhood,
      page: createPageMeta(limit, totalParticipants, page),
    };
  };

createGetRaceAction.inject = [di.cockDal, di.userDal] as const;
