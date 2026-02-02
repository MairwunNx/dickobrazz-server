import type { BunRequest } from "bun";
import type { Handler } from "@/cmd/types";
import { paginationFrom } from "@/net/pagination";
import { success } from "@/net/responses";
import { getAchievements, getDynamicGlobal, getDynamicPersonal, getLadder, getOrGenerateSize, getRace, getRuler, getSeasons } from "@/svc/cocks/service";

const page: (req: BunRequest) => { limit?: number; page?: number } = (req) => paginationFrom(new URL(req.url));
export const size: Handler = async () => success(await getOrGenerateSize());
export const ruler: Handler = async (req) => success(await getRuler(page(req)));
export const race: Handler = async (req) => success(await getRace(page(req)));
export const dynamicg: Handler = async () => success(await getDynamicGlobal());
export const dynamicp: Handler = async () => success(await getDynamicPersonal());
export const achievements: Handler = async (req) => success(await getAchievements(page(req)));
export const ladder: Handler = async (req) => success(await getLadder(page(req)));
export const seasons: Handler = async (req) => success(await getSeasons(page(req)));
