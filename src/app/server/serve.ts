import type { BunRequest } from "bun";
import { generateRequestId } from "@/app/middlewares/request";
import { createPipeline } from "@/app/routing/pipeline";
import { createRoutes } from "@/app/routing/routes";
import { di } from "@/shared/injection";
import { logger } from "@/shared/lib/logger";
import { createTicker } from "@/shared/lib/profiling";
import { getCorsHeaders } from "@/shared/net/cors/cors";
import { failure } from "@/shared/net/response";
import type { Container } from "../container";
import { handleError } from "./errors";
import { registerShutdown } from "./shutdown";

export const startServer = async (container: Container): Promise<void> => {
  const cfg = container.resolve(di.config);

  const timeoutSec = 10;
  let srv: ReturnType<typeof Bun.serve> | null = null;

  const setTimeout = (req: BunRequest, sec: number): void => {
    srv?.timeout(req, sec);
  };

  const routeOf = createPipeline({ container, handleError, setTimeout, timeoutSec });
  const routes = createRoutes(container, routeOf);

  srv = Bun.serve({
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

    error: handleError,
  });

  logger.info(`Server started on port ${cfg.svc.port}`, {
    service: "server",
    operation: "start",
    port: cfg.svc.port,
  });

  registerShutdown(srv);
};
