import { successResponse } from "@/net/responses";
import { check } from "@/svc/health/service";

export const healthHandler = async (): Promise<Response> => {
  const health = await check();
  return successResponse(health, health.status === "ok" ? 200 : 503);
};
