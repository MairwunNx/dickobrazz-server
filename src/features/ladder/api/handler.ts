import type { Handler } from "@/app/routing";
import { di } from "@/shared/injection";
import { paginationFrom } from "@/shared/net/pagination";
import { success } from "@/shared/net/response";
import type { CockLadderResponse } from "../types";

type GetLadderAction = (params: { limit?: number; page?: number }) => Promise<CockLadderResponse>;

export const createLadderHandler =
  (getLadderAction: GetLadderAction): Handler =>
  async (req) =>
    success(await getLadderAction(paginationFrom(new URL(req.url))));

createLadderHandler.inject = [di.getLadderAction] as const;
