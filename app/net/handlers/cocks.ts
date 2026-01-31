import type { RequestContext } from "@/cmd/context";
import { parsePaginationParams } from "@/net/pagination";
import { successResponse } from "@/net/responses";
import { getAchievements, getDynamic, getLadder, getOrGenerateSize, getRace, getRuler, getSeasons } from "@/svc/cocks/service";

export const cockSizeHandler = async (context: RequestContext): Promise<Response> => {
  if (!context.user) {
    throw new Error("User not authenticated");
  }

  const result = await getOrGenerateSize({
    user_id: context.user.id,
    nickname: context.user.username || `User${context.user.id}`,
  });

  return successResponse(result);
};

export const cockRulerHandler = async (req: Request, context: RequestContext): Promise<Response> => {
  const url = new URL(req.url);
  const pagination = parsePaginationParams(url);

  const result = await getRuler({
    ...pagination,
    user_id: context.user?.id,
  });

  return successResponse(result);
};

export const cockRaceHandler = async (req: Request, context: RequestContext): Promise<Response> => {
  const url = new URL(req.url);
  const pagination = parsePaginationParams(url);

  const result = await getRace({
    ...pagination,
    user_id: context.user?.id,
  });

  return successResponse(result);
};

export const cockDynamicHandler = async (context: RequestContext): Promise<Response> => {
  if (!context.user) {
    throw new Error("User not authenticated");
  }

  const result = await getDynamic(context.user.id);
  return successResponse(result);
};

export const cockAchievementsHandler = async (req: Request, context: RequestContext): Promise<Response> => {
  if (!context.user) {
    throw new Error("User not authenticated");
  }

  const url = new URL(req.url);
  const pagination = parsePaginationParams(url);

  const result = await getAchievements(context.user.id, pagination);
  return successResponse(result);
};

export const cockLadderHandler = async (req: Request, context: RequestContext): Promise<Response> => {
  const url = new URL(req.url);
  const pagination = parsePaginationParams(url);

  const result = await getLadder({
    ...pagination,
    user_id: context.user?.id,
  });

  return successResponse(result);
};

export const cockSeasonsHandler = async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  const pagination = parsePaginationParams(url);

  const result = await getSeasons(pagination);
  return successResponse(result);
};
