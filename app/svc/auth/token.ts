import { createHmac, timingSafeEqual } from "node:crypto";
import { base64UrlDecode, base64UrlEncode } from "@/sys/base64";

export interface SessionPayload {
  sub: number;
  iat: number;
  exp: number;
}

export const signSessionToken = (userId: number, secret: string, ttlSec: number): string => {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "HS256", typ: "JWT" };
  const payload: SessionPayload = {
    sub: userId,
    iat: now,
    exp: now + ttlSec,
  };

  const headerEncoded = base64UrlEncode(Buffer.from(JSON.stringify(header)));
  const payloadEncoded = base64UrlEncode(Buffer.from(JSON.stringify(payload)));
  const data = `${headerEncoded}.${payloadEncoded}`;
  const signature = createHmac("sha256", secret).update(data).digest();
  const signatureEncoded = base64UrlEncode(signature);

  return `${data}.${signatureEncoded}`;
};

export const verifySessionToken = (token: string, secret: string): SessionPayload | null => {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [headerEncoded, payloadEncoded, signatureEncoded] = parts;
  if (!headerEncoded || !payloadEncoded || !signatureEncoded) return null;
  const data = `${headerEncoded}.${payloadEncoded}`;
  const expectedSignature = createHmac("sha256", secret).update(data).digest();
  const actualSignature = base64UrlDecode(signatureEncoded);

  if (expectedSignature.length !== actualSignature.length) return null;
  if (!timingSafeEqual(expectedSignature, actualSignature)) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(payloadEncoded).toString("utf-8")) as SessionPayload;
    if (!payload || typeof payload.sub !== "number" || typeof payload.exp !== "number") return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
};
