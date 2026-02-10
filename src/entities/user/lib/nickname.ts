import type { UserDoc } from "../types";

export const generateAnonymousNumber = (userId: number): string => {
  const id = BigInt(userId);
  const n = ((id * 6364136223846793005n) & 0xffffffffn) % 10000n;
  return String(Number(n < 0n ? -n : n)).padStart(4, "0");
};

export const normalizeNickname = (user: UserDoc | null, userId: number): string => {
  if (!user || user.is_hidden || !user.username) {
    return `Anonym${generateAnonymousNumber(userId)}`;
  }
  return user.username;
};
