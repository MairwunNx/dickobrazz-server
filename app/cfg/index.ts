import { logger } from "@/log";
import { loadEnv } from "./env";
import { type AppConfig, ConfigSchema } from "./schm";
import { parseYamlWithEnv } from "./yaml";

export const loadConfig = async (path = "config.yaml"): Promise<AppConfig> => {
  loadEnv();

  const file = Bun.file(path);
  const text = await file.text();

  const parsed = parseYamlWithEnv(text);
  const config = ConfigSchema.parse(parsed);

  logger.info("Configuration loaded", {
    service: "config",
    operation: "load",
    port: config.svc.port,
  });

  return config;
};

export type { AppConfig };
