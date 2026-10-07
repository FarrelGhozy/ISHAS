// Vektor uji judul otomatis lapor-cepat (D-47) — dipakai acuan paritas mock↔backend.

import { describe, expect, test } from "bun:test";
import { buatJudulLaporanOtomatis } from "./laporan-title";

describe("buatJudulLaporanOtomatis", () => {
  test("deskripsi biasa → 10 kata pertama", () => {
    const judul = buatJudulLaporanOtomatis(
      "Kabel listrik menggantung di koridor lantai dua asrama sejak kemarin dan perlu segera diamankan",
    );
    expect(judul).toBe(
      "Kabel listrik menggantung di koridor lantai dua asrama sejak kemarin",
    );
  });

  test("whitespace berlebih dirapikan", () => {
    expect(buatJudulLaporanOtomatis("  Kabel\nterbuka\tdi  koridor ")).toBe(
      "Kabel terbuka di koridor",
    );
  });

  test("lebih dari 140 karakter → potong batas kata", () => {
    const kataPanjang = "abcdefghij".repeat(3);
    const judul = buatJudulLaporanOtomatis(Array(12).fill(kataPanjang).join(" "));
    expect(judul.length).toBeLessThanOrEqual(140);
    expect(judul.endsWith(" ")).toBe(false);
    expect(judul).toBe(Array(4).fill(kataPanjang).join(" "));
  });

  test("deskripsi kosong + lokasi → fallback lokasi", () => {
    expect(buatJudulLaporanOtomatis("", { labelLokasi: "Asrama B" })).toBe(
      "Temuan di Asrama B",
    );
    expect(
      buatJudulLaporanOtomatis("   ", {
        namaKategori: "Keselamatan",
        labelLokasi: "Asrama B",
      }),
    ).toBe("Temuan Keselamatan di Asrama B");
  });

  test("deskripsi dan lokasi kosong → fallback generik", () => {
    expect(buatJudulLaporanOtomatis("")).toBe("Temuan tanpa deskripsi");
  });
});
