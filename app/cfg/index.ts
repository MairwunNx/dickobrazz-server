import { createTicker, logger } from "@/log";
import { once } from "@/snc/once";
import { loadEnv } from "./env";
import { type AppConfig, ConfigSchema } from "./schm";
import { expand } from "./yaml";

export const config = once(
  async (): Promise<AppConfig> => {
    const ticker = createTicker();
    loadEnv();

    const cfg = ConfigSchema.parse(expand(await Bun.file("config.yaml").text()));

    logger.info("Configuration loaded", {
      service: "config",
      operation: "load",
      port: cfg.svc.port,
      duration_ms: ticker(),
    });

    return cfg;
  },
  { cachePromise: true }
);

export type { AppConfig };
