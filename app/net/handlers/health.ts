import type { Handler } from "@/cmd/types";
import { success } from "@/net/responses";
import { check } from "@/svc/health/service";

export const health: Handler = async () => {
  const health = await check();
  return success(health, health.status === "ok" ? 200 : 503);
};
