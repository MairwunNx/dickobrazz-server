import { describe, expect, it } from "bun:test";
import { setSessionCookie } from "./cookie";

describe("setSessionCookie", () => {
  it("ставит cookie с базовыми атрибутами", () => {
    const cookies = new Bun.CookieMap();
    setSessionCookie(cookies, "token123", 3600, false);
    const json = cookies.toJSON();
    expect(json.session_token).toBe("token123");
  });

  it("ставит Secure в проде", () => {
    const cookies = new Bun.CookieMap();
    setSessionCookie(cookies, "token123", 3600, true);
    const json = cookies.toJSON();
    expect(json.session_token).toBe("token123");
  });
});
