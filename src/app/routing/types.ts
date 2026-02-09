import type { BunRequest } from "bun";

export type RouteHandler = (req: BunRequest) => Response | Promise<Response>;
export type Handler = RouteHandler;

export type RouteOptions = {
  protected?: boolean;
};
