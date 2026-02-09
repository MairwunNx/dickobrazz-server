import { Counter, collectDefaultMetrics, Gauge, Registry } from "prom-client";

export const registry = new Registry();

export const httpRequestsTotal = new Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "path", "status"],
  registers: [registry],
});

export const totalUsersGauge = new Gauge({
  name: "db_total_users",
  help: "Total number of users in MongoDB",
  registers: [registry],
});

export const activeUsersGauge = new Gauge({
  name: "db_active_users",
  help: "Active users in MongoDB",
  labelNames: ["window"],
  registers: [registry],
});

export const sizeDistributionGauge = new Gauge({
  name: "cock_size_distribution",
  help: "Cock size distribution buckets",
  labelNames: ["bucket"],
  registers: [registry],
});

collectDefaultMetrics({ register: registry });
