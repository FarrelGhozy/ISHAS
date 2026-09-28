// Utilitas HTTP backend ISHAS: amplop ActionResult + pemetaan pesan → kode HTTP.
// Cermin `docs/BACKEND_API_CONTRACT.md` §0.

export type ApiOk<T> = { ok: true; data: T };
export type ApiErr = { ok: false; error: string };

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

export function ok<T>(data: T, status = 200): Response {
  return jsonResponse({ ok: true, data }, status);
}

export function fail(error: string, status = 400): Response {
  return jsonResponse({ ok: false, error }, status);
}

// Pemetaan pesan validasi mock → kode HTTP (API §0.b). Urutan diperiksa dari
// sesi dulu, lalu peran/scope, "tidak ditemukan", konflik, ukuran berkas, umum.
const UNAUTHORIZED = ["sesi tidak dikenal", "sesi berakhir"];
const NOT_FOUND = ["tidak ditemukan", "belum diunggah"];
const FORBIDDEN = [
  "hanya pengelola",
  "hanya publik",
  "hanya akun validator",
  "hanya validator",
  "hanya pesantren",
  "berwenang",
  "keluar dari akun",
  "tidak berwenang",
  "tidak dapat mengunggah",
  "hanya publik tanpa login",
  "akun sendiri",
];
const CONFLICT = [
  "hanya laporan menunggu validasi",
  "instrumen berubah",
  "denah aktif berubah",
  "denah telah berubah",
  "sedang direset",
];
const PAYLOAD_TOO_LARGE = [
  "maksimal 5 mb",
  "maksimum 5 mb",
  "maksimal 10 mb",
  "20 megapiksel",
  "melebihi batas",
  "terlalu besar",
];

export function httpStatusForError(message: string): number {
  const lower = message.toLowerCase();
  if (UNAUTHORIZED.some((p) => lower.includes(p))) return 401;
  if (NOT_FOUND.some((p) => lower.includes(p))) return 404;
  if (FORBIDDEN.some((p) => lower.includes(p))) return 403;
  if (CONFLICT.some((p) => lower.includes(p))) return 409;
  if (PAYLOAD_TOO_LARGE.some((p) => lower.includes(p))) return 413;
  return 400;
}

export function actionResponse(result: { ok: true; id?: string } | { ok: false; error: string }): Response {
  if (result.ok) return ok({ id: result.id }, result.id ? 201 : 200);
  return fail(result.error, httpStatusForError(result.error));
}

export function paginate<T>(items: T[], url: URL): { items: T[]; page: number; limit: number; total: number } {
  const page = Math.max(1, Number.parseInt(url.searchParams.get("page") ?? "1", 10) || 1);
  const rawLimit = Number.parseInt(url.searchParams.get("limit") ?? "20", 10) || 20;
  const limit = Math.min(100, Math.max(1, rawLimit));
  const start = (page - 1) * limit;
  return { items: items.slice(start, start + limit), page, limit, total: items.length };
}
