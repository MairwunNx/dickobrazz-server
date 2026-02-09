import type { UserDal } from "@/entities/user";
import { di } from "@/shared/injection";
import { logger } from "@/shared/lib/logger";
import { createTicker } from "@/shared/lib/profiling";
import { validateTelegramAuthPayload } from "./lib/telegram";
import type { AuthResponse, TelegramAuthPayload } from "./types";

export const createLoginAction =
  (userDal: UserDal, botToken: string) =>
  async (payload: TelegramAuthPayload): Promise<AuthResponse> => {
    const ticker = createTicker();

    const user = validateTelegramAuthPayload(payload, botToken);
    await userDal.getOrCreate(user);

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

createLoginAction.inject = [di.userDal, di.botToken] as const;
