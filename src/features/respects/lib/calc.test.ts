import { describe, expect, it } from "bun:test";
import { calcSeasonRespect } from "./calc";

describe("calcSeasonRespect", () => {
  it("возвращает 0 для place <= 0", () => {
    expect(calcSeasonRespect(0)).toBe(0);
    expect(calcSeasonRespect(-1)).toBe(0);
    expect(calcSeasonRespect(-100)).toBe(0);
  });

  it("возвращает 1488 за первое место", () => {
    expect(calcSeasonRespect(1)).toBe(1337);
  });

  it("возвращает убывающий респект для мест 2..10", () => {
    const respects = Array.from({ length: 9 }, (_, i) => calcSeasonRespect(i + 2));
    for (let i = 1; i < respects.length; i++) {
      expect(respects[i]).toBeLessThanOrEqual(respects[i - 1] ?? -1);
    }
  });

  it("возвращает конкретные значения для известных мест", () => {
    expect(calcSeasonRespect(2)).toBe(Math.floor(1337 / 2 ** 1.2));
    expect(calcSeasonRespect(3)).toBe(Math.floor(1337 / 3 ** 1.2));
    expect(calcSeasonRespect(10)).toBe(Math.floor(1337 / 10 ** 1.2));
  });

  it("возвращает минимум 1 для очень далёких мест", () => {
    expect(calcSeasonRespect(10000)).toBe(1);
    expect(calcSeasonRespect(99999)).toBe(1);
  });
});
