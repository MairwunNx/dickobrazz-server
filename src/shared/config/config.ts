import { logger } from "@/shared/lib/logger";
import { createTicker } from "@/shared/lib/profiling";
import { loadEnv } from "./env";
import { ConfigSchema } from "./schema";
import { expand } from "./yaml";

export const config = async () => {
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
};
