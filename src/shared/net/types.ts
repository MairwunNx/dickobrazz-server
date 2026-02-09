import type { BunRequest } from "bun";

export type Handler = (req: BunRequest) => Response | Promise<Response>;
