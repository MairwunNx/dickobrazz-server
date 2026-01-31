import type { Handler } from "@/cmd/types";
import { registry } from "@/stt/prometheus";
import { exportMetrics } from "@/svc/metrics/service";

export const metricsHandler: Handler = async () => {
  const metrics = await exportMetrics();
  return new Response(metrics, {
    headers: { "Content-Type": registry.contentType },
  });
};
