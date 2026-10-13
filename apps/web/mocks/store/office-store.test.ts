// Test store Inspeksi K3L Perkantoran (D-49): alur buat → isi → selesai →
// tindak lanjut → review, plus guard peran, bank CRUD, dan validasi jawaban.

import { beforeEach, describe, expect, test } from "bun:test";
import { getState, storeActions } from "./mock-store";

const VALIDATOR = "USR-002";
const PESANTREN = "USR-003";

function buatDraft() {
  const hasil = storeActions.createOfficeAssessment(
    { id: VALIDATOR },
    {
      institutionCode: "PSN-0024",
      unitKerja: "Fakultas Sains dan Teknologi",
      manualLocation: "Ruang TU Lt. 2",
      observedAt: "2026-10-13",
      observedTime: "09:00",
      kind: "Inspeksi Rutin",
      observerName: "M. Ridwan",
    },
  );
  if (!hasil.ok) throw new Error(hasil.error);
  return hasil.id as string;
}

function isiPenuh(id: string, value: "Ya" | "Tidak" = "Ya") {
  const state = getState();
  for (const soal of state.officeQuestions.filter((item) => item.isActive)) {
    const hasil = storeActions.saveOfficeAnswer(
      { id: VALIDATOR },
      { assessmentId: id, questionId: soal.id, value },
    );
    expect(hasil.ok).toBe(true);
  }
}

describe("alur inspeksi kantor", () => {
  beforeEach(() => {
    storeActions.resetMockData();
  });

  test("buat → isi → selesai menghitung skor biner", () => {
    const id = buatDraft();
    isiPenuh(id, "Ya");
    const selesai = storeActions.completeOfficeAssessment({ id: VALIDATOR }, id);
    expect(selesai.ok).toBe(true);
    const item = getState().officeAssessments.find((entry) => entry.id === id);
    expect(item?.status).toBe("Selesai");
    expect(item?.maxScore).toBe(20);
    expect(item?.totalScore).toBe(20);
    expect(item?.percent).toBe(100);
    expect(item?.riskLevel).toBe("Risiko Rendah");
  });

  test("selesai ditolak bila ada item belum dinilai", () => {
    const id = buatDraft();
    const selesai = storeActions.completeOfficeAssessment({ id: VALIDATOR }, id);
    expect(selesai.ok).toBe(false);
  });

  test("pengamatan selesai tidak dapat diubah", () => {
    const id = buatDraft();
    isiPenuh(id, "Ya");
    expect(storeActions.completeOfficeAssessment({ id: VALIDATOR }, id).ok).toBe(true);
    const soal = getState().officeQuestions[0].id;
    const ubah = storeActions.saveOfficeAnswer(
      { id: VALIDATOR },
      { assessmentId: id, questionId: soal, value: "Tidak" },
    );
    expect(ubah.ok).toBe(false);
  });

  test("akun pesantren tidak dapat membuat pengamatan", () => {
    const hasil = storeActions.createOfficeAssessment(
      { id: PESANTREN },
      {
        institutionCode: "PSN-0024",
        unitKerja: "Fakultas Uji",
        manualLocation: "Ruang Uji",
        observedAt: "2026-10-13",
        kind: "Inspeksi Rutin",
        observerName: "Pesantren",
      },
    );
    expect(hasil.ok).toBe(false);
  });

  test("unit kerja dan tanggal wajib valid", () => {
    const tanpaUnit = storeActions.createOfficeAssessment(
      { id: VALIDATOR },
      {
        institutionCode: "PSN-0024",
        unitKerja: "",
        manualLocation: "Ruang Uji",
        observedAt: "2026-10-13",
        kind: "Inspeksi Rutin",
        observerName: "M. Ridwan",
      },
    );
    expect(tanpaUnit.ok).toBe(false);
    const tanggalNgawur = storeActions.createOfficeAssessment(
      { id: VALIDATOR },
      {
        institutionCode: "PSN-0024",
        unitKerja: "Fakultas Uji",
        manualLocation: "Ruang Uji",
        observedAt: "2026-02-30",
        kind: "Inspeksi Rutin",
        observerName: "M. Ridwan",
      },
    );
    expect(tanggalNgawur.ok).toBe(false);
  });

  test("jawaban selain Ya/Tidak ditolak", () => {
    const id = buatDraft();
    const soal = getState().officeQuestions[0].id;
    expect(
      storeActions.saveOfficeAnswer(
        { id: VALIDATOR },
        { assessmentId: id, questionId: soal, value: "Mungkin" },
      ).ok,
    ).toBe(false);
  });

  test("tindak lanjut hanya untuk jawaban Tidak + unik aktif", () => {
    const id = buatDraft();
    isiPenuh(id, "Ya");
    const soal = getState().officeQuestions[0].id;
    const tanpaTemuan = storeActions.createOfficeFollowUp(
      { id: VALIDATOR },
      { assessmentId: id, questionId: soal, pic: "Sarpras", dueDate: "2026-10-20" },
    );
    expect(tanpaTemuan.ok).toBe(false);
    expect(
      storeActions.saveOfficeAnswer(
        { id: VALIDATOR },
        { assessmentId: id, questionId: soal, value: "Tidak", note: "Kabel melintang." },
      ).ok,
    ).toBe(true);
    const pertama = storeActions.createOfficeFollowUp(
      { id: VALIDATOR },
      { assessmentId: id, questionId: soal, pic: "Sarpras", dueDate: "2026-10-20" },
    );
    expect(pertama.ok).toBe(true);
    const ganda = storeActions.createOfficeFollowUp(
      { id: VALIDATOR },
      { assessmentId: id, questionId: soal, pic: "Sarpras", dueDate: "2026-10-21" },
    );
    expect(ganda.ok).toBe(false);
  });

  test("batal tindak lanjut wajib alasan min 10 karakter", () => {
    const id = buatDraft();
    isiPenuh(id, "Tidak");
    const soal = getState().officeQuestions[0].id;
    const buat = storeActions.createOfficeFollowUp(
      { id: VALIDATOR },
      { assessmentId: id, questionId: soal, pic: "Sarpras", dueDate: "2026-10-20" },
    );
    if (!buat.ok || !buat.id) throw new Error(buat.ok ? "tanpa id" : buat.error);
    expect(storeActions.cancelOfficeFollowUp({ id: VALIDATOR }, buat.id, "capek").ok).toBe(false);
    expect(
      storeActions.cancelOfficeFollowUp({ id: VALIDATOR }, buat.id, "Dialihkan ke anggaran tahun depan.").ok,
    ).toBe(true);
  });

  test("review hanya untuk pengamatan Selesai", () => {
    const id = buatDraft();
    expect(storeActions.reviewOfficeAssessment({ id: VALIDATOR }, id, "OK").ok).toBe(false);
    isiPenuh(id, "Ya");
    expect(storeActions.completeOfficeAssessment({ id: VALIDATOR }, id).ok).toBe(true);
    const review = storeActions.reviewOfficeAssessment({ id: VALIDATOR }, id, "Hasil diperiksa.");
    expect(review.ok).toBe(true);
    expect(
      getState().officeAssessments.find((entry) => entry.id === id)?.reviewedBy,
    ).toBeTruthy();
  });

  test("hapus draft Berlangsung menghapus tindak lanjutnya", () => {
    const id = buatDraft();
    isiPenuh(id, "Tidak");
    const soal = getState().officeQuestions[0].id;
    expect(
      storeActions.createOfficeFollowUp(
        { id: VALIDATOR },
        { assessmentId: id, questionId: soal, pic: "Sarpras", dueDate: "2026-10-20" },
      ).ok,
    ).toBe(true);
    expect(storeActions.deleteOfficeDraft({ id: VALIDATOR }, id).ok).toBe(true);
    expect(getState().officeAssessments.some((entry) => entry.id === id)).toBe(false);
    expect(getState().officeFollowUps.some((entry) => entry.assessmentId === id)).toBe(false);
  });
});

describe("bank inspeksi kantor", () => {
  beforeEach(() => {
    storeActions.resetMockData();
  });

  test("tambah kategori lalu tambah soal", () => {
    const kat = storeActions.addOfficeCategory(
      { id: VALIDATOR },
      { name: "F. Keamanan Arsip" },
    );
    expect(kat.ok).toBe(true);
    if (!kat.ok || !kat.id) throw new Error("gagal tambah kategori");
    const soal = storeActions.addOfficeQuestion(
      { id: VALIDATOR },
      { categoryId: kat.id, text: "Lemari arsip terkunci dan diberi label yang jelas." },
    );
    expect(soal.ok).toBe(true);
    if (!soal.ok || !soal.id) throw new Error("gagal tambah soal");
    expect(getState().officeQuestions.some((item) => item.id === soal.id)).toBe(true);
  });

  test("hapus kategori berisi soal ditolak", () => {
    expect(storeActions.deleteOfficeCategory({ id: VALIDATOR }, "KTR-KAT-A").ok).toBe(false);
  });

  test("hapus soal yang sudah dipakai pengamatan ditolak", () => {
    expect(storeActions.deleteOfficeQuestion({ id: VALIDATOR }, "KTR-Q-004").ok).toBe(false);
  });

  test("nonaktifkan soal mengubah maks skor dinamis", () => {
    expect(storeActions.setOfficeQuestionActive({ id: VALIDATOR }, "KTR-Q-001", false).ok).toBe(
      true,
    );
    const id = buatDraft();
    isiPenuh(id, "Ya");
    const item = getState().officeAssessments.find((entry) => entry.id === id);
    expect(item?.maxScore).toBe(19);
    expect(item?.percent).toBe(100);
  });

  test("pesantren tidak dapat mengubah bank", () => {
    expect(
      storeActions.addOfficeCategory({ id: PESANTREN }, { name: "Kategori Siluman" }).ok,
    ).toBe(false);
  });
});
