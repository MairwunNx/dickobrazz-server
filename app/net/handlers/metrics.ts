import { registry } from "@/stt/prometheus";
import { exportMetrics } from "@/svc/metrics/service";

export const metricsHandler = async (): Promise<Response> => {
  const metrics = await exportMetrics();
  return new Response(metrics, {
    headers: { "Content-Type": registry.contentType },
  });
};
