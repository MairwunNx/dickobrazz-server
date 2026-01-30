import { logger } from "@/log";
import { registry } from "@/stt/prometheus";

export const exportMetrics = async (): Promise<string> => {
  logger.debug("Exporting Prometheus metrics", {
    service: "metrics",
    operation: "export",
  });

  return await registry.metrics();
};
