import type { CockDal } from "@/entities/cock";
import type { UserDal } from "@/entities/user";
import { di } from "@/shared/injection";
import { getMoscowDate } from "@/shared/lib/datetime";
import { logger } from "@/shared/lib/logger";
import { activeUsersGauge, registry, sizeDistributionGauge, totalUsersGauge } from "@/shared/lib/metrics";
import { pActiveUsersSince, pSizeDistribution } from "./db/pipelines";

export const createExportMetricsAction = (cockDal: CockDal, userDal: UserDal) => async (): Promise<string> => {
  logger.debug("Exporting Prometheus metrics", {
    service: "metrics",
    operation: "export",
  });

  const now = getMoscowDate();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [totalUsers, dauResult, mauResult, distribution] = await Promise.all([
    userDal.count(),
    cockDal.aggregate<{ total: number }>(pActiveUsersSince(dayAgo)),
    cockDal.aggregate<{ total: number }>(pActiveUsersSince(monthAgo)),
    cockDal.aggregate<{ _id: number | string; count: number }>(pSizeDistribution()),
  ]);

  const dau = dauResult[0]?.total ?? 0;
  const mau = mauResult[0]?.total ?? 0;

  totalUsersGauge.set(totalUsers);
  activeUsersGauge.set({ window: "dau" }, dau);
  activeUsersGauge.set({ window: "mau" }, mau);
  for (const bucket of distribution) {
    sizeDistributionGauge.set({ bucket: String(bucket._id) }, bucket.count);
  }

  return await registry.metrics();
};

createExportMetricsAction.inject = [di.cockDal, di.userDal] as const;
