import { AsyncLocalStorage } from "node:async_hooks";
import type { UserProfile } from "@/dto/user";
import type { AuthType } from "@/svc/auth/types";

export interface RequestContext {
  request_id: string;
  user?: UserProfile;
  auth_type?: AuthType;
  is_authenticated: boolean;
}

export const requestStorage = new AsyncLocalStorage<RequestContext>();

export const withContext = async <T>(context: RequestContext, fn: () => T | Promise<T>): Promise<T> => {
  return requestStorage.run(context, fn);
};

export const getContext = (): RequestContext | null => {
  return requestStorage.getStore() ?? null;
};
