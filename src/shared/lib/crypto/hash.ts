export const computeHash = (salt: string, size: number): string => new Bun.CryptoHasher("sha256").update(`${salt}:${size}`).digest("hex");
