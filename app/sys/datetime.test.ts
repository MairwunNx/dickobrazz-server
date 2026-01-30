import { describe, expect, it } from "bun:test";
import { formatMoscowISO, getMoscowDate, getMoscowDayEnd, getMoscowDayStart, isSameDay } from "./datetime"; // поправь путь

describe("datetime (Moscow)", () => {
  it("getMoscowDate возвращает московское время", () => {
    const nowMoscow = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Europe/Moscow" })
    ).getTime();

    const moscow = getMoscowDate().getTime();
    expect(Math.abs(moscow - nowMoscow)).toBeLessThan(1000); // 1 сек допуск
  });

  it("getMoscowDayStart задает 00:00:00.000", () => {
    const d = getMoscowDayStart();
    expect(d.getHours()).toBe(0);
    expect(d.getMinutes()).toBe(0);
    expect(d.getSeconds()).toBe(0);
    expect(d.getMilliseconds()).toBe(0);
  });

  it("getMoscowDayEnd задает 23:59:59.999", () => {
    const d = getMoscowDayEnd();
    expect(d.getHours()).toBe(23);
    expect(d.getMinutes()).toBe(59);
    expect(d.getSeconds()).toBe(59);
    expect(d.getMilliseconds()).toBe(999);
  });

  it("formatMoscowISO возвращает ISO с +03:00", () => {
    const d = new Date("2025-01-15T12:00:00Z");
    const iso = formatMoscowISO(d);
    expect(iso.endsWith("+03:00")).toBe(true);
  });

  it("isSameDay учитывает московский день", () => {
    // 23:30 UTC = 02:30 MSK следующего дня
    const d1 = new Date("2025-01-01T23:30:00Z");
    const d2 = new Date("2025-01-02T00:30:00Z");
    expect(isSameDay(d1, d2)).toBe(true);
  });
});
