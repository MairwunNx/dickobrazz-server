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
import { route } from "./factory";
import type { RouteDeps, RouteHandler } from "./types";

export const routers = (deps: RouteDeps): Record<string, RouteHandler | Record<string, RouteHandler>> => {
  return {
    "/health": { GET: route(healthHandler, deps) },
    "/metrics": { GET: route(metricsHandler, deps) },
    "/api/v1/auth/login": { POST: route(authLoginHandler({ botToken: deps.botToken, sessionSecret: deps.sessionSecret, sessionTtlSec: deps.sessionTtlSec }), deps) },
    "/api/v1/me": { GET: route(meHandler, deps, { protected: true }) },
    "/api/v1/me/privacy": { PATCH: route(updatePrivacyHandler, deps, { protected: true }) },
    "/api/v1/cock/size": { POST: route(cockSizeHandler, deps, { protected: true }) },
    "/api/v1/cock/ruler": { GET: route(cockRulerHandler, deps) },
    "/api/v1/cock/race": { GET: route(cockRaceHandler, deps) },
    "/api/v1/cock/dynamic/global": { GET: route(cockDynamicGlobalHandler, deps) },
    "/api/v1/cock/dynamic/personal": { GET: route(cockDynamicPersonalHandler, deps, { protected: true }) },
    "/api/v1/cock/achievements": { GET: route(cockAchievementsHandler, deps, { protected: true }) },
    "/api/v1/cock/ladder": { GET: route(cockLadderHandler, deps) },
    "/api/v1/cock/seasons": { GET: route(cockSeasonsHandler, deps) },
  };
};
