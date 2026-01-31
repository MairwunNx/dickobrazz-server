import { describe, expect, it } from "bun:test";
import { buildSessionCookie } from "./cookie";

describe("buildSessionCookie", () => {
  it("собирает cookie с базовыми атрибутами", () => {
    const result = buildSessionCookie("token123", 3600, false);
    expect(result).toContain("session_token=token123");
    expect(result).toContain("Path=/");
    expect(result).toContain("HttpOnly");
    expect(result).toContain("SameSite=Lax");
    expect(result).toContain("Max-Age=3600");
    expect(result).not.toContain("Secure");
  });

  it("добавляет Secure в проде", () => {
    const result = buildSessionCookie("token123", 3600, true);
    expect(result).toContain("Secure");
  });
});
