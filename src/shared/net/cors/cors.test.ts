import { describe, expect, it } from "bun:test";
import { getCorsHeaders } from "./cors";

describe("getCorsHeaders", () => {
  it("возвращает пустой объект без origin", () => {
    expect(getCorsHeaders(null)).toEqual({});
  });

  it("возвращает заголовки для разрешенного origin", () => {
    const origin = "https://dickobrazz.com";
    expect(getCorsHeaders(origin)).toEqual({
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Internal-Token, X-Internal-User-Id, X-Internal-User-Name, X-Request-Id",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Max-Age": "86400",
      Vary: "Origin",
    });
  });

  it("возвращает пустой объект для неразрешенного origin", () => {
    expect(getCorsHeaders("https://evil.com")).toEqual({});
  });

  it("разрешает поддомены dickobrazz.com", () => {
    const origin = "https://app.dickobrazz.com";
    const result = getCorsHeaders(origin);
    expect(result["Access-Control-Allow-Origin"]).toBe(origin);
  });

  it("блокирует вложенные поддомены", () => {
    expect(getCorsHeaders("https://evil.sub.dickobrazz.com")).toEqual({});
  });

  it("включает Access-Control-Allow-Credentials", () => {
    const result = getCorsHeaders("https://dickobrazz.com");
    expect(result["Access-Control-Allow-Credentials"]).toBe("true");
  });
});
