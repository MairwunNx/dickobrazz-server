import { getContext } from "@/shared/context";
import { di } from "@/shared/injection";
import { success } from "@/shared/net/response";
import type { Handler } from "@/shared/net/types";
import type { CockSizeResponse, GetSizeParams } from "../types";

type GenerateSizeAction = (params: GetSizeParams) => Promise<CockSizeResponse>;

export const createSizeHandler =
  (generateSizeAction: GenerateSizeAction): Handler =>
  async () =>
    success(await generateSizeAction({ user_id: getContext()?.user?.id as number }));

createSizeHandler.inject = [di.generateSizeAction] as const;
