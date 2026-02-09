import type { Handler } from "@/app/routing";
import { di } from "@/shared/injection";
import { success } from "@/shared/net/response";
import type { CockDynamicGlobalResponse, CockDynamicResponse } from "../types";

type GetDynamicGlobalAction = () => Promise<CockDynamicGlobalResponse>;
type GetDynamicPersonalAction = (userId: number) => Promise<CockDynamicResponse>;

export const createDynamicGlobalHandler =
  (getDynamicGlobalAction: GetDynamicGlobalAction): Handler =>
  async () =>
    success(await getDynamicGlobalAction());

createDynamicGlobalHandler.inject = [di.getDynamicGlobalAction] as const;

export const createDynamicPersonalHandler =
  (getDynamicPersonalAction: GetDynamicPersonalAction): Handler =>
  async () =>
    success(await getDynamicPersonalAction(0)); // TODO: userId из контекста

createDynamicPersonalHandler.inject = [di.getDynamicPersonalAction] as const;
