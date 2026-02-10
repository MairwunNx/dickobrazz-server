import { describe, expect, it } from "bun:test";
import { createPageMeta, PAGE_LIMIT_MAX, PAGE_LIMIT_MIN, paginationFrom } from "./pagination";

describe("paginationFrom", () => {
  it("возвращает undefined для отсутствующих параметров", () => {
    const url = new URL("https://example.com/test");
    expect(paginationFrom(url)).toEqual({ limit: undefined, page: undefined });
  });

  it("парсит limit и page из query", () => {
    const url = new URL("https://example.com/test?limit=20&page=3");
    expect(paginationFrom(url)).toEqual({ limit: 20, page: 3 });
  });

  it("возвращает undefined для нечисловых значений", () => {
    const url = new URL("https://example.com/test?limit=abc&page=def");
    const result = paginationFrom(url);
    expect(result.limit).toBeUndefined();
    expect(result.page).toBeUndefined();
  });

  it("клампит limit снизу до PAGE_LIMIT_MIN", () => {
    const url = new URL("https://example.com/test?limit=1");
    expect(paginationFrom(url)).toEqual({ limit: PAGE_LIMIT_MIN, page: undefined });
  });

  it("клампит limit сверху до PAGE_LIMIT_MAX", () => {
    const url = new URL("https://example.com/test?limit=9999");
    expect(paginationFrom(url)).toEqual({ limit: PAGE_LIMIT_MAX, page: undefined });
  });

  it("не трогает limit в допустимом диапазоне", () => {
    const url = new URL("https://example.com/test?limit=25");
    expect(paginationFrom(url)).toEqual({ limit: 25, page: undefined });
  });

  it("page < 1 возвращает undefined", () => {
    const url = new URL("https://example.com/test?page=0");
    expect(paginationFrom(url)).toEqual({ limit: undefined, page: undefined });
  });

  it("page = -5 возвращает undefined", () => {
    const url = new URL("https://example.com/test?page=-5");
    expect(paginationFrom(url)).toEqual({ limit: undefined, page: undefined });
  });
});

describe("createPageMeta", () => {
  it("формирует мета с page и total_pages", () => {
    expect(createPageMeta(10, 100, 2)).toEqual({ limit: 10, total: 100, page: 2, total_pages: 10 });
  });

  it("формирует мета без page", () => {
    expect(createPageMeta(10, 100)).toEqual({ limit: 10, total: 100, page: undefined, total_pages: 10 });
  });

  it("округляет total_pages вверх", () => {
    expect(createPageMeta(10, 25, 1)).toEqual({ limit: 10, total: 25, page: 1, total_pages: 3 });
  });

  it("возвращает 0 total_pages при limit=0", () => {
    expect(createPageMeta(0, 100, 1)).toEqual({ limit: 0, total: 100, page: 1, total_pages: 0 });
  });
});
