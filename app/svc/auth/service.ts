import type { BunRequest } from "bun";
import type { AuthResponse, TelegramAuthPayload } from "@/dto/auth";
import type { UserProfile } from "@/dto/user";
import { createTicker, logger } from "@/log";
import { getOrCreateUser } from "@/rep/mongo";
import { AuthError } from "@/sys/errors";
import { extractBearerToken } from "./bearer";
import { extractCookieToken } from "./cookie";
import { validateTelegramAuthPayload } from "./telegram";
import { verifySessionToken } from "./token";
import type { AuthResult } from "./types";

export const login = async (payload: TelegramAuthPayload, botToken: string): Promise<AuthResponse> => {
  const ticker = createTicker();

  const user = validateTelegramAuthPayload(payload, botToken);
  await getOrCreateUser(user);

  const result: AuthResponse = { user };

  logger.info("User logged in", {
    service: "auth",
    operation: "login",
    auth_type: "telegram",
    user_id: result.user.id,
    duration_ms: ticker(),
  });

  return result;
};

export const validateInternalToken = (token: string, expectedToken: string): boolean => {
  const isValid = token === expectedToken;

  logger.info("Internal token validation", {
    service: "auth",
    operation: "validateInternalToken",
    valid: isValid,
  });

  return isValid;
};

export const validateRequest = async (req: BunRequest, _botToken: string, csotToken: string, sessionSecret: string): Promise<AuthResult> => {
  const internalToken = req.headers.get("x-internal-token");
  if (internalToken) {
    const isValid = validateInternalToken(internalToken, csotToken);
    if (isValid) {
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

      return {
        authenticated: true,
        auth_type: "internal",
        user,
      };
    }

    throw new AuthError("Invalid internal token", "AUTH_INVALID");
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
