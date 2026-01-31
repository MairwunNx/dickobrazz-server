import type { UserProfile } from "@/dto/user";

export type AuthType = "telegram" | "internal";

export interface AuthResult {
  authenticated: boolean;
  auth_type?: AuthType;
  user?: UserProfile;
}
