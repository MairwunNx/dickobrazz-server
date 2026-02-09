import type { BunRequest } from "bun";
import { ZodError } from "zod";
import { closeMongo } from "@/shared/infra/mongo";
import { closeRedis } from "@/shared/infra/redis";
import { di } from "@/shared/injection";
import { logger } from "@/shared/lib/logger";
import { createTicker } from "@/shared/lib/profiling";
import { getCorsHeaders } from "@/shared/net/cors/cors";
import { generateRequestId } from "@/shared/net/middlewares/request";
import { AppError, failure } from "@/shared/net/response";
import type { Container } from "./container";
import { createRouteFactory } from "./factory";
import { createRoutes } from "./router";

let _server: ReturnType<typeof Bun.serve> | null = null;

export const server = async (container: Container): Promise<void> => {
  const cfg = container.resolve(di.config);
  const validateAction = container.resolve(di.validateAction);

  const timeoutSec = 10;
  const setTimeout = (req: BunRequest, sec: number): void => {
    _server?.timeout(req, sec);
  };

  const routeOf = createRouteFactory({ validateRequest: validateAction, setTimeout, timeoutSec });
  const routes = createRoutes(container, routeOf);

  _server = Bun.serve({
    port: cfg.svc.port,
    routes,

    async fetch(req) {
      if (req.method === "OPTIONS") {
        return new Response(null, {
          status: 204,
          headers: getCorsHeaders(req.headers.get("origin")),
        });
      }

      const requestId = generateRequestId(req.headers);
      const ticker = createTicker();

      logger.warn("Route not found", {
        request_id: requestId,
        service: "server",
        operation: "route_not_found",
        method: req.method,
        path: new URL(req.url).pathname,
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
        logger.warn("Validation error", { errors: err.issues });
        return failure(err.issues[0]?.message || "Validation error", "VALIDATION_ERROR", 400);
      }

      if (err instanceof AppError) {
        logger.error("Application error", { code: err.code, message: err.message });
        return failure(err.message, err.code, err.statusCode);
      }

      logger.error("Unhandled error", {
        error: { message: err.message, stack: err.stack },
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

  if (_server) {
    _server.stop();
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
