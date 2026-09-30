// Test CRUD bank SAM-iSAFE (D-26.f): guard Validator, ubah/hapus/urutan,
// panduan per soal, migrasi v13→v14, penanda duplikat.

import { describe, expect, test, beforeEach } from "bun:test";
import { storeActions, getState } from "./mock-store";
import { migrateV13 } from "./state";
import { SEED } from "../seed/seed";
import { SAM_QUESTIONS_SEED, samDuplicateQuestions } from "../sam-isafe";

const validator = { id: "USR-002" };
const pesantren = { id: "USR-003" };

function mustId(hasil: { ok: boolean; id?: string; error?: string }): string {
  if (!hasil.ok || !hasil.id) throw new Error(hasil.error ?? "Tanpa id.");
  return hasil.id;
}

describe("bank SAM-iSAFE D-26.f", () => {
  beforeEach(() => {
    storeActions.resetMockData();
  });

  test("non-validator ditolak menambah kategori", () => {
    const hasil = storeActions.addSamCategory(pesantren, { name: "Coba" });
    expect(hasil.ok).toBe(false);
  });

  test("nama kategori duplikat ditolak", () => {
    const hasil = storeActions.addSamCategory(validator, { name: "keselamatan fisik" });
    expect(hasil.ok).toBe(false);
  });

  test("tambah + ubah kategori menyimpan deskripsi", () => {
    const tambah = storeActions.addSamCategory(
      validator,
      { name: "Keselamatan Lab", description: "Bahan kimia dan APD." },
    );
    expect(tambah.ok).toBe(true);
    const ubah = storeActions.updateSamCategory(validator, mustId(tambah), { name: "Keselamatan Lab 2" });
    expect(ubah.ok).toBe(true);
    const simpan = getState().samCategories.find((item) => item.id === mustId(tambah));
    expect(simpan?.name).toBe("Keselamatan Lab 2");
    expect(simpan?.description).toBe("Bahan kimia dan APD.");
  });

  test("hapus kategori berisi soal ditolak; kategori kosong bisa dihapus", () => {
    const penuh = storeActions.deleteSamCategory(validator, "SAM-KAT-01");
    expect(penuh.ok).toBe(false);
    const tambah = storeActions.addSamCategory(validator, { name: "Kategori Kosong" });
    expect(tambah.ok).toBe(true);
    expect(storeActions.deleteSamCategory(validator, mustId(tambah)).ok).toBe(true);
    expect(getState().samCategories.some((item) => item.id === mustId(tambah))).toBe(false);
  });

  test("tambah soal menyimpan panduan + contoh bukti", () => {
    const tambah = storeActions.addSamQuestion(
      validator,
      {
        categoryId: "SAM-KAT-01",
        text: "Contoh pertanyaan baru yang cukup panjang.",
        panduan: "Periksa tiap lantai.",
        contohBukti: "Foto panel listrik.",
      },
    );
    expect(tambah.ok).toBe(true);
    const simpan = getState().samQuestions.find((item) => item.id === mustId(tambah));
    expect(simpan?.panduan).toBe("Periksa tiap lantai.");
    expect(simpan?.contohBukti).toBe("Foto panel listrik.");
  });

  test("ubah soal bisa pindah kategori", () => {
    const tambah = storeActions.addSamQuestion(
      validator,
      { categoryId: "SAM-KAT-01", text: "Soal pindahan yang cukup panjang." },
    );
    expect(tambah.ok).toBe(true);
    const ubah = storeActions.updateSamQuestion(
      validator,
      mustId(tambah),
      { text: "Soal pindahan yang sudah diubah teksnya.", categoryId: "SAM-KAT-02" },
    );
    expect(ubah.ok).toBe(true);
    expect(getState().samQuestions.find((item) => item.id === mustId(tambah))?.categoryId).toBe(
      "SAM-KAT-02",
    );
  });

  test("hapus soal yang dipakai pengamatan ditolak; soal baru bisa dihapus", () => {
    const dipakai = storeActions.deleteSamQuestion(validator, "SAM-Q-001");
    expect(dipakai.ok).toBe(false);
    const tambah = storeActions.addSamQuestion(
      validator,
      { categoryId: "SAM-KAT-01", text: "Soal sekali pakai yang cukup panjang." },
    );
    expect(tambah.ok).toBe(true);
    expect(storeActions.deleteSamQuestion(validator, mustId(tambah)).ok).toBe(true);
  });

  test("geser urutan menukar posisi; ujung ditolak", () => {
    expect(storeActions.moveSamQuestion(validator, "SAM-Q-001", "naik").ok).toBe(false);
    expect(storeActions.moveSamQuestion(validator, "SAM-Q-001", "turun").ok).toBe(true);
    const urut = getState()
      .samQuestions.filter((item) => item.categoryId === "SAM-KAT-01")
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((item) => item.id);
    expect(urut[0]).toBe("SAM-Q-002");
    expect(urut[1]).toBe("SAM-Q-001");
  });

  test("migrasi v13 mengisi panduan + contoh bukti kosong", () => {
    const lama = {
      ...structuredClone(SEED),
      schemaVersion: 13,
      samQuestions: SAM_QUESTIONS_SEED.map((item) => ({
        id: item.id,
        categoryId: item.categoryId,
        text: item.text,
        sortOrder: item.sortOrder,
        isActive: true,
      })),
    };
    const hasil = migrateV13(lama) as typeof SEED;
    expect(hasil.schemaVersion).toBe(14);
    expect(hasil.samQuestions.every((item) => item.panduan === "")).toBe(true);
    expect(hasil.samQuestions.every((item) => item.contohBukti === "")).toBe(true);
  });

  test("duplikat menandai SAM-Q-012 dengan SAM-Q-025", () => {
    const peta = samDuplicateQuestions(SAM_QUESTIONS_SEED);
    expect(peta.get("SAM-Q-012")).toEqual(["SAM-Q-025"]);
    expect(peta.get("SAM-Q-025")).toEqual(["SAM-Q-012"]);
    expect(peta.has("SAM-Q-001")).toBe(false);
  });
});
