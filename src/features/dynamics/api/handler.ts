import { di } from "@/shared/injection";
import { success } from "@/shared/net/response";
import type { Handler } from "@/shared/net/types";
import type { CockDynamicIndividual, CockDynamicOverall } from "../types";

type GetDynamicGlobalAction = () => Promise<CockDynamicOverall>;
type GetDynamicPersonalAction = () => Promise<CockDynamicIndividual>;

export const createDynamicGlobalHandler =
  (getDynamicGlobalAction: GetDynamicGlobalAction): Handler =>
  async () =>
    success(await getDynamicGlobalAction());

createDynamicGlobalHandler.inject = [di.getDynamicGlobalAction] as const;

export const createDynamicPersonalHandler =
  (getDynamicPersonalAction: GetDynamicPersonalAction): Handler =>
  async () =>
    success(await getDynamicPersonalAction());

createDynamicPersonalHandler.inject = [di.getDynamicPersonalAction] as const;
