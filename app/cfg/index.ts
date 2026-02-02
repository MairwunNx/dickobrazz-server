import { logger } from "@/log";
import { loadEnv } from "./env";
import { type AppConfig, ConfigSchema } from "./schm";
import { parseYamlWithEnv } from "./yaml";

let runtimeConfig: AppConfig | null = null;

export const loadConfig = async (path = "config.yaml"): Promise<AppConfig> => {
  loadEnv();

  const file = Bun.file(path);
  const text = await file.text();

  const parsed = parseYamlWithEnv(text);
  const config = ConfigSchema.parse(parsed);

  runtimeConfig = config;

  logger.info("Configuration loaded", {
    service: "config",
    operation: "load",
    port: config.svc.port,
  });

  return config;
};

export const getConfig = (): AppConfig => {
  if (!runtimeConfig) {
    throw new Error("Runtime config not loaded");
  }
  return runtimeConfig;
};

export type { AppConfig };
