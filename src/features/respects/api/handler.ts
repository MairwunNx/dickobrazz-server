import { di } from "@/shared/injection";
import { success } from "@/shared/net/response";
import type { Handler } from "@/shared/net/types";
import type { RespectResponse } from "../types";

type GetRespectAction = () => Promise<RespectResponse>;

export const createRespectsHandler =
  (getRespectAction: GetRespectAction): Handler =>
  async () =>
    success(await getRespectAction());

createRespectsHandler.inject = [di.getRespectAction] as const;
