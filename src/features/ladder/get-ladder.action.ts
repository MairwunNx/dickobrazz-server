import type { CockDal } from "@/entities/cock";
import type { UserDal, UserDoc } from "@/entities/user";
import { normalizeNickname } from "@/entities/user";
import { getContext } from "@/shared/context";
import { di } from "@/shared/injection";
import { logger } from "@/shared/lib/logger";
import { createTicker } from "@/shared/lib/profiling";
import { createPageMeta } from "@/shared/net/pagination";
import type { AggLeadersAndCount, AggUserContext } from "./db/pipelines";
import { pLeadersAndCount, pUserContext } from "./db/pipelines";
import type { CockLadderResponse, LeaderboardEntry, UserNeighborhood } from "./types";

interface PaginationParams {
  limit?: number;
  page?: number;
}

const toLeaderboardEntry = (userId: number, size: number, userMap: Map<number, UserDoc>): LeaderboardEntry => ({
  user_id: userId,
  nickname: normalizeNickname(userMap.get(userId) ?? null, userId),
  size,
});

export const createGetLadderAction =
  (cockDal: CockDal, userDal: UserDal) =>
  async (params: PaginationParams): Promise<CockLadderResponse> => {
    const ticker = createTicker();
    const limit = params.limit || 13;
    const page = params.page || 1;

    const ctx = getContext();
    const userId = ctx?.user?.id ?? null;

    // Максимум 2 скана (1 для анонимов): facet(leaders+count) + windowFields(position+neighbors)
    const [facetResult, userContextResult] = await Promise.all([
      cockDal.aggregate<AggLeadersAndCount>(pLeadersAndCount(limit, page)),
      userId ? cockDal.aggregate<AggUserContext>(pUserContext(userId)) : Promise.resolve([]),
    ]);

    const facet = facetResult[0] ?? { leaders: [], total: [] };
    const totalParticipants = facet.total[0]?.count ?? 0;
    const rawLeaders = facet.leaders;

    const userCtx = userContextResult[0] as AggUserContext | undefined;
    const userPosition = userCtx?.position ?? null;

    // Собираем все нужные user_id для batch-запроса никнеймов
    const neededIds = new Set(rawLeaders.map((r) => r._id));
    if (userCtx) {
      neededIds.add(userCtx._id);
      if (userCtx.above_id !== null) neededIds.add(userCtx.above_id);
      if (userCtx.below_id !== null) neededIds.add(userCtx.below_id);
    }

    const users = neededIds.size > 0 ? await userDal.findByUserIds([...neededIds]) : [];
    const userMap = new Map(users.map((u) => [u.user_id, u]));

    const leaders = rawLeaders.map((r) => toLeaderboardEntry(r._id, r.total_size, userMap));

    // Neighborhood: скрываем соседей, которые уже на текущей странице
    let neighborhood: UserNeighborhood = { above: [], self: undefined, below: [] };

    if (userCtx) {
      const leaderIds = new Set(rawLeaders.map((r) => r._id));

      neighborhood = {
        above:
          userCtx.above_id !== null && userCtx.above_size !== null && !leaderIds.has(userCtx.above_id) ? [toLeaderboardEntry(userCtx.above_id, userCtx.above_size, userMap)] : [],
        self: toLeaderboardEntry(userCtx._id, userCtx.total_size, userMap),
        below:
          userCtx.below_id !== null && userCtx.below_size !== null && !leaderIds.has(userCtx.below_id) ? [toLeaderboardEntry(userCtx.below_id, userCtx.below_size, userMap)] : [],
      };
    }

    logger.info("Ladder fetched", {
      service: "cocks",
      operation: "getLadder",
      user_id: userId ?? undefined,
      total_participants: totalParticipants,
      leaders_count: leaders.length,
      duration_ms: ticker(),
    });

    return {
      leaders,
      total_participants: totalParticipants,
      user_position: userPosition ?? undefined,
      neighborhood,
      page: createPageMeta(limit, totalParticipants, page),
    };
  };

createGetLadderAction.inject = [di.cockDal, di.userDal] as const;
