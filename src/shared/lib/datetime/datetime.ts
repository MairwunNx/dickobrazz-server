const MOSCOW_TZ = "Europe/Moscow";

export const getMoscowDate = (): Date => {
  return new Date(new Date().toLocaleString("en-US", { timeZone: MOSCOW_TZ }));
};

export const getMoscowDayStart = (): Date => {
  const moscowDate = getMoscowDate();
  moscowDate.setHours(0, 0, 0, 0);
  return moscowDate;
};

export const getMoscowDayEnd = (): Date => {
  const moscowDate = getMoscowDate();
  moscowDate.setHours(23, 59, 59, 999);
  return moscowDate;
};

export const formatMoscowISO = (date: Date): string => {
  return new Date(date.toLocaleString("en-US", { timeZone: MOSCOW_TZ })).toISOString().replace("Z", "+03:00");
};

export const getTtlToMoscowMidnight = (): number => {
  const now = getMoscowDate();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return Math.floor((tomorrow.getTime() - now.getTime()) / 1000);
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  const d1 = new Date(date1.toLocaleString("en-US", { timeZone: MOSCOW_TZ }));
  const d2 = new Date(date2.toLocaleString("en-US", { timeZone: MOSCOW_TZ }));
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
};
