import { loadConfig } from "@/cfg";
import { closeMongo, connectMongo } from "@/db/mongo";
import { closeRedis, connectRedis } from "@/db/redis";
import { createTicker, logger } from "@/log";
import { generateRequestId } from "@/net/middlewares/request";
import { errorResponse } from "@/net/responses";
import { createIndexes } from "@/rep/mongo";
import { AppError } from "@/sys/errors";
import type { BunRequest } from "bun";
import { ZodError } from "zod";
import { getCorsHeaders } from "./cors";
import { routers } from "./router";

let serverInstance: ReturnType<typeof Bun.serve> | null = null;

export const startServer = async (): Promise<void> => {
  const config = await loadConfig();

  await connectMongo(config.svc.db.mongo.url);
  await connectRedis(config.svc.db.redis.url);
  await createIndexes();

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    throw new Error("TELEGRAM_BOT_TOKEN is required");
  }

  const requestTimeoutSec = 10;
  const setTimeout = (req: BunRequest, timeoutSec: number): void => {
    serverInstance?.timeout(req, timeoutSec);
  };

  serverInstance = Bun.serve({
    port: config.svc.port,
    routes: routers({
      botToken,
      csotToken: config.svc.csot.token,
      sessionSecret: config.svc.auth.session_secret,
      sessionTtlSec: config.svc.auth.session_ttl_sec,
      timeoutSec: requestTimeoutSec,
      setTimeout,
    }),

    async fetch(req) {
      if (req.method === "OPTIONS") {
        return new Response(null, {
          status: 204,
          headers: getCorsHeaders(req.headers.get("origin")),
        });
      }

      const requestId = generateRequestId(req.headers);
      const ticker = createTicker();
      const url = new URL(req.url);

      logger.warn("Route not found", {
        request_id: requestId,
        service: "server",
        operation: "route_not_found",
        method: req.method,
        path: url.pathname,
        duration_ms: ticker(),
      });

      const response = errorResponse("Not found", "NOT_FOUND", 404);
      const corsHeaders = getCorsHeaders(req.headers.get("origin"));
      response.headers.set("X-Request-Id", requestId);
      for (const [key, value] of Object.entries(corsHeaders)) {
        response.headers.set(key, String(value));
      }

      return response;
    },

    error(err: Error) {
      if (err instanceof ZodError) {
        logger.warn("Validation error", {
          errors: err.issues,
        });
        return errorResponse(err.issues[0]?.message || "Validation error", "VALIDATION_ERROR", 400);
      }

      if (err instanceof AppError) {
        logger.error("Application error", {
          code: err.code,
          message: err.message,
        });
        return errorResponse(err.message, err.code, err.statusCode);
      }

      logger.error("Unhandled error", {
        error: {
          message: err.message,
          stack: err.stack,
        },
      });

      return errorResponse("Internal server error", "INTERNAL_ERROR", 500);
    },
  });

  logger.info(`Server started on port ${config.svc.port}`, {
    service: "server",
    operation: "start",
    port: config.svc.port,
  });
};

const shutdown = async (signal: string): Promise<void> => {
  logger.info(`Received ${signal}, starting graceful shutdown`, {
    service: "server",
    operation: "shutdown",
    signal,
  });

  if (serverInstance) {
    serverInstance.stop();
  }

  await Promise.race([new Promise((resolve) => setTimeout(resolve, 30000)), Promise.resolve()]);

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
