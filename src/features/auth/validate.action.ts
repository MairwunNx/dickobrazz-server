import type { BunRequest } from "bun";
import type { UserProfile } from "@/entities/user";
import type { AppConfig } from "@/shared/config/schema";
import { di } from "@/shared/injection";
import { logger } from "@/shared/lib/logger";
import { createTicker } from "@/shared/lib/profiling";
import { AuthError } from "@/shared/net/response";
import { extractBearerToken } from "./lib/bearer";
import { extractCookieToken } from "./lib/cookie";
import { verifySessionToken } from "./lib/token";
import type { AuthResult } from "./types";

export const createValidateAction = (config: AppConfig) => {
  const csotToken = config.svc.csot.token;
  const sessionSecret = config.svc.auth.session_secret;

  return async (req: BunRequest): Promise<AuthResult> => {
    const ticker = createTicker();

    const internalToken = req.headers.get("x-internal-token");
    if (internalToken) {
      const isValid = internalToken === csotToken;

      logger.info("Internal token validation", {
        service: "auth",
        operation: "validateInternalToken",
        valid: isValid,
        duration_ms: ticker(),
      });

      if (!isValid) {
        throw new AuthError("Invalid internal token", "AUTH_INVALID");
      }

      const internalUserId = req.headers.get("x-internal-user-id");
      const internalUserName = req.headers.get("x-internal-user-name");
      let user: UserProfile | undefined;

      if (internalUserId) {
        const parsed = Number.parseInt(internalUserId, 10);
        if (!Number.isFinite(parsed) || parsed <= 0) {
          throw new AuthError("Invalid internal user id", "AUTH_INVALID");
        }
        user = {
          id: parsed,
          username: internalUserName?.trim() || undefined,
          first_name: undefined,
          last_name: undefined,
          photo_url: undefined,
          is_hidden: false,
        };
      }

      return { authenticated: true, auth_type: "internal", user };
    }

    const sessionToken = extractBearerToken(req.headers) || extractCookieToken(req);
    if (sessionToken) {
      const payload = verifySessionToken(sessionToken, sessionSecret);
      if (payload) {
        return {
          authenticated: true,
          auth_type: "telegram",
          user: {
            id: payload.sub,
            username: undefined,
            first_name: undefined,
            last_name: undefined,
            photo_url: undefined,
            is_hidden: false,
          },
        };
      }
    }

    return { authenticated: false };
  };
};

createValidateAction.inject = [di.config] as const;
