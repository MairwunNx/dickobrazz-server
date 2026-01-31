import { describe, expect, it } from "bun:test";
import { createPageMeta, paginationFrom } from "./pagination";

describe("paginationFrom", () => {
  it("возвращает undefined для отсутствующих параметров", () => {
    const url = new URL("https://example.com/test");
    expect(paginationFrom(url)).toEqual({ limit: undefined, page: undefined });
  });

  it("парсит limit и page из query", () => {
    const url = new URL("https://example.com/test?limit=20&page=3");
    expect(paginationFrom(url)).toEqual({ limit: 20, page: 3 });
  });

  it("оставляет NaN для нечисловых значений", () => {
    const url = new URL("https://example.com/test?limit=abc&page=def");
    const result = paginationFrom(url);
    expect(Number.isNaN(result.limit)).toBe(true);
    expect(Number.isNaN(result.page)).toBe(true);
  });
});

describe("createPageMeta", () => {
  it("формирует мета с page", () => {
    expect(createPageMeta(10, 100, 2)).toEqual({ limit: 10, total: 100, page: 2 });
  });

  it("формирует мета без page", () => {
    expect(createPageMeta(10, 100)).toEqual({ limit: 10, total: 100, page: undefined });
  });
});
