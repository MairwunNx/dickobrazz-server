import type { CockDal } from "@/entities/cock";
import type { UserDal, UserDoc } from "@/entities/user";
import { normalizeNickname } from "@/entities/user";
import { getContext } from "@/shared/context";
import { di } from "@/shared/injection";
import { logger } from "@/shared/lib/logger";
import { createTicker } from "@/shared/lib/profiling";
import { type CockSeason, getAllSeasons } from "@/shared/lib/seasons";
import { createPageMeta, PAGE_LIMIT_MIN } from "@/shared/net/pagination";
import type { AggWinner } from "./db/pipelines";
import { pFirstCockDate, pNeighborhoodInSeason, pSeasonCockersCount, pSeasonWinners, pUserPositionInSeason } from "./db/pipelines";
import type { CockSeasonsResponse, SeasonNeighborhood, SeasonWinner } from "./types";

interface PaginationParams {
  limit?: number;
  page?: number;
}

export const createGetSeasonsAction =
  (cockDal: CockDal, userDal: UserDal) =>
  async (params: PaginationParams): Promise<CockSeasonsResponse> => {
    const ticker = createTicker();
    const limit = params.limit || PAGE_LIMIT_MIN;
    const page = params.page || 1;

    const ctx = getContext();
    const userId = ctx?.user?.id ?? null;

    const firstCockResult = await cockDal.aggregate<{ first_date: Date }>(pFirstCockDate());
    const firstCockDate = firstCockResult[0]?.first_date;

    if (!firstCockDate) {
      return { seasons: [], page: createPageMeta(limit, 0, page) };
    }

    const allSeasons = getAllSeasons(firstCockDate).reverse();

    const start = (page - 1) * limit;
    const paginatedSeasons = allSeasons.slice(start, start + limit);

    const seasonData = await Promise.all(
      paginatedSeasons.map(async (season) => {
        const { startDate, endDate } = seasonDates(season);

        const [rawWinners, countResult, positionResult] = await Promise.all([
          season.is_active ? Promise.resolve([]) : cockDal.aggregate<AggWinner>(pSeasonWinners(startDate, endDate)),
          cockDal.aggregate<{ total: number }>(pSeasonCockersCount(startDate, endDate)),
          userId ? cockDal.aggregate<{ position: number }>(pUserPositionInSeason(userId, startDate, endDate)) : Promise.resolve([]),
        ]);

        const totalParticipants = countResult[0]?.total ?? 0;
        const userPosition = positionResult[0]?.position ?? null;

        const rawNeighborhood = userId && userPosition ? await cockDal.aggregate<AggWinner>(pNeighborhoodInSeason(userPosition, startDate, endDate)) : [];

        return { rawWinners, totalParticipants, userPosition, rawNeighborhood };
      })
    );

    const allUserIds = new Set<number>();
    for (const { rawWinners, rawNeighborhood } of seasonData) {
      for (const w of rawWinners) allUserIds.add(w._id);
      for (const n of rawNeighborhood) allUserIds.add(n._id);
    }

    const users = allUserIds.size > 0 ? await userDal.findByUserIds([...allUserIds]) : [];
    const userMap = new Map(users.map((u) => [u.user_id, u]));

    // seasonData и paginatedSeasons гарантированно одной длины (Promise.all по paginatedSeasons)
    const seasons = paginatedSeasons.map((season, i) => {
      // biome-ignore lint/style/noNonNullAssertion: индексы совпадают с paginatedSeasons
      const { rawWinners, totalParticipants, userPosition, rawNeighborhood } = seasonData[i]!;

      const winners = rawWinners.map((w, idx) => toSeasonWinner(w._id, w.total_size, idx + 1, userMap));

      const winnerIds = new Set(rawWinners.map((w) => w._id));
      let neighborhood: SeasonNeighborhood = { above: [], self: undefined, below: [] };

      if (userId && userPosition && rawNeighborhood.length > 0) {
        const selfIdx = rawNeighborhood.findIndex((e) => e._id === userId);

        if (selfIdx !== -1) {
          const skip = Math.max(userPosition - 2, 0);

          neighborhood = {
            above: rawNeighborhood
              .slice(0, selfIdx)
              .filter((e) => !winnerIds.has(e._id))
              .map((e) => toSeasonWinner(e._id, e.total_size, skip + 1 + rawNeighborhood.indexOf(e), userMap)),
            self: toSeasonWinner(userId, rawNeighborhood[selfIdx]?.total_size ?? 0, userPosition, userMap),
            below: rawNeighborhood
              .slice(selfIdx + 1)
              .filter((e) => !winnerIds.has(e._id))
              .map((e) => toSeasonWinner(e._id, e.total_size, skip + 1 + rawNeighborhood.indexOf(e), userMap)),
          };
        }
      }

      return {
        season_num: season.season_num,
        start_date: season.start_date,
        end_date: season.end_date,
        is_active: season.is_active,
        winners,
        total_participants: totalParticipants,
        user_position: userPosition ?? undefined,
        neighborhood,
      };
    });

    logger.info("Get cock seasons", {
      service: "cocks",
      operation: "getSeasons",
      user_id: userId ?? undefined,
      seasons_count: seasons.length,
      duration_ms: ticker(),
    });

    return {
      seasons,
      page: createPageMeta(limit, allSeasons.length, page),
    };
  };

createGetSeasonsAction.inject = [di.cockDal, di.userDal] as const;

const toSeasonWinner = (userId: number, totalSize: number, place: number, userMap: Map<number, UserDoc>): SeasonWinner => ({
  user_id: userId,
  nickname: normalizeNickname(userMap.get(userId) ?? null, userId),
  total_size: totalSize,
  place,
});

const seasonDates = (season: CockSeason) => ({
  startDate: new Date(season.start_date),
  endDate: new Date(season.end_date),
});
