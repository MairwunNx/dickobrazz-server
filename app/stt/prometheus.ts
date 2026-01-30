import { Counter, collectDefaultMetrics, Registry } from "prom-client";

export const registry = new Registry();

export const httpRequestsTotal = new Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "path", "status"],
  registers: [registry],
});

collectDefaultMetrics({ register: registry });
