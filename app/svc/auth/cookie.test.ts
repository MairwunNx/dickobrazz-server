import { describe, expect, it } from "bun:test";
import { extractCookieToken } from "./cookie";

describe("extractCookieToken", () => {
  it("возвращает token из cookie", () => {
    const headers = new Headers({ cookie: "foo=bar; session_token=abc123; baz=1" });
    expect(extractCookieToken(headers)).toBe("abc123");
  });

  it("возвращает null если cookie нет", () => {
    const headers = new Headers();
    expect(extractCookieToken(headers)).toBeNull();
  });

  it("возвращает null если cookie не содержит token", () => {
    const headers = new Headers({ cookie: "foo=bar; baz=1" });
    expect(extractCookieToken(headers)).toBeNull();
  });
});
