import type { Handler } from "@/app/types";
import { di } from "@/shared/injection";
import { registry } from "@/shared/lib/metrics";

type ExportMetricsAction = () => Promise<string>;

export const createMetricsHandler =
  (exportMetricsAction: ExportMetricsAction): Handler =>
  async () => {
    const metrics = await exportMetricsAction();
    return new Response(metrics, {
      headers: { "Content-Type": registry.contentType },
    });
  };

createMetricsHandler.inject = [di.exportMetricsAction] as const;
