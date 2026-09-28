// Klien HTTP frontend ISHAS — menukar mock → server tanpa mengubah UI.
// Flag `VITE_USE_BACKEND` (default false) di dokumentasikan di BACKEND_MIGRATION §1.

import { sessionStore } from "~/shared/auth/session";

export const USE_BACKEND = import.meta.env.VITE_USE_BACKEND === "true";
export const API_BASE = import.meta.env.VITE_API_BASE ?? "/api/v1";

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status: number };

function buildHeaders(json: boolean, extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = { ...extra };
  if (json) headers["Content-Type"] = "application/json";
  const accountId = sessionStore.get()?.accountId;
  if (accountId) headers["X-Demo-Account"] = accountId;
  return headers;
}

export async function apiRequest<T>(
  path: string,
  init: { method?: string; json?: unknown; form?: FormData; headers?: Record<string, string> } = {},
): Promise<ApiResult<T>> {
  const headers = buildHeaders(init.json !== undefined, init.headers);
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
