import { closeMongo } from "@/shared/infra/mongo";
import { closeRedis } from "@/shared/infra/redis";
import { logger } from "@/shared/lib/logger";

export const registerShutdown = (server: { stop: () => void }): void => {
  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`Received ${signal}, starting graceful shutdown`, {
      service: "server",
      operation: "shutdown",
      signal,
    });

    server.stop();

    await closeMongo();
    await closeRedis();

    logger.info("Server stopped gracefully", {
      service: "server",
      operation: "shutdown",
    });

    process.exit(0);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
};
