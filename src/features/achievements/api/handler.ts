import type { Handler } from "@/app/routing";
import { di } from "@/shared/injection";
import { success } from "@/shared/net/response";
import type { CockAchievementsResponse } from "../types";

type GetAchievementsAction = (userId: number) => Promise<CockAchievementsResponse>;

export const createAchievementsHandler =
  (getAchievementsAction: GetAchievementsAction): Handler =>
  async () =>
    success(await getAchievementsAction(0)); // TODO: userId из контекста

createAchievementsHandler.inject = [di.getAchievementsAction] as const;
