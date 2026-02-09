import type { Handler } from "@/app/types";
import { di } from "@/shared/injection";
import { paginationFrom } from "@/shared/net/pagination";
import { success } from "@/shared/net/response";
import type { CockSeasonsResponse } from "../types";

type GetSeasonsAction = (params: { limit?: number; page?: number }) => Promise<CockSeasonsResponse>;

export const createSeasonsHandler =
  (getSeasonsAction: GetSeasonsAction): Handler =>
  async (req) =>
    success(await getSeasonsAction(paginationFrom(new URL(req.url))));

createSeasonsHandler.inject = [di.getSeasonsAction] as const;
