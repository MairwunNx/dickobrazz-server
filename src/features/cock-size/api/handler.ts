import type { Handler } from "@/app/types";
import { di } from "@/shared/injection";
import { success } from "@/shared/net/response";
import type { CockSizeResponse, GetSizeParams } from "../types";

type GenerateSizeAction = (params: GetSizeParams) => Promise<CockSizeResponse>;

export const createSizeHandler =
  (generateSizeAction: GenerateSizeAction): Handler =>
  async () =>
    success(await generateSizeAction({ user_id: 0 })); // TODO: userId из контекста

createSizeHandler.inject = [di.generateSizeAction] as const;
