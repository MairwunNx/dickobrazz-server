import { describe, expect, it } from "bun:test";
import { urandom } from "./urandom";

describe("secureRandomInRange", () => {
  it("возвращает значение в диапазоне 0..61", () => {
    for (let i = 0; i < 1000; i++) {
      const v = urandom(0, 61);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(61);
    }
  });

  it("работает на произвольных диапазонах", () => {
    for (let i = 0; i < 500; i++) {
      const v = urandom(5, 9);
      expect(v).toBeGreaterThanOrEqual(5);
      expect(v).toBeLessThanOrEqual(9);
    }
  });

  it("работает на больших диапазонах (не степень двойки)", () => {
    for (let i = 0; i < 500; i++) {
      const v = urandom(0, 199);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(199);
    }
  });

  it("работает на диапазоне больше 65536", () => {
    for (let i = 0; i < 200; i++) {
      const v = urandom(0, 100000);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(100000);
    }
  });

  it("бросает ошибку если min >= max", () => {
    expect(() => urandom(10, 10)).toThrow();
    expect(() => urandom(11, 10)).toThrow();
  });

  it("возвращает только целые", () => {
    for (let i = 0; i < 200; i++) {
      const v = urandom(0, 61);
      expect(Number.isInteger(v)).toBe(true);
    }
  });

  it("равномерно распределяет значения (chi-squared)", () => {
    const min = 0;
    const max = 4;
    const range = max - min + 1;
    const n = 10000;
    const expected = n / range;
    const counts = new Array(range).fill(0);

    for (let i = 0; i < n; i++) {
      counts[urandom(min, max) - min]++;
    }

    let chiSquared = 0;
    for (const count of counts) {
      chiSquared += (count - expected) ** 2 / expected;
    }

    expect(chiSquared).toBeLessThan(15);
  });
});
