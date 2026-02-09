import type { AppConfig } from "@/shared/config/schema";
import { di } from "@/shared/injection";
import { setSessionCookie } from "@/shared/net/cookie";
import { failure } from "@/shared/net/response";
import type { Handler } from "@/shared/net/types";
import { signSessionToken } from "../lib/token";
import type { AuthResponse, TelegramAuthPayload } from "../types";
import { TelegramAuthPayloadSchema } from "../types";

type LoginAction = (payload: TelegramAuthPayload) => Promise<AuthResponse>;

export const createAuthHandler = (loginAction: LoginAction, config: AppConfig): Handler => {
  const { session_secret, session_ttl_sec } = config.svc.auth;

  return async (req): Promise<Response> => {
    try {
      const body = await req.json();
      const parsed = TelegramAuthPayloadSchema.parse(body);

      const authResponse = await loginAction(parsed);
      const sessionToken = signSessionToken(authResponse.user.id, session_secret, session_ttl_sec);
      authResponse.session_token = sessionToken;

      setSessionCookie(req.cookies, sessionToken, session_ttl_sec);
      return Response.json({ data: authResponse }, { status: 200 });
    } catch (error) {
      return failure(error instanceof Error ? error.message : "Login failed", "AUTH_FAILED", 401);
    }
  };
};

createAuthHandler.inject = [di.loginAction, di.config] as const;
