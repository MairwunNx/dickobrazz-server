import type { Handler } from "@/app/routing";
import { di } from "@/shared/injection";
import { paginationFrom } from "@/shared/net/pagination";
import { success } from "@/shared/net/response";
import type { CockRulerResponse } from "../types";

type GetRulerAction = (params: { limit?: number; page?: number }) => Promise<CockRulerResponse>;

export const createRulerHandler =
  (getRulerAction: GetRulerAction): Handler =>
  async (req) =>
    success(await getRulerAction(paginationFrom(new URL(req.url))));

createRulerHandler.inject = [di.getRulerAction] as const;
