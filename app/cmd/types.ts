import type { BunRequest } from "bun";

export type RouteHandler = (req: BunRequest) => Response | Promise<Response>;
export type Handler = RouteHandler;

export type RouteDeps = {
  botToken: string;
  csotToken: string;
  sessionSecret: string;
  sessionTtlSec: number;
  timeoutSec: number;
  setTimeout: (req: BunRequest, timeoutSec: number) => void;
};

export type RouteOptions = {
  protected?: boolean;
};
