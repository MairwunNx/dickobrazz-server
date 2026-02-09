import type { BunRequest } from "bun";
import type { AuthResult } from "@/features/auth";
import type { RequestContext } from "@/shared/context/context";
import { logger } from "@/shared/lib/logger";
import { createTicker } from "@/shared/lib/profiling";
import { AuthError } from "@/shared/net/response";

type ValidateRequestFn = (req: BunRequest) => Promise<AuthResult>;

export const authenticateRequest = async (req: BunRequest, validateRequest: ValidateRequestFn, context: RequestContext): Promise<void> => {
  const ticker = createTicker();

  const authResult = await validateRequest(req);

  context.is_authenticated = authResult.authenticated;
  context.auth_type = authResult.auth_type;
  context.user = authResult.user;

  logger.debug("Request authenticated", {
    request_id: context.request_id,
    authenticated: authResult.authenticated,
    auth_type: authResult.auth_type,
    user_id: authResult.user?.id,
    duration_ms: ticker(),
  });
};

export const requireAuth = (context: RequestContext): void => {
  if (!context.is_authenticated) {
    logger.warn("Unauthorized access attempt", {
      request_id: context.request_id,
    });
    throw new AuthError("Authentication required", "AUTH_REQUIRED");
  }
};
