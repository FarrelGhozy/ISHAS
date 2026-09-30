// Token sesi Fase 6 (BACKEND_DATA_MODEL §1): token acak dikirim di cookie,
// yang disimpan hanya `token_hash` SHA-256. `sessions.id` murni identifier baris.

import { createHash, randomBytes } from "node:crypto";

export type NewSessionToken = {
  id: Buffer;
  token: string;
  tokenHash: string;
};

export function createSessionToken(): NewSessionToken {
  const token = randomBytes(32).toString("hex");
  return { id: randomBytes(16), token, tokenHash: sha256Hex(token) };
}

export function sha256Hex(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function csrfToken(): string {
  return randomBytes(24).toString("hex");
}
