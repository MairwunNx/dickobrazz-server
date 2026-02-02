import { config } from "@/cfg";
import { closeMongo, mongo } from "@/db/mongo";
import { closeRedis, redis } from "@/db/redis";
import { createTicker, logger } from "@/log";
import { generateRequestId } from "@/net/middlewares/request";
import { failure } from "@/net/responses";
import { index } from "@/rep/mongo";
import { AppError } from "@/sys/errors";
import type { BunRequest } from "bun";
import { ZodError } from "zod";
import { getCorsHeaders } from "./cors";
import { routers } from "./router";

let server: ReturnType<typeof Bun.serve> | null = null;

export const startServer = async (): Promise<void> => {
  const cfg = await config();

  await mongo(cfg.svc.db.mongo.url);
  await redis(cfg.svc.db.redis.url);
  await index();

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    throw new Error("TELEGRAM_BOT_TOKEN is required");
  }

  const timeout = 10;
  const setTimeout = (req: BunRequest, timeoutSec: number): void => {
    server?.timeout(req, timeoutSec);
  };

  server = Bun.serve({
    port: cfg.svc.port,
    routes: routers({
      botToken,
      csotToken: cfg.svc.csot.token,
      sessionSecret: cfg.svc.auth.session_secret,
      sessionTtlSec: cfg.svc.auth.session_ttl_sec,
      timeoutSec: timeout,
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

      const response = failure("Not found", "NOT_FOUND", 404);
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
        return failure(err.issues[0]?.message || "Validation error", "VALIDATION_ERROR", 400);
      }

      if (err instanceof AppError) {
        logger.error("Application error", {
          code: err.code,
          message: err.message,
        });
        return failure(err.message, err.code, err.statusCode);
      }

      logger.error("Unhandled error", {
        error: {
          message: err.message,
          stack: err.stack,
        },
      });

      return failure("Internal server error", "INTERNAL_ERROR", 500);
    },
  });

  logger.info(`Server started on port ${cfg.svc.port}`, {
    service: "server",
    operation: "start",
    port: cfg.svc.port,
  });
};

const shutdown = async (signal: string): Promise<void> => {
  logger.info(`Received ${signal}, starting graceful shutdown`, {
    service: "server",
    operation: "shutdown",
    signal,
  });

  if (server) {
    server.stop();
  }

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
