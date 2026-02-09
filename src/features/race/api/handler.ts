import type { Handler } from "@/app/routing";
import { di } from "@/shared/injection";
import { paginationFrom } from "@/shared/net/pagination";
import { success } from "@/shared/net/response";
import type { CockRaceResponse } from "../types";

type GetRaceAction = (params: { limit?: number; page?: number }) => Promise<CockRaceResponse>;

export const createRaceHandler =
  (getRaceAction: GetRaceAction): Handler =>
  async (req) =>
    success(await getRaceAction(paginationFrom(new URL(req.url))));

createRaceHandler.inject = [di.getRaceAction] as const;
