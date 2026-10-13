// Test helper Inspeksi K3L Perkantoran (D-49): skor biner, temuan, tren.

import { describe, expect, test } from "bun:test";
import {
  OFFICE_CATEGORIES_SEED,
  OFFICE_QUESTIONS_SEED,
  isValidOfficeDate,
  officeActiveQuestions,
  officeCategoryAverages,
  officeCompleted,
  officeCompute,
  officeDuplicateQuestions,
  officeFindings,
  officeMaxScore,
  officeRiskFor,
} from "./office-inspection";
import type { OfficeAnswer, OfficeAssessment } from "./types";

function assessmentDari(
  values: ("Ya" | "Tidak")[],
  status: OfficeAssessment["status"] = "Selesai",
  observedAt = "2026-10-02",
): OfficeAssessment {
  const answers: OfficeAssessment["answers"] = {};
  OFFICE_QUESTIONS_SEED.forEach((item, index) => {
    const value = values[index] ?? "Ya";
    const note = value === "Tidak" ? `Temuan ${item.id}` : "";
    const entry: OfficeAnswer = { value, note };
    answers[item.id] = entry;
  });
  const hitung = officeCompute({ answers }, OFFICE_QUESTIONS_SEED);
  return {
    id: "KTR-TEST",
    institutionCode: "PSN-0024",
    unitKerja: "Fakultas Uji",
    manualLocation: "Ruang Uji",
    observedAt,
    kind: "Inspeksi Rutin",
    observerName: "Validator Uji",
    status,
    answers,
    totalScore: hitung.total,
    maxScore: hitung.max,
    percent: hitung.percent,
    riskLevel: hitung.risk,
    createdAt: `${observedAt}T09:00:00.000Z`,
  };
}

describe("bank inspeksi kantor", () => {
  test("20 soal aktif dalam 5 kategori", () => {
    expect(OFFICE_CATEGORIES_SEED).toHaveLength(5);
    expect(OFFICE_QUESTIONS_SEED).toHaveLength(20);
    expect(officeActiveQuestions(OFFICE_QUESTIONS_SEED)).toHaveLength(20);
    expect(officeMaxScore(OFFICE_QUESTIONS_SEED)).toBe(20);
  });

  test("seed 20 soal tanpa duplikat teks", () => {
    expect(officeDuplicateQuestions(OFFICE_QUESTIONS_SEED).size).toBe(0);
  });
});

describe("skor biner Ya/Tidak", () => {
  test("semua Ya = 20/20 = 100% Risiko Rendah", () => {
    const hitung = officeCompute(
      assessmentDari(Array(20).fill("Ya")),
      OFFICE_QUESTIONS_SEED,
    );
    expect(hitung).toEqual({ total: 20, max: 20, percent: 100, risk: "Risiko Rendah" });
  });

  test("17 Ya 3 Tidak = 85% Risiko Rendah", () => {
    const values = Array<string>(20).fill("Ya");
    values[3] = "Tidak";
    values[11] = "Tidak";
    values[18] = "Tidak";
    const hitung = officeCompute(
      assessmentDari(values as ("Ya" | "Tidak")[]),
      OFFICE_QUESTIONS_SEED,
    );
    expect(hitung.total).toBe(17);
    expect(hitung.percent).toBe(85);
    expect(hitung.risk).toBe("Risiko Rendah");
  });

  test("ambang 80/60 seperti SAM", () => {
    expect(officeRiskFor(80)).toBe("Risiko Rendah");
    expect(officeRiskFor(79.9)).toBe("Risiko Sedang");
    expect(officeRiskFor(60)).toBe("Risiko Sedang");
    expect(officeRiskFor(59.9)).toBe("Risiko Tinggi");
  });

  test("soal nonaktif tidak dihitung", () => {
    const questions = OFFICE_QUESTIONS_SEED.map((item) =>
      item.id === "KTR-Q-001" ? { ...item, isActive: false } : item,
    );
    const hitung = officeCompute(assessmentDari(Array(20).fill("Ya")), questions);
    expect(hitung.max).toBe(19);
    expect(hitung.total).toBe(19);
    expect(hitung.percent).toBe(100);
  });
});

describe("temuan dan tren", () => {
  test("temuan = jawaban Tidak saja", () => {
    const values = Array<string>(20).fill("Ya");
    values[0] = "Tidak";
    values[19] = "Tidak";
    const temuan = officeFindings(
      assessmentDari(values as ("Ya" | "Tidak")[]),
      OFFICE_QUESTIONS_SEED,
    );
    expect(temuan.map((item) => item.question.id)).toEqual(["KTR-Q-001", "KTR-Q-020"]);
  });

  test("completed hanya Selesai urut tanggal", () => {
    const a = assessmentDari(Array(20).fill("Ya"), "Selesai", "2026-10-05");
    const b = assessmentDari(Array(20).fill("Ya"), "Selesai", "2026-10-02");
    const c = assessmentDari(Array(20).fill("Ya"), "Berlangsung", "2026-10-01");
    expect(officeCompleted([a, b, c]).map((item) => item.observedAt)).toEqual([
      "2026-10-02",
      "2026-10-05",
    ]);
  });

  test("rata-rata kategori lintas Selesai", () => {
    const values = Array<string>(20).fill("Ya");
    values[0] = "Tidak";
    const a = assessmentDari(values as ("Ya" | "Tidak")[], "Selesai", "2026-10-02");
    const b = assessmentDari(Array(20).fill("Ya"), "Selesai", "2026-10-03");
    const rata = officeCategoryAverages(
      [a, b],
      OFFICE_CATEGORIES_SEED,
      OFFICE_QUESTIONS_SEED,
    );
    const housekeeping = rata.find((row) => row.category.id === "KTR-KAT-A");
    // A: 4/5 dan 5/5 → rata-rata 90.
    expect(housekeeping?.average).toBe(90);
    expect(housekeeping?.count).toBe(2);
  });
});

describe("validasi tanggal", () => {
  test("tanggal kalender valid", () => {
    expect(isValidOfficeDate("2026-10-13")).toBe(true);
    expect(isValidOfficeDate("2026-02-30")).toBe(false);
    expect(isValidOfficeDate("13-10-2026")).toBe(false);
    expect(isValidOfficeDate("")).toBe(false);
  });
});
