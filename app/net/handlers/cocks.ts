import type { Handler } from "@/cmd/types";
import { getContext } from "@/cmd/context";
import { parsePaginationParams } from "@/net/pagination";
import { successResponse } from "@/net/responses";
import { getAchievements, getDynamicGlobal, getDynamicPersonal, getLadder, getOrGenerateSize, getRace, getRuler, getSeasons } from "@/svc/cocks/service";

export const cockSizeHandler: Handler = async () => {
  const context = getContext();
  if (!context?.user) {
    throw new Error("User not authenticated");
  }

  const result = await getOrGenerateSize({
    user_id: context.user.id,
    nickname: context.user.username || `User${context.user.id}`,
  });

  return successResponse(result);
};

export const cockRulerHandler: Handler = async (req) => {
  const context = getContext();
  const url = new URL(req.url);
  const pagination = parsePaginationParams(url);

  const result = await getRuler({
    ...pagination,
    user_id: context?.user?.id,
  });

  return successResponse(result);
};

export const cockRaceHandler: Handler = async (req) => {
  const context = getContext();
  const url = new URL(req.url);
  const pagination = parsePaginationParams(url);

  const result = await getRace({
    ...pagination,
    user_id: context?.user?.id,
  });

  return successResponse(result);
};

export const cockDynamicGlobalHandler: Handler = async () => {
  const result = await getDynamicGlobal();
  return successResponse(result);
};

export const cockDynamicPersonalHandler: Handler = async () => {
  const context = getContext();
  if (!context?.user) {
    throw new Error("User not authenticated");
  }

  const result = await getDynamicPersonal(context.user.id);
  return successResponse(result);
};

export const cockAchievementsHandler: Handler = async (req) => {
  const context = getContext();
  if (!context?.user) {
    throw new Error("User not authenticated");
  }

  const url = new URL(req.url);
  const pagination = parsePaginationParams(url);

  const result = await getAchievements(context.user.id, pagination);
  return successResponse(result);
};

export const cockLadderHandler: Handler = async (req) => {
  const context = getContext();
  const url = new URL(req.url);
  const pagination = parsePaginationParams(url);

  const result = await getLadder({
    ...pagination,
    user_id: context?.user?.id,
  });

  return successResponse(result);
};

export const cockSeasonsHandler: Handler = async (req) => {
  const url = new URL(req.url);
  const pagination = parsePaginationParams(url);

  const result = await getSeasons(pagination);
  return successResponse(result);
};
