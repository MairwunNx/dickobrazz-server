import { describe, expect, it } from "bun:test";
import { formatMoscowISO, fromDate, getTtlToMoscowMidnight, isSameMoscowDay, moscowDayStart, moscowNow, toDate } from "./datetime";

describe("datetime (Moscow Temporal)", () => {
  it("moscowNow возвращает ZonedDateTime в Europe/Moscow", () => {
    const now = moscowNow();
    expect(now.timeZoneId).toBe("Europe/Moscow");
    expect(Math.abs(now.epochMilliseconds - Date.now())).toBeLessThan(1000);
  });

  it("moscowDayStart задает 00:00:00", () => {
    const start = moscowDayStart();
    expect(start.hour).toBe(0);
    expect(start.minute).toBe(0);
    expect(start.second).toBe(0);
    expect(start.nanosecond).toBe(0);
  });

  it("fromDate/toDate — roundtrip сохраняет epoch", () => {
    const date = new Date("2025-01-15T12:00:00Z");
    const zdt = fromDate(date);
    const back = toDate(zdt);
    expect(back.getTime()).toBe(date.getTime());
    expect(zdt.timeZoneId).toBe("Europe/Moscow");
  });

  it("formatMoscowISO возвращает строку с +03:00 и Europe/Moscow", () => {
    const date = new Date("2025-01-15T12:00:00Z");
    const iso = formatMoscowISO(date);
    expect(iso).toContain("+03:00");
    expect(iso).toContain("Europe/Moscow");
  });

  it("isSameMoscowDay учитывает московский день", () => {
    // 23:30 UTC 1 Jan = 02:30 MSK 2 Jan
    // 00:30 UTC 2 Jan = 03:30 MSK 2 Jan
    const d1 = new Date("2025-01-01T23:30:00Z");
    const d2 = new Date("2025-01-02T00:30:00Z");
    expect(isSameMoscowDay(d1, d2)).toBe(true);
  });

  it("isSameMoscowDay различает разные московские дни", () => {
    // 20:30 UTC 1 Jan = 23:30 MSK 1 Jan
    // 21:30 UTC 1 Jan = 00:30 MSK 2 Jan
    const d1 = new Date("2025-01-01T20:30:00Z");
    const d2 = new Date("2025-01-01T21:30:00Z");
    expect(isSameMoscowDay(d1, d2)).toBe(false);
  });

  it("getTtlToMoscowMidnight возвращает 0 < ttl ≤ 86400", () => {
    const ttl = getTtlToMoscowMidnight();
    expect(ttl).toBeGreaterThan(0);
    expect(ttl).toBeLessThanOrEqual(86400);
  });
});
