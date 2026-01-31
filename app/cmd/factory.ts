import { createTicker, logger } from "@/log";
import { authenticateRequest, requireAuth } from "@/net/middlewares/auth";
import { generateRequestId } from "@/net/middlewares/request";
import { clearContext, type RequestContext, setContext } from "./context";
import { getCorsHeaders } from "./router";
import type { RouteDeps, RouteHandler, RouteOptions } from "./types";

export const route =
  (handler: RouteHandler, deps: RouteDeps, options: RouteOptions = {}): RouteHandler =>
  async (req): Promise<Response> => {
    const ticker = createTicker();
    const requestId = generateRequestId(req.headers);
    const context: RequestContext = { request_id: requestId, is_authenticated: false };

    setContext(context);

    try {
      deps.setTimeout(req, deps.timeoutSec);
      await authenticateRequest(req, deps.botToken, deps.csotToken, deps.sessionSecret, context);
      if (options.protected) {
        requireAuth(context);
      }

      const response = await handler(req);

      logger.info("Request completed", {
        request_id: requestId,
        service: "server",
        operation: "request",
        method: req.method,
        path: new URL(req.url).pathname,
        status: response.status,
        user_id: context.user?.id,
        duration_ms: ticker(),
      });

      const corsHeaders = getCorsHeaders(req.headers.get("origin"));
      response.headers.set("X-Request-Id", requestId);
      for (const [key, value] of Object.entries(corsHeaders)) {
        response.headers.set(key, String(value));
      }

      return response;
    } catch (error) {
      logger.error("Request failed", {
        request_id: requestId,
        service: "server",
        operation: "request",
        method: req.method,
        path: new URL(req.url).pathname,
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
  };
