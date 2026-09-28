// Test bantuan draft penilaian: ingat pesantren, anti-tulis-ulang, hint kurang-apa.

import { describe, expect, test } from "bun:test";
import {
  bacaPesantrenTerakhir,
  draftPenilaianSama,
  ingatPesantren,
  kurangApa,
} from "./penilaian-draft";

const mem = new Map<string, string>();
Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: {
    getItem: (key: string) => mem.get(key) ?? null,
    setItem: (key: string, value: string) => void mem.set(key, value),
    removeItem: (key: string) => void mem.delete(key),
  },
});

describe("ingat pesantren terakhir", () => {
  test("hanya kode terdaftar yang dipakai; kosong menghapus", () => {
    ingatPesantren("PSN-0018");
    expect(bacaPesantrenTerakhir(["PSN-0018", "PSN-0019"])).toBe("PSN-0018");
    expect(bacaPesantrenTerakhir(["PSN-0019"])).toBe("");
    ingatPesantren("");
    expect(bacaPesantrenTerakhir(["PSN-0018"])).toBe("");
  });
});

describe("draftPenilaianSama", () => {
  const isi = {
    reporterName: "Uji",
    contact: "081",
    instrumentChecksum: "ck-1",
    activeIndex: 2,
    answers: { "IND-1": { value: "Ya", note: "" } },
  };
  test("undefined tidak sama; isi identik sama", () => {
    expect(draftPenilaianSama(undefined, isi)).toBe(false);
    expect(draftPenilaianSama({ ...isi }, isi)).toBe(true);
  });
  test("beda jawaban/nama/checksum/indeks tidak sama", () => {
    expect(
      draftPenilaianSama({ ...isi, answers: { "IND-1": { value: "Tidak", note: "" } } }, isi),
    ).toBe(false);
    expect(draftPenilaianSama({ ...isi, reporterName: "Lain" }, isi)).toBe(false);
    expect(draftPenilaianSama({ ...isi, instrumentChecksum: "ck-2" }, isi)).toBe(false);
    expect(draftPenilaianSama({ ...isi, activeIndex: 3 }, isi)).toBe(false);
  });
});

describe("kurangApa", () => {
  const dasar = {
    options: [{ value: "Ya" }, { value: "Tidak" }],
    required: true,
  };
  test("menyebut jawaban, bukti, lokasi, dan catatan N/A", () => {
    expect(kurangApa(dasar, {})).toContain("jawaban");
    expect(kurangApa({ ...dasar, evidenceRequired: true }, { value: "Ya" })).toContain("bukti");
    expect(kurangApa({ ...dasar, locationRequired: true }, { value: "Ya" })).toContain(
      "area/lokasi",
    );
    expect(
      kurangApa(
        { options: [{ value: "N/A" }], required: true },
        { value: "N/A", note: "pendek" },
      ),
    ).toContain("catatan N/A (min 10 karakter)");
  });
  test("lengkap bila semua terisi", () => {
    expect(
      kurangApa(
        { ...dasar, evidenceRequired: true, locationRequired: true },
        { value: "Ya", evidenceName: "b.jpg", areaId: "AREA-001" },
      ),
    ).toEqual([]);
  });
});
