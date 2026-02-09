import type { LogFields } from "./fields";

type LogLevel = "debug" | "info" | "warn" | "error";

const levels: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };

const getEnvLevel = (): LogLevel => {
  const v = process.env.LOG_LEVEL;
  return v === "debug" || v === "info" || v === "warn" || v === "error" ? v : "info";
};

export const log = (level: LogLevel, message: string, fields: LogFields = {}): void => {
  const envLevel = getEnvLevel();
  if (levels[level] < levels[envLevel]) return;

  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...fields,
  };

  const line = `${JSON.stringify(entry)}\n`;
  if (level === "error" || level === "warn") {
    Bun.write(Bun.stderr, line);
  } else {
    Bun.write(Bun.stdout, line);
  }
};

export const logger = {
  debug: (message: string, fields?: LogFields) => log("debug", message, fields),
  info: (message: string, fields?: LogFields) => log("info", message, fields),
  warn: (message: string, fields?: LogFields) => log("warn", message, fields),
  error: (message: string, fields?: LogFields) => log("error", message, fields),
};
