import { logger } from "@/log";
import { getActiveUsersCount, getSizeDistribution, getTotalUsersCount } from "@/rep/mongo";
import { activeUsersGauge, registry, sizeDistributionGauge, totalUsersGauge } from "@/stt/prometheus";
import { getMoscowDate } from "@/sys/datetime";

export const exportMetrics = async (): Promise<string> => {
  logger.debug("Exporting Prometheus metrics", {
    service: "metrics",
    operation: "export",
  });

  const now = getMoscowDate();
  const [totalUsers, dau, mau, distribution] = await Promise.all([
    getTotalUsersCount(),
    getActiveUsersCount(new Date(now.getTime() - 24 * 60 * 60 * 1000)),
    getActiveUsersCount(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)),
    getSizeDistribution(),
  ]);

  totalUsersGauge.set(totalUsers);
  activeUsersGauge.set({ window: "dau" }, dau);
  activeUsersGauge.set({ window: "mau" }, mau);
  for (const bucket of distribution) {
    sizeDistributionGauge.set({ bucket: bucket.label }, bucket.count);
  }

  return await registry.metrics();
};
