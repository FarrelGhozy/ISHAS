// Rate limit login sederhana (in-memory) — BACKEND_API_CONTRACT §16.
// Cukup untuk prototipe satu proses; produksi sebaiknya memakai store bersama.

export class RateLimiter {
  private hits = new Map<string, number[]>();

  constructor(
    private readonly max: number,
    private readonly windowMs: number,
  ) {}

  // true bila permintaan masih diizinkan; false bila melewati batas.
  check(key: string, now = Date.now()): boolean {
    const cutoff = now - this.windowMs;
    const recent = (this.hits.get(key) ?? []).filter((at) => at > cutoff);
    if (recent.length >= this.max) {
      this.hits.set(key, recent);
      return false;
    }
    recent.push(now);
    this.hits.set(key, recent);
    return true;
  }

  reset(): void {
    this.hits.clear();
  }
}
