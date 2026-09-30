// Uji pemilih tampilan login: mock selalu demo; backend mengikuti metode server.
import { describe, expect, test } from "bun:test";
import { resolveLoginMode } from "./login-mode";

describe("resolveLoginMode", () => {
  test("mode mock selalu kartu demo (tanpa auth sandi)", () => {
    expect(resolveLoginMode(false, null)).toBe("demo");
    expect(resolveLoginMode(false, { demo: false })).toBe("demo");
  });

  test("backend demo aktif → kartu demo", () => {
    expect(resolveLoginMode(true, { demo: true })).toBe("demo");
  });

  test("backend production (demo mati) → form sandi", () => {
    expect(resolveLoginMode(true, { demo: false })).toBe("password");
  });

  test("backend gagal memuat metode → form sandi (fallback aman)", () => {
    expect(resolveLoginMode(true, null)).toBe("password");
  });
});
