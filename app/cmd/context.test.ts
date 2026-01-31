import { describe, expect, it } from "bun:test";
import { getContext, withContext } from "./context";

describe("request context", () => {
  it("возвращает null вне контекста", () => {
    expect(getContext()).toBeNull();
  });

  it("читает контекст внутри withContext", async () => {
    const ctx = { request_id: "req-1", is_authenticated: false };
    const result = await withContext(ctx, () => getContext());
    expect(result).toEqual(ctx);
  });

  it("сохраняет контекст через async границы", async () => {
    const ctx = { request_id: "req-2", is_authenticated: true };
    const result = await withContext(ctx, async () => {
      await Promise.resolve();
      return getContext();
    });
    expect(result).toEqual(ctx);
  });
});
