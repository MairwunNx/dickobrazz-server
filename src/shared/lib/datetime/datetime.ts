import { Temporal } from "@js-temporal/polyfill";

const TZ = "Europe/Moscow";

export const moscowNow = (): Temporal.ZonedDateTime => Temporal.Now.zonedDateTimeISO(TZ);

export const moscowDayStart = (): Temporal.ZonedDateTime => moscowNow().startOfDay();

export const fromDate = (date: Date): Temporal.ZonedDateTime => Temporal.Instant.fromEpochMilliseconds(date.getTime()).toZonedDateTimeISO(TZ);

export const toDate = (zdt: Temporal.ZonedDateTime): Date => new Date(zdt.epochMilliseconds);

export const getTtlToMoscowMidnight = (): number => {
  const now = moscowNow();
  return Math.floor(now.until(now.startOfDay().add({ days: 1 })).total("seconds"));
};

export const isSameMoscowDay = (a: Date, b: Date): boolean => Temporal.PlainDate.compare(fromDate(a).toPlainDate(), fromDate(b).toPlainDate()) === 0;

export const formatMoscowISO = (date: Date): string => fromDate(date).toString();
