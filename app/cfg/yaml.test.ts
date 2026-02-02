// biome-ignore-all lint/suspicious/noTemplateCurlyInString: буквальные строки для тестов, так и запланировано.

import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { expand } from "./yaml";

describe("expand", () => {
  const oldEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...oldEnv };
  });

  afterEach(() => {
    process.env = { ...oldEnv };
  });

  it("подставляет переменные окружения", () => {
    process.env.FOO = "bar";
    const text = "key: ${FOO}";
    const result = expand(text) as { key: string };
    expect(result.key).toBe("bar");
  });

  it("использует дефолт если env нет", () => {
    delete process.env.MISSING;
    const text = "key: ${MISSING:-fallback}";
    const result = expand(text) as { key: string };
    expect(result.key).toBe("fallback");
  });

  it("бросает ошибку если env нет и дефолта нет", () => {
    delete process.env.NOPE;
    const text = "key: ${NOPE}";
    expect(() => expand(text)).toThrow('ENV var "NOPE" is not set');
  });

  it("обрабатывает несколько переменных", () => {
    process.env.A = "1";
    process.env.B = "2";
    const text = `
    a: "${"${A}"}"
    b: "${"${B}"}"
    `;
    const result = expand(text) as { a: string; b: string };
    expect(result.a).toBe("1");
    expect(result.b).toBe("2");
  });
});
