import { auth } from "@/net/handlers/auth";
import { achievements, dynamicg, dynamicp, ladder, race, ruler, seasons, size } from "@/net/handlers/cocks";
import { health } from "@/net/handlers/health";
import { me, privacy } from "@/net/handlers/me";
import { metrics } from "@/net/handlers/metrics";
import { route } from "./factory";
import type { RouteDeps, RouteHandler } from "./types";

export const routers = (deps: RouteDeps): Record<string, RouteHandler | Record<string, RouteHandler>> => {
  return {
    "/health": { GET: route(health, deps) },
    "/metrics": { GET: route(metrics, deps) },
    "/auth/login": { POST: route(auth({ botToken: deps.botToken, sessionSecret: deps.sessionSecret, sessionTtlSec: deps.sessionTtlSec }), deps) },
    "/api/v1/me": { GET: route(me, deps, { protected: true }) },
    "/api/v1/me/privacy": { PATCH: route(privacy, deps, { protected: true }) },
    "/api/v1/cock/size": { POST: route(size, deps, { protected: true }) },
    "/api/v1/cock/ruler": { GET: route(ruler, deps) },
    "/api/v1/cock/race": { GET: route(race, deps) },
    "/api/v1/cock/dynamic/global": { GET: route(dynamicg, deps) },
    "/api/v1/cock/dynamic/personal": { GET: route(dynamicp, deps, { protected: true }) },
    "/api/v1/cock/achievements": { GET: route(achievements, deps, { protected: true }) },
    "/api/v1/cock/ladder": { GET: route(ladder, deps) },
    "/api/v1/cock/seasons": { GET: route(seasons, deps) },
  };
};
