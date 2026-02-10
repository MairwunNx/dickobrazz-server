import { getContext } from "@/shared/context";
import { di } from "@/shared/injection";
import { success } from "@/shared/net/response";
import { AppError } from "@/shared/net/response/errors";
import type { Handler } from "@/shared/net/types";
import type { CockSizeResponse, GetSizeParams } from "../types";

type GenerateSizeAction = (params: GetSizeParams) => Promise<CockSizeResponse>;

export const createSizeHandler =
  (generateSizeAction: GenerateSizeAction): Handler =>
  async () => {
    const ctx = getContext();
    if (!ctx?.user) {
      throw new AppError("AUTH_REQUIRED", "Authentication required", 401);
    }
    return success(await generateSizeAction({ user_id: ctx.user.id }));
  };

createSizeHandler.inject = [di.generateSizeAction] as const;
