// Sumber tunggal aturan kelengkapan jawaban penilaian mandiri. Form publik,
// store mock, dan backend semua memanggil fungsi ini, jadi test di sini menjaga
// paritas antarjalur (menggantikan salinan logika 4×).

import { describe, expect, test } from "bun:test";
import { jawabanLengkap, kurangJawaban } from "./self-assessment-completeness";

const indikator = {
  options: [{ value: "Ya" }, { value: "Tidak" }, { value: "N/A" }],
  required: true,
};

describe("kurangJawaban", () => {
  test("menandai jawaban kosong / opsi tak sah", () => {
    expect(kurangJawaban(indikator, {})).toContain("jawaban");
    expect(kurangJawaban(indikator, { value: "Mungkin" })).toContain("jawaban");
    expect(kurangJawaban(indikator, { value: "Ya" })).toEqual([]);
  });

  test("required:false melewatkan validasi opsi, tetap butuh nilai", () => {
    const opsional = { options: [{ value: "Ya" }], required: false };
    expect(kurangJawaban(opsional, { value: "Bebas" })).toEqual([]);
    expect(kurangJawaban(opsional, {})).toContain("jawaban");
  });

  test("bukti dan area wajib bila diminta", () => {
    const butuh = { options: [{ value: "Ya" }], required: true, evidenceRequired: true, locationRequired: true };
    expect(kurangJawaban(butuh, { value: "Ya" })).toEqual(["bukti", "area/lokasi"]);
    expect(
      kurangJawaban(butuh, { value: "Ya", evidenceName: "f.jpg", manualLocation: "Koridor" }),
    ).toEqual([]);
    expect(kurangJawaban(butuh, { value: "Ya", evidenceName: "f.jpg", areaId: "AREA-1" })).toEqual(
      [],
    );
  });

  test("N/A butuh catatan minimal 10 karakter", () => {
    expect(kurangJawaban(indikator, { value: "N/A", note: "pendek" })).toContain(
      "catatan N/A (min 10 karakter)",
    );
    expect(jawabanLengkap(indikator, { value: "N/A", note: "catatan cukup panjang" })).toBe(true);
  });
});

describe("jawabanLengkap", () => {
  test("setara kurangJawaban kosong", () => {
    expect(jawabanLengkap(indikator, { value: "Tidak" })).toBe(true);
    expect(jawabanLengkap(indikator, { value: "Tidak", areaId: "AREA-1" })).toBe(true);
    expect(jawabanLengkap(indikator, {})).toBe(false);
  });
});
