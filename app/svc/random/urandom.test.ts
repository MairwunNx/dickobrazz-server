import { describe, expect, it } from "bun:test";
import { secureRandomInRange } from "./urandom";

describe("secureRandomInRange", () => {
  it("возвращает значение в диапазоне 0..61", () => {
    for (let i = 0; i < 1000; i++) {
      const v = secureRandomInRange(0, 61);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(61);
    }
  });

  it("работает на произвольных диапазонах", () => {
    for (let i = 0; i < 500; i++) {
      const v = secureRandomInRange(5, 9);
      expect(v).toBeGreaterThanOrEqual(5);
      expect(v).toBeLessThanOrEqual(9);
    }
  });

  it("бросает ошибку если min >= max", () => {
    expect(() => secureRandomInRange(10, 10)).toThrow();
    expect(() => secureRandomInRange(11, 10)).toThrow();
  });

  it("возвращает только целые", () => {
    for (let i = 0; i < 200; i++) {
      const v = secureRandomInRange(0, 61);
      expect(Number.isInteger(v)).toBe(true);
    }
  });
});
