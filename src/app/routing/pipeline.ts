import type { BunRequest } from "bun";
import type { Container } from "@/app/container";
import { authenticateRequest, requireAuth } from "@/app/middlewares/auth";
import { generateRequestId } from "@/app/middlewares/request";
import { type RequestContext, withContext } from "@/shared/context/context";
import { di } from "@/shared/injection";
import { logger } from "@/shared/lib/logger";
import { createTicker } from "@/shared/lib/profiling";
import { getCorsHeaders } from "@/shared/net/cors/cors";
import type { Handler } from "@/shared/net/types";
import type { RouteOptions } from "./types";

type PipelineDeps = {
  container: Container;
  handleError: (err: Error) => Response;
  setTimeout: (req: BunRequest, timeoutSec: number) => void;
  timeoutSec: number;
};

const applyCors = (response: Response, origin: string | null, requestId: string): Response => {
  const corsHeaders = getCorsHeaders(origin);
  response.headers.set("X-Request-Id", requestId);
  for (const [key, value] of Object.entries(corsHeaders)) {
    response.headers.set(key, String(value));
  }
  return response;
};

export const createPipeline =
  (deps: PipelineDeps) =>
  (handler: Handler, options: RouteOptions = {}): Handler =>
  async (req): Promise<Response> => {
    const ticker = createTicker();
    const requestId = generateRequestId(req.headers);
    const origin = req.headers.get("origin");
    const context: RequestContext = { request_id: requestId, is_authenticated: false };

    const validateAction = deps.container.resolve(di.validateAction);
    const userDal = deps.container.resolve(di.userDal);

    return withContext(context, async () => {
      try {
        deps.setTimeout(req, deps.timeoutSec);

        if (!options.skipAuth) {
          await authenticateRequest(req, validateAction, context);
          if (context.user) {
            await userDal.sync(context.user.id, context.user.username);
            logger.debug("User synced", {
              request_id: context.request_id,
              user_id: context.user.id,
            });
          }
          if (options.protected) {
            requireAuth(context);
          }
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

        return applyCors(response, origin, requestId);
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

        const errorResponse = deps.handleError(error instanceof Error ? error : new Error(String(error)));
        return applyCors(errorResponse, origin, requestId);
      }
    });
  };

export type Pipeline = ReturnType<typeof createPipeline>;
