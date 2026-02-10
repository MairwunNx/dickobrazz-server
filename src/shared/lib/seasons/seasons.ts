export interface CockSeason {
  season_num: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

const MOSCOW_TZ = "Europe/Moscow";
const SEASON_MONTHS = 3;

const startOfDayMoscow = (date: Date): Date => {
  const moscowDate = new Date(date.toLocaleString("en-US", { timeZone: MOSCOW_TZ }));
  moscowDate.setHours(0, 0, 0, 0);
  return moscowDate;
};

const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

export const getAllSeasons = (firstCockDate: Date): CockSeason[] => {
  const normalizedFirst = startOfDayMoscow(firstCockDate);
  const now = startOfDayMoscow(new Date());

  const seasons: CockSeason[] = [];
  let currentDate = normalizedFirst;
  let seasonNum = 1;

  while (currentDate <= now) {
    const endDate = addMonths(currentDate, SEASON_MONTHS);
    const isActive = now >= currentDate && now < endDate;

    seasons.push({
      season_num: seasonNum,
      start_date: currentDate.toISOString(),
      end_date: endDate.toISOString(),
      is_active: isActive,
    });

    currentDate = endDate;
    seasonNum++;
  }

  return seasons;
};

export const findActiveSeason = (firstCockDate: Date): CockSeason | undefined => getAllSeasons(firstCockDate).find((s) => s.is_active);
