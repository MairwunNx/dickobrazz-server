import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import type { TelegramAuthPayload } from "@/dto/auth";
import type { UserProfile } from "@/dto/user";
import { createTicker, logger } from "@/log";
import { AuthError } from "@/sys/errors";

const MAX_AUTH_AGE_SECONDS = 3600;

export const validateTelegramAuthPayload = (payload: TelegramAuthPayload, botToken: string): UserProfile => {
  const ticker = createTicker();

  try {
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (payload.auth_date + MAX_AUTH_AGE_SECONDS < nowSeconds) {
      throw new AuthError("Telegram auth payload expired", "AUTH_EXPIRED");
    }

    const dataCheckParts: string[] = [
      `auth_date=${payload.auth_date}`,
      `first_name=${payload.first_name}`,
      `id=${payload.id}`,
    ];

    if (payload.last_name) dataCheckParts.push(`last_name=${payload.last_name}`);
    if (payload.username) dataCheckParts.push(`username=${payload.username}`);
    if (payload.photo_url) dataCheckParts.push(`photo_url=${payload.photo_url}`);

    dataCheckParts.sort();

    const secretKey = createHash("sha256").update(botToken).digest();
    const computedHash = createHmac("sha256", secretKey).update(dataCheckParts.join("\n")).digest("hex");

    if (payload.hash.length !== computedHash.length) {
      throw new AuthError("Telegram auth payload hash mismatch", "AUTH_INVALID");
    }
    const hashMatches = timingSafeEqual(Buffer.from(computedHash), Buffer.from(payload.hash));
    if (!hashMatches) {
      throw new AuthError("Telegram auth payload hash mismatch", "AUTH_INVALID");
    }

    const user: UserProfile = {
      id: payload.id,
      username: payload.username,
      first_name: payload.first_name,
      last_name: payload.last_name,
      photo_url: payload.photo_url,
      is_hidden: false,
    };

    logger.info("Telegram auth payload validated", {
      service: "auth.telegram",
      operation: "validate_payload",
      user_id: user.id,
      duration_ms: ticker(),
    });

    return user;
  } catch (error) {
    logger.warn("Telegram auth payload validation failed", {
      service: "auth.telegram",
      operation: "validate_payload",
      duration_ms: ticker(),
      error: { message: error instanceof Error ? error.message : String(error) },
    });

    if (error instanceof AuthError) throw error;
    throw new AuthError("Invalid Telegram auth payload", "AUTH_INVALID");
  }
};
