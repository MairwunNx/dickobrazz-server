import { logger } from "@/log";

export const loadEnv = (): void => {
  if (process.env.NODE_ENV === "production") {
    logger.info("Running in production mode");
  } else {
    logger.info("Running in development mode");
  }
};
