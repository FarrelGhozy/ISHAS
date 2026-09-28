// Uji unit helper seed (murni, tanpa DB): normalisasi nilai mock → kolom SQL.
import { describe, expect, test } from "bun:test";
import { json, text, toDateOnly, toDateTime } from "../src/seed/helpers";

describe("toDateTime", () => {
  test("nilai kosong → null", () => {
    expect(toDateTime(null)).toBeNull();
    expect(toDateTime(undefined)).toBeNull();
    expect(toDateTime("")).toBeNull();
  });
  test("ISO valid → Date dengan waktu sama", () => {
    const value = toDateTime("2026-09-08T08:15:00.000Z");
    expect(value?.toISOString()).toBe("2026-09-08T08:15:00.000Z");
  });
  test("tanggal invalid → null", () => {
    expect(toDateTime("bukan-tanggal")).toBeNull();
  });
  test("Date diteruskan apa adanya", () => {
    const date = new Date("2026-01-02T03:04:05.000Z");
    expect(toDateTime(date)).toBe(date);
  });
});

describe("toDateOnly", () => {
  test("mengambil 10 karakter pertama", () => {
    expect(toDateOnly("2026-09-08T08:15:00.000Z")).toBe("2026-09-08");
  });
  test("Date → YYYY-MM-DD", () => {
    expect(toDateOnly(new Date("2026-12-31T23:00:00.000Z"))).toBe("2026-12-31");
  });
  test("nilai kosong → null", () => {
    expect(toDateOnly(null)).toBeNull();
    expect(toDateOnly(undefined)).toBeNull();
  });
});

describe("json", () => {
  test("objek/array diserialisasi", () => {
    expect(json({ a: 1 })).toBe('{"a":1}');
    expect(json([1, 2])).toBe("[1,2]");
  });
  test("null/undefined → null", () => {
    expect(json(null)).toBeNull();
    expect(json(undefined)).toBeNull();
  });
});

describe("text", () => {
  test("trim dan kosong → null", () => {
    expect(text("  halo  ")).toBe("halo");
    expect(text("   ")).toBeNull();
    expect(text("")).toBeNull();
    expect(text(undefined)).toBeNull();
  });
});
