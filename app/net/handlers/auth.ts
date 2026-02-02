import type { Handler } from "@/cmd/types";
import { TelegramAuthPayloadSchema } from "@/dto/auth";
import { failure } from "@/net/responses";
import { login } from "@/svc/auth/service";
import { signSessionToken } from "@/svc/auth/token";
import { setSessionCookie } from "./cookie";

type AuthLoginDeps = {
  botToken: string;
  sessionSecret: string;
  sessionTtlSec: number;
};

export const auth =
  (deps: AuthLoginDeps): Handler =>
  async (req): Promise<Response> => {
    try {
      const body = await req.json();
      const parsed = TelegramAuthPayloadSchema.parse(body);

      const authResponse = await login(parsed, deps.botToken);
      const sessionToken = signSessionToken(authResponse.user.id, deps.sessionSecret, deps.sessionTtlSec);
      authResponse.session_token = sessionToken;

      setSessionCookie(req.cookies, sessionToken, deps.sessionTtlSec);
      return Response.json({ data: authResponse }, { status: 200 });
    } catch (error) {
      return failure(error instanceof Error ? error.message : "Login failed", "AUTH_FAILED", 401);
    }
  };
