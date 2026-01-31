import type { Handler } from "@/cmd/types";
import { successResponse } from "@/net/responses";
import { check } from "@/svc/health/service";

export const healthHandler: Handler = async () => {
  const health = await check();
  return successResponse(health, health.status === "ok" ? 200 : 503);
};
