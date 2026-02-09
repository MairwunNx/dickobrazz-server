import type { Handler } from "@/app/types";
import { di } from "@/shared/injection";
import { success } from "@/shared/net/response";
import type { HealthResponse } from "../types";

type CheckAction = () => Promise<HealthResponse>;

export const createHealthHandler =
  (checkAction: CheckAction): Handler =>
  async () => {
    const health = await checkAction();
    return success(health, health.status === "ok" ? 200 : 503);
  };

createHealthHandler.inject = [di.checkAction] as const;
