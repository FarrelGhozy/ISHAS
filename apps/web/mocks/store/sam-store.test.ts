// Test store SAM-iSAFE fase 2 (D-26.e): alur buat → isi → selesai →
// tindak lanjut → review, plus guard peran dan validasi bukti.

import { beforeEach, describe, expect, test } from "bun:test";
import { getState, storeActions } from "./mock-store";

const VALIDATOR = "USR-002";
const PESANTREN = "USR-003";

function buatDraft() {
  const hasil = storeActions.createSamAssessment(
    { id: VALIDATOR },
    {
      institutionCode: "PSN-0018",
      manualLocation: "Asrama Putra Blok A",
      observedAt: "2026-09-27",
      observedTime: "08:30",
      kind: "Pemeriksaan Rutin",
      observerName: "M. Ridwan",
    },
  );
  if (!hasil.ok) throw new Error(hasil.error);
  return hasil.id as string;
}

function isiPenuh(id: string, skor: 0 | 1 | 2 = 2) {
  const state = getState();
  for (const soal of state.samQuestions.filter((item) => item.isActive)) {
    const hasil = storeActions.saveSamAnswer(
      { id: VALIDATOR },
      { assessmentId: id, questionId: soal.id, score: skor },
    );
    expect(hasil.ok).toBe(true);
  }
}

describe("alur pengamatan SAM-iSAFE", () => {
  beforeEach(() => {
    storeActions.resetMockData();
  });

  test("buat → isi → selesai menghitung skor dinamis", () => {
    const id = buatDraft();
    isiPenuh(id, 2);
    const selesai = storeActions.completeSamAssessment({ id: VALIDATOR }, id);
    expect(selesai.ok).toBe(true);
    const item = getState().samAssessments.find((entry) => entry.id === id);
    expect(item?.status).toBe("Selesai");
    expect(item?.maxScore).toBe(54);
    expect(item?.totalScore).toBe(54);
    expect(item?.percent).toBe(100);
    expect(item?.riskLevel).toBe("Risiko Rendah");
  });

  test("selesai ditolak bila ada pertanyaan belum dinilai", () => {
    const id = buatDraft();
    const selesai = storeActions.completeSamAssessment({ id: VALIDATOR }, id);
    expect(selesai.ok).toBe(false);
  });

  test("pengamatan selesai tidak dapat diubah", () => {
    const id = buatDraft();
    isiPenuh(id, 2);
    expect(storeActions.completeSamAssessment({ id: VALIDATOR }, id).ok).toBe(true);
    const soal = getState().samQuestions[0].id;
    const ubah = storeActions.saveSamAnswer(
      { id: VALIDATOR },
      { assessmentId: id, questionId: soal, score: 0 },
    );
    expect(ubah.ok).toBe(false);
  });

  test("akun pesantren tidak dapat membuat pengamatan", () => {
    const hasil = storeActions.createSamAssessment(
      { id: PESANTREN },
      {
        institutionCode: "PSN-0018",
        manualLocation: "Asrama",
        observedAt: "2026-09-27",
        kind: "Pemeriksaan Rutin",
        observerName: "Pengamat",
      },
    );
    expect(hasil.ok).toBe(false);
  });

  test("bukti tanpa ID sah ditolak", () => {
    const id = buatDraft();
    const soal = getState().samQuestions[0].id;
    const hasil = storeActions.saveSamAnswer(
      { id: VALIDATOR },
      { assessmentId: id, questionId: soal, score: 1, evidenceName: "foto.jpg" },
    );
    expect(hasil.ok).toBe(false);
  });
});

describe("tindak lanjut SAM-iSAFE", () => {
  beforeEach(() => {
    storeActions.resetMockData();
  });

  function selesaiDenganNol(): { id: string; soalNol: string } {
    const id = buatDraft();
    const state = getState();
    const aktif = state.samQuestions.filter((item) => item.isActive);
    for (const soal of aktif) {
      const skor = soal.id === aktif[0].id ? 0 : 2;
      const hasil = storeActions.saveSamAnswer(
        { id: VALIDATOR },
        { assessmentId: id, questionId: soal.id, score: skor as 0 | 1 | 2 },
      );
      expect(hasil.ok).toBe(true);
    }
    expect(storeActions.completeSamAssessment({ id: VALIDATOR }, id).ok).toBe(true);
    return { id, soalNol: aktif[0].id };
  }

  test("buat → berjalan → selesai", () => {
    const { id, soalNol } = selesaiDenganNol();
    const buat = storeActions.createSamFollowUp(
      { id: VALIDATOR },
      { assessmentId: id, questionId: soalNol, pic: "Bagian Sarpras", dueDate: "2026-09-30" },
    );
    if (!buat.ok) throw new Error(buat.error);
    const tindakId = buat.id as string;
    expect(
      storeActions.updateSamFollowUp({ id: VALIDATOR }, tindakId, { status: "Berjalan" }).ok,
    ).toBe(true);
    expect(
      storeActions.updateSamFollowUp({ id: VALIDATOR }, tindakId, { status: "Selesai" }).ok,
    ).toBe(true);
    const tindak = getState().samFollowUps.find((entry) => entry.id === tindakId);
    expect(tindak?.status).toBe("Selesai");
    expect(tindak?.doneAt).toBeTruthy();
  });

  test("temuan ganda pada soal sama ditolak", () => {
    const { id, soalNol } = selesaiDenganNol();
    const input = {
      assessmentId: id,
      questionId: soalNol,
      pic: "Bagian Sarpras",
      dueDate: "2026-09-30",
    };
    expect(storeActions.createSamFollowUp({ id: VALIDATOR }, input).ok).toBe(true);
    expect(storeActions.createSamFollowUp({ id: VALIDATOR }, input).ok).toBe(false);
  });

  test("tindak lanjut hanya untuk skor 0/1", () => {
    const id = buatDraft();
    isiPenuh(id, 2);
    expect(storeActions.completeSamAssessment({ id: VALIDATOR }, id).ok).toBe(true);
    const soal = getState().samQuestions[0].id;
    const hasil = storeActions.createSamFollowUp(
      { id: VALIDATOR },
      { assessmentId: id, questionId: soal, pic: "PIC", dueDate: "2026-09-30" },
    );
    expect(hasil.ok).toBe(false);
  });

  test("batal wajib alasan min 10 karakter", () => {
    const { id, soalNol } = selesaiDenganNol();
    const buat = storeActions.createSamFollowUp(
      { id: VALIDATOR },
      { assessmentId: id, questionId: soalNol, pic: "PIC", dueDate: "2026-09-30" },
    );
    if (!buat.ok) throw new Error(buat.error);
    const tindakId = buat.id as string;
    expect(storeActions.cancelSamFollowUp({ id: VALIDATOR }, tindakId, "kurang").ok).toBe(false);
    expect(
      storeActions.cancelSamFollowUp({ id: VALIDATOR }, tindakId, "Dialihkan ke anggaran tahun depan").ok,
    ).toBe(true);
    expect(getState().samFollowUps.find((entry) => entry.id === tindakId)?.status).toBe(
      "Dibatalkan",
    );
  });
});

describe("review dan draft SAM-iSAFE", () => {
  beforeEach(() => {
    storeActions.resetMockData();
  });

  test("pengamatan selesai dapat ditinjau", () => {
    const id = buatDraft();
    isiPenuh(id, 2);
    expect(storeActions.completeSamAssessment({ id: VALIDATOR }, id).ok).toBe(true);
    const review = storeActions.reviewSamAssessment({ id: VALIDATOR }, id, "Hasil diperiksa.");
    expect(review.ok).toBe(true);
    const item = getState().samAssessments.find((entry) => entry.id === id);
    expect(item?.reviewedBy).toBe("M. Ridwan");
    expect(item?.reviewNote).toBe("Hasil diperiksa.");
  });

  test("draft berlangsung dapat dihapus, selesai tidak", () => {
    const id = buatDraft();
    expect(storeActions.deleteSamDraft({ id: VALIDATOR }, id).ok).toBe(true);
    expect(getState().samAssessments.some((entry) => entry.id === id)).toBe(false);
    const jadi = buatDraft();
    isiPenuh(jadi, 2);
    expect(storeActions.completeSamAssessment({ id: VALIDATOR }, jadi).ok).toBe(true);
    expect(storeActions.deleteSamDraft({ id: VALIDATOR }, jadi).ok).toBe(false);
  });
});
