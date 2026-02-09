import { describe, expect, it } from "bun:test";
import type { BunRequest } from "bun";
import { extractCookieToken } from "./cookie";

describe("extractCookieToken", () => {
  it("возвращает token из cookie", () => {
    const req = { cookies: new Bun.CookieMap() } as BunRequest;
    req.cookies.set("session_token", "abc123");
    expect(extractCookieToken(req)).toBe("abc123");
  });

  it("возвращает null если cookie нет", () => {
    const req = { cookies: new Bun.CookieMap() } as BunRequest;
    expect(extractCookieToken(req)).toBeNull();
  });

  it("возвращает null если cookie не содержит token", () => {
    const req = { cookies: new Bun.CookieMap() } as BunRequest;
    req.cookies.set("foo", "bar");
    expect(extractCookieToken(req)).toBeNull();
  });
});
