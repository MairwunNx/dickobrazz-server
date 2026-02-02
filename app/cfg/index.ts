import { logger } from "@/log";
import { once } from "@/snc/once";
import { loadEnv } from "./env";
import { type AppConfig, ConfigSchema } from "./schm";
import { parseYamlWithEnv } from "./yaml";

export const config = once(
  async (): Promise<AppConfig> => {
    loadEnv();

    const file = Bun.file("config.yaml");
    const text = await file.text();

    const parsed = parseYamlWithEnv(text);
    const cfg = ConfigSchema.parse(parsed);

    logger.info("Configuration loaded", {
      service: "config",
      operation: "load",
      port: cfg.svc.port,
    });

    return cfg;
  },
  { cachePromise: true }
);

export type { AppConfig };
