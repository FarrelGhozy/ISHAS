// Cookie sesi + CSRF Fase 6 (BACKEND_API_CONTRACT §16).
// `ishas_session` HttpOnly; `ishas_csrf` dibaca JS untuk double-submit header.

import { CSRF_COOKIE, SESSION_COOKIE, cookieDomain, cookieSecure, sessionTtlMs } from "../config";

export function parseCookies(header: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index < 0) continue;
    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (key) out[key] = decodeURIComponent(value);
  }
  return out;
}

function serialize(name: string, value: string, httpOnly: boolean, maxAge: number): string {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    "Path=/",
    `Max-Age=${maxAge}`,
    "SameSite=Lax",
  ];
  if (httpOnly) parts.push("HttpOnly");
  if (cookieSecure) parts.push("Secure");
  // Hosting subdomain terpisah: samakan domain agar cookie CSRF terbaca JS
  // frontend. Kosong = host-only (bawaan, satu domain).
  const domain = cookieDomain();
  if (domain) parts.push(`Domain=${domain}`);
  return parts.join("; ");
}

// Cookie sesi + CSRF dibuat bersamaan saat login; keduanya punya umur yang sama.
export function buildSessionCookies(token: string, csrf: string): string[] {
  const maxAge = Math.floor(sessionTtlMs / 1000);
  return [
    serialize(SESSION_COOKIE, token, true, maxAge),
    serialize(CSRF_COOKIE, csrf, false, maxAge),
  ];
}

export function clearSessionCookies(): string[] {
  return [
    serialize(SESSION_COOKIE, "", true, 0),
    serialize(CSRF_COOKIE, "", false, 0),
  ];
}

export function sessionTokenFrom(request: Request): string | null {
  return parseCookies(request.headers.get("cookie"))[SESSION_COOKIE] ?? null;
}

export function csrfCookieFrom(request: Request): string | null {
  return parseCookies(request.headers.get("cookie"))[CSRF_COOKIE] ?? null;
}
