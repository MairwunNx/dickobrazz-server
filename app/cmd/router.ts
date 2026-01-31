import { authLoginHandler } from "@/net/handlers/auth";
import {
  cockAchievementsHandler,
  cockDynamicGlobalHandler,
  cockDynamicPersonalHandler,
  cockLadderHandler,
  cockRaceHandler,
  cockRulerHandler,
  cockSeasonsHandler,
  cockSizeHandler,
} from "@/net/handlers/cocks";
import { healthHandler } from "@/net/handlers/health";
import { meHandler, updatePrivacyHandler } from "@/net/handlers/me";
import { metricsHandler } from "@/net/handlers/metrics";
import type { RequestContext } from "./context";

type Handler = (req: Request, context: RequestContext, config: HandlerConfig) => Response | Promise<Response>;

interface HandlerConfig {
  botToken: string;
}

interface Route {
  method: string;
  path: string;
  handler: Handler;
  protected?: boolean;
}

const h = <T extends Handler>(fn: T) => fn;

export const routes: Route[] = [
  { method: "GET", path: "/health", handler: h(async () => await healthHandler()), protected: false },
  { method: "GET", path: "/metrics", handler: h(async () => await metricsHandler()), protected: false },
  { method: "POST", path: "/api/v1/auth/login", handler: h(async (req, _ctx, cfg) => await authLoginHandler(req, cfg.botToken)), protected: false },
  { method: "GET", path: "/api/v1/me", handler: h(async (_req, ctx) => await meHandler(ctx)), protected: true },
  { method: "PATCH", path: "/api/v1/me/privacy", handler: h(async (req, ctx) => await updatePrivacyHandler(req, ctx)), protected: true },
  { method: "POST", path: "/api/v1/cock/size", handler: h(async (_req, ctx) => await cockSizeHandler(ctx)), protected: true },
  { method: "GET", path: "/api/v1/cock/ruler", handler: h(cockRulerHandler), protected: false },
  { method: "GET", path: "/api/v1/cock/race", handler: h(cockRaceHandler), protected: false },
  { method: "GET", path: "/api/v1/cock/dynamic/global", handler: h(async () => await cockDynamicGlobalHandler()), protected: false },
  { method: "GET", path: "/api/v1/cock/dynamic/personal", handler: h(async (_req, ctx) => await cockDynamicPersonalHandler(ctx)), protected: true },
  { method: "GET", path: "/api/v1/cock/achievements", handler: h(cockAchievementsHandler), protected: true },
  { method: "GET", path: "/api/v1/cock/ladder", handler: h(cockLadderHandler), protected: false },
  { method: "GET", path: "/api/v1/cock/seasons", handler: h(cockSeasonsHandler), protected: false },
];

export const matchRoute = (method: string, pathname: string): Route | null => {
  return routes.find((r) => r.method === method && r.path === pathname) || null;
};

const allowedOrigins = new Set(["https://dickobrazz.com", "https://www.dickobrazz.com", "http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000"]);

const subdomainRegex = /^https:\/\/.*\.dickobrazz\.com$/;

export const getCorsHeaders = (origin: string | null): Record<string, string> => {
  if (!origin) return {};
  const isAllowed = allowedOrigins.has(origin) || subdomainRegex.test(origin);
  if (!isAllowed) return {};

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Internal-Token, X-Internal-User-Id, X-Request-Id",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
};
