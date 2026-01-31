import type { RequestContext } from "@/cmd/context";
import { createTicker, logger } from "@/log";
import { validateRequest } from "@/svc/auth/service";
import { AuthError } from "@/sys/errors";

export const authenticateRequest = async (
  headers: Headers,
  botToken: string,
  csotToken: string,
  sessionSecret: string,
  context: RequestContext
): Promise<void> => {
  const ticker = createTicker();

  const authResult = await validateRequest(headers, botToken, csotToken, sessionSecret);

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
