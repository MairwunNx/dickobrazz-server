import { di } from "@/shared/injection";
import type { Container } from "../container";
import type { Pipeline } from "./pipeline";
import type { RouteHandler } from "./types";

export const createRoutes = (container: Container, routeOf: Pipeline): Record<string, RouteHandler | Record<string, RouteHandler>> => {
  const h = <T extends keyof typeof di>(token: T) => container.resolve(token);

  return {
    "/health": { GET: routeOf(h(di.healthHandler)) },
    "/metrics": { GET: routeOf(h(di.metricsHandler)) },
    "/auth/login": { POST: routeOf(h(di.authHandler)) },
    "/api/v1/me": { GET: routeOf(h(di.meHandler), { protected: true }) },
    "/api/v1/me/privacy": { PATCH: routeOf(h(di.privacyHandler), { protected: true }) },
    "/api/v1/cock/size": { POST: routeOf(h(di.sizeHandler), { protected: true }) },
    "/api/v1/cock/ruler": { GET: routeOf(h(di.rulerHandler)) },
    "/api/v1/cock/race": { GET: routeOf(h(di.raceHandler)) },
    "/api/v1/cock/dynamic/global": { GET: routeOf(h(di.dynamicGlobalHandler)) },
    "/api/v1/cock/dynamic/personal": { GET: routeOf(h(di.dynamicPersonalHandler), { protected: true }) },
    "/api/v1/cock/achievements": { GET: routeOf(h(di.achievementsHandler), { protected: true }) },
    "/api/v1/cock/ladder": { GET: routeOf(h(di.ladderHandler)) },
    "/api/v1/cock/seasons": { GET: routeOf(h(di.seasonsHandler)) },
  };
};
