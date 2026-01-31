import { TelegramAuthPayloadSchema } from "@/dto/auth";
import { errorResponse } from "@/net/responses";
import { login } from "@/svc/auth/service";
import { signSessionToken } from "@/svc/auth/token";
import { buildSessionCookie } from "./cookie";

export const authLoginHandler = async (
  req: Request,
  botToken: string,
  sessionSecret: string,
  sessionTtlSec: number
): Promise<Response> => {
  try {
    const body = await req.json();
    const parsed = TelegramAuthPayloadSchema.parse(body);

    const authResponse = await login(parsed, botToken);
    const sessionToken = signSessionToken(authResponse.user.id, sessionSecret, sessionTtlSec);
    authResponse.session_token = sessionToken;

    const responseBody = { data: authResponse };
    const headers = new Headers({ "Content-Type": "application/json" });
    headers.set("Set-Cookie", buildSessionCookie(sessionToken, sessionTtlSec));

    return new Response(JSON.stringify(responseBody), { status: 200, headers });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Login failed", "AUTH_FAILED", 401);
  }
};
