import { describe, expect, it } from "bun:test";
import { base64UrlDecode, base64UrlEncode } from "./base64";

describe("base64UrlEncode/base64UrlDecode", () => {
  it("кодирует в url-safe base64", () => {
    const encoded = base64UrlEncode(Buffer.from("hello"));
    expect(encoded).toBe("aGVsbG8");
    expect(encoded).not.toContain("+");
    expect(encoded).not.toContain("/");
    expect(encoded).not.toContain("=");
  });

  it("декодирует обратно исходные данные", () => {
    const encoded = base64UrlEncode(Buffer.from("hello"));
    const decoded = base64UrlDecode(encoded).toString("utf-8");
    expect(decoded).toBe("hello");
  });
});
