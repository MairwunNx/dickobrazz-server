import type { RedisClient } from "bun";
import type { UserDal } from "@/entities/user";
import { normalizeNickname } from "@/entities/user";
import { getContext } from "@/shared/context";
import { di } from "@/shared/injection";
import { logger } from "@/shared/lib/logger";
import { createTicker } from "@/shared/lib/profiling";
import { createPageMeta } from "@/shared/net/pagination";
import type { CockRulerResponse, LeaderboardEntry, UserNeighborhood } from "./types";

interface PaginationParams {
  limit?: number;
  page?: number;
}

interface RawEntry {
  userId: number;
  size: number;
}

const RULER_KEY = "ruler:daily";

const parseWithScores = (raw: [string, number][]): RawEntry[] => raw.map(([member, score]) => ({ userId: Number(member), size: score }));

export const createGetRulerAction =
  (redis: RedisClient, userDal: UserDal) =>
  async (params: PaginationParams): Promise<CockRulerResponse> => {
    const ticker = createTicker();
    const limit = params.limit || 13;
    const page = params.page || 1;

    const ctx = getContext();
    const userId = ctx?.user?.id ?? null;

    const start = (page - 1) * limit;
    const stop = start + limit - 1;

    const [rawLeaders, totalParticipants, userRank] = await Promise.all([
      redis.zrevrange(RULER_KEY, start, stop, "WITHSCORES"),
      redis.zcard(RULER_KEY),
      userId !== null ? redis.zrevrank(RULER_KEY, String(userId)) : Promise.resolve(null),
    ]);

    const leaders = parseWithScores(rawLeaders);
    const neededIds = new Set(leaders.map((l) => l.userId));

    let neighbors: RawEntry[] = [];

    if (userId !== null && userRank !== null) {
      neededIds.add(userId);
      const nStart = Math.max(0, userRank - 1);
      const nStop = userRank + 1;
      const rawNeighbors = await redis.zrevrange(RULER_KEY, nStart, nStop, "WITHSCORES");
      neighbors = parseWithScores(rawNeighbors);
      for (const n of neighbors) neededIds.add(n.userId);
    }

    const users = neededIds.size > 0 ? await userDal.findByUserIds([...neededIds]) : [];
    const userMap = new Map(users.map((u) => [u.user_id, u]));

    const toEntry = (e: RawEntry): LeaderboardEntry => ({
      user_id: e.userId,
      nickname: normalizeNickname(userMap.get(e.userId) ?? null, e.userId),
      size: e.size,
    });

    const leaderEntries = leaders.map(toEntry);

    let userPosition: number | null = null;
    let neighborhood: UserNeighborhood = { above: [], self: undefined, below: [] };

    if (userId !== null && userRank !== null) {
      userPosition = userRank + 1;

      const selfIdx = neighbors.findIndex((n) => n.userId === userId);
      const selfEntry = selfIdx !== -1 ? neighbors[selfIdx] : undefined;
      const aboveEntry = selfIdx > 0 ? neighbors[selfIdx - 1] : undefined;
      const belowEntry = selfIdx !== -1 && selfIdx < neighbors.length - 1 ? neighbors[selfIdx + 1] : undefined;

      const onPage = (rank: number) => rank >= start && rank <= stop;

      neighborhood = {
        above: aboveEntry && !onPage(userRank - 1) ? [toEntry(aboveEntry)] : [],
        self: selfEntry ? toEntry(selfEntry) : undefined,
        below: belowEntry && !onPage(userRank + 1) ? [toEntry(belowEntry)] : [],
      };
    }

    logger.info("Daily ruler fetched", {
      service: "cocks",
      operation: "getRuler",
      user_id: userId ?? undefined,
      total_participants: totalParticipants,
      leaders_count: leaderEntries.length,
      duration_ms: ticker(),
    });

    return {
      leaders: leaderEntries,
      total_participants: totalParticipants,
      user_position: userPosition,
      neighborhood,
      page: createPageMeta(limit, totalParticipants, page),
    };
  };

createGetRulerAction.inject = [di.redis, di.userDal] as const;
