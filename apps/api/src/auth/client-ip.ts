// Alamat IP klien untuk rate limit — dipakai rute auth dan publik.
// Hormati proxy (Cloudflare Tunnel D-46) lewat header terusan.

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "lokal";
  return request.headers.get("x-real-ip")?.trim() || "lokal";
}
