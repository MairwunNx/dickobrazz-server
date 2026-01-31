import { ZodError } from "zod";
import { loadConfig } from "@/cfg";
import { closeMongo, connectMongo } from "@/db/mongo";
import { closeRedis, connectRedis } from "@/db/redis";
import { createTicker, logger } from "@/log";
import { authenticateRequest, requireAuth } from "@/net/middlewares/auth";
import { generateRequestId } from "@/net/middlewares/request";
import { errorResponse } from "@/net/responses";
import { createIndexes } from "@/rep/mongo";
import { AppError } from "@/sys/errors";
import { clearContext, type RequestContext, setContext } from "./context";
import { getCorsHeaders, matchRoute } from "./router";

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

  serverInstance = Bun.serve({
    port: config.svc.port,

    async fetch(req) {
      const url = new URL(req.url);

      if (req.method === "OPTIONS") {
        return new Response(null, {
          status: 204,
          headers: getCorsHeaders(req.headers.get("origin")),
        });
      }

      const requestId = generateRequestId(req.headers);
      const context: RequestContext = {
        request_id: requestId,
        is_authenticated: false,
      };

      setContext(context);

      const ticker = createTicker();

      try {
        await authenticateRequest(req.headers, botToken, config.svc.csot.token, context);

        const route = matchRoute(req.method, url.pathname);

        if (!route) {
          logger.warn("Route not found", {
            request_id: requestId,
            service: "server",
            operation: "route_not_found",
            method: req.method,
            path: url.pathname,
            duration_ms: ticker(),
          });
          return errorResponse("Not found", "NOT_FOUND", 404);
        }

        if (route.protected) {
          requireAuth(context);
        }

        const response = await route.handler(req, context, { botToken });

        logger.info("Request completed", {
          request_id: requestId,
          service: "server",
          operation: "request",
          method: req.method,
          path: url.pathname,
          status: response.status,
          user_id: context.user?.id,
          duration_ms: ticker(),
        });

        const headers = new Headers(response.headers);
        const corsHeaders = getCorsHeaders(req.headers.get("origin"));
        for (const [key, value] of Object.entries(corsHeaders)) {
          headers.set(key, String(value));
        }
        headers.set("X-Request-Id", requestId);

        return new Response(response.body, {
          status: response.status,
          headers,
        });
      } catch (error) {
        logger.error("Request failed", {
          request_id: requestId,
          service: "server",
          operation: "request",
          method: req.method,
          path: url.pathname,
          duration_ms: ticker(),
          error: {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          },
        });
        throw error;
      } finally {
        clearContext();
      }
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
