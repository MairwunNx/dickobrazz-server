import { describe, expect, it } from "bun:test";
import { once } from "./once";

describe("once", () => {
  it("вызывает функцию один раз и кеширует результат", () => {
    let calls = 0;
    const fn = once((a: number, b: number) => {
      calls += 1;
      return a + b;
    });

    expect(fn(1, 2)).toBe(3);
    expect(fn(5, 6)).toBe(3);
    expect(calls).toBe(1);
  });

  it("кеширует ошибку при cacheError", () => {
    let calls = 0;
    const err = new Error("boom");
    const fn = once(
      () => {
        calls += 1;
        throw err;
      },
      { cacheError: true }
    );

    expect(() => fn()).toThrow(err);
    expect(() => fn()).toThrow(err);
    expect(calls).toBe(1);
  });

  it("сбрасывает кэш после reset", () => {
    let calls = 0;
    const fn = once(() => {
      calls += 1;
      return calls;
    });

    expect(fn()).toBe(1);
    fn.reset();
    expect(fn()).toBe(2);
    expect(calls).toBe(2);
  });

  it("возвращает один и тот же промис при cachePromise", async () => {
    let calls = 0;
    const fn = once(
      () => {
        calls += 1;
        return Promise.resolve("ok");
      },
      { cachePromise: true }
    );

    const p1 = fn();
    const p2 = fn();
    expect(p1).toBe(p2);
    await expect(p1).resolves.toBe("ok");
    expect(calls).toBe(1);
  });

  it("повторяет вызов после reject без cacheError", async () => {
    let calls = 0;
    const fn = once(
      () => {
        calls += 1;
        return Promise.reject(new Error("nope"));
      },
      { cachePromise: true }
    );

    await expect(fn()).rejects.toThrow("nope");
    await expect(fn()).rejects.toThrow("nope");
    expect(calls).toBe(2);
  });
});
