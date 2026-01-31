import { TelegramAuthPayloadSchema } from "@/dto/auth";
import { errorResponse, successResponse } from "@/net/responses";
import { login } from "@/svc/auth/service";

export const authLoginHandler = async (req: Request, botToken: string): Promise<Response> => {
  try {
    const body = await req.json();
    const parsed = TelegramAuthPayloadSchema.parse(body);

    const authResponse = await login(parsed, botToken);

    return successResponse(authResponse);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Login failed", "AUTH_FAILED", 401);
  }
};
