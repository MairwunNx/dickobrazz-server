import { di } from "@/shared/injection";
import { success } from "@/shared/net/response";
import type { Handler } from "@/shared/net/types";
import type { CockAchievementsResponse } from "../types";

type GetAchievementsAction = () => Promise<CockAchievementsResponse>;

export const createAchievementsHandler =
  (getAchievementsAction: GetAchievementsAction): Handler =>
  async () =>
    success(await getAchievementsAction());

createAchievementsHandler.inject = [di.getAchievementsAction] as const;
