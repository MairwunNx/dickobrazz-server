import type { UserProfile } from "@/dto/user";
import type { AuthType } from "@/svc/auth/types";

export interface RequestContext {
  request_id: string;
  user?: UserProfile;
  auth_type?: AuthType;
  is_authenticated: boolean;
}

let currentContext: RequestContext | null = null;

export const setContext = (context: RequestContext): void => {
  currentContext = context;
};

export const getContext = (): RequestContext | null => {
  return currentContext;
};

export const clearContext = (): void => {
  currentContext = null;
};
