import { describe, expect, it } from "bun:test";
import { extractBearerToken } from "./bearer";

describe("extractBearerToken", () => {
  it("возвращает token из Authorization", () => {
    const headers = new Headers({ Authorization: "Bearer abc.def.ghi" });
    expect(extractBearerToken(headers)).toBe("abc.def.ghi");
  });

  it("возвращает null при отсутствии заголовка", () => {
    const headers = new Headers();
    expect(extractBearerToken(headers)).toBeNull();
  });

  it("возвращает null при неверной схеме", () => {
    const headers = new Headers({ Authorization: "Token abc" });
    expect(extractBearerToken(headers)).toBeNull();
  });
});
