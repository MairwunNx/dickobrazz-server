import { di } from "@/shared/injection";
import { success } from "@/shared/net/response";
import type { Handler } from "@/shared/net/types";
import type { CockSizeResponse } from "../types";

type GenerateSizeAction = () => Promise<CockSizeResponse>;

export const createSizeHandler =
  (generateSizeAction: GenerateSizeAction): Handler =>
  async () =>
    success(await generateSizeAction());

createSizeHandler.inject = [di.generateSizeAction] as const;
