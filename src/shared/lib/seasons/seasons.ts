import { Temporal } from "@js-temporal/polyfill";

export interface CockSeason {
  season_num: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

const TZ = "Europe/Moscow";
const SEASON_MONTHS = 3;

const toISO = (date: Temporal.PlainDate): string => new Date(date.toZonedDateTime({ timeZone: TZ }).epochMilliseconds).toISOString();

export const getAllSeasons = (firstCockDate: Date): CockSeason[] => {
  const first = Temporal.Instant.fromEpochMilliseconds(firstCockDate.getTime()).toZonedDateTimeISO(TZ).startOfDay().toPlainDate();
  const today = Temporal.Now.plainDateISO(TZ);

  const seasons: CockSeason[] = [];
  let current = first;
  let seasonNum = 1;

  while (Temporal.PlainDate.compare(current, today) <= 0) {
    const end = current.add({ months: SEASON_MONTHS });
    const isActive = Temporal.PlainDate.compare(today, current) >= 0 && Temporal.PlainDate.compare(today, end) < 0;

    seasons.push({
      season_num: seasonNum,
      start_date: toISO(current),
      end_date: toISO(end),
      is_active: isActive,
    });

    current = end;
    seasonNum++;
  }

  return seasons;
};

export const findActiveSeason = (firstCockDate: Date): CockSeason | undefined => getAllSeasons(firstCockDate).find((s) => s.is_active);
