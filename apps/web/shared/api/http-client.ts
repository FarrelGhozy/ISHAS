// Klien HTTP frontend ISHAS — menukar mock → server tanpa mengubah UI.
// Flag `VITE_USE_BACKEND` (default false) di dokumentasikan di BACKEND_MIGRATION §1.

import { sessionStore } from "~/shared/auth/session";

export const USE_BACKEND = import.meta.env.VITE_USE_BACKEND === "true";
export const API_BASE = import.meta.env.VITE_API_BASE ?? "/api/v1";

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status: number };

const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  for (const part of document.cookie.split(";")) {
    const index = part.indexOf("=");
    if (index < 0) continue;
    if (part.slice(0, index).trim() === name) {
      return decodeURIComponent(part.slice(index + 1).trim());
    }
  }
  return null;
}

function buildHeaders(
  method: string,
  json: boolean,
  extra?: Record<string, string>,
): Record<string, string> {
  const headers: Record<string, string> = { ...extra };
  if (json) headers["Content-Type"] = "application/json";
  const accountId = sessionStore.get()?.accountId;
  if (accountId) headers["X-Demo-Account"] = accountId;
  // Fase 6: cookie sesi → mutasi wajib CSRF double-submit (BACKEND_API_CONTRACT §16).
  if (MUTATING.has(method)) {
    const csrf = readCookie("ishas_csrf");
    if (csrf) headers["X-CSRF-Token"] = csrf;
  }
  return headers;
}

// Unduh blob (PDF/bukti) dengan identitas sesi yang sama seperti `apiRequest`.
export async function apiBlob(
  path: string,
): Promise<{ ok: true; blob: Blob; fileName: string } | { ok: false; error: string; status: number }> {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      headers: buildHeaders("GET", false),
      credentials: "include",
    });
    if (!response.ok) {
      let error = "Berkas tidak dapat dimuat.";
      try {
        const payload = (await response.json()) as { error?: string };
        if (payload?.error) error = payload.error;
      } catch {
        // respons non-JSON (mis. 404 HTML) → pakai pesan umum
      }
      return { ok: false, error, status: response.status };
    }
    const disposition = response.headers.get("content-disposition") ?? "";
    const match = /filename="?([^";]+)"?/.exec(disposition);
    return { ok: true, blob: await response.blob(), fileName: match?.[1] ?? "dokumen.pdf" };
  } catch {
    return {
      ok: false,
      error: "Tidak dapat menghubungi server. Periksa koneksi lalu coba lagi.",
      status: 0,
    };
  }
}

export async function apiRequest<T>(
  path: string,
  init: { method?: string; json?: unknown; form?: FormData; headers?: Record<string, string> } = {},
): Promise<ApiResult<T>> {
  const headers = buildHeaders(init.method ?? "GET", init.json !== undefined, init.headers);
  let body: BodyInit | undefined;
  if (init.form) body = init.form;
  else if (init.json !== undefined) body = JSON.stringify(init.json);
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method: init.method ?? "GET",
      headers,
      body,
      credentials: "include",
    });
    const payload = (await response.json()) as
      | { ok: true; data: T }
      | { ok: false; error: string };
    if (!response.ok || !payload.ok) {
      return {
        ok: false,
        error: "error" in payload ? payload.error : "Permintaan gagal.",
        status: response.status,
      };
    }
    return { ok: true, data: payload.data };
  } catch {
    return { ok: false, error: "Tidak dapat menghubungi server. Periksa koneksi lalu coba lagi.", status: 0 };
  }
}
