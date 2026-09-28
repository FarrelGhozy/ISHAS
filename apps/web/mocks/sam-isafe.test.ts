// Test SAM-iSAFE: maks dinamis + ambang risiko (D-26) + fase 2 (D-26.e).

import { describe, expect, test } from "bun:test";
import {
  SAM_CATEGORIES_SEED,
  SAM_QUESTIONS_SEED,
  samActiveQuestions,
  samCategoryAverages,
  samCompleted,
  samCompute,
  samFindings,
  samMaxScore,
  samRiskFor,
} from "./sam-isafe";
import type { SamAssessment } from "./types";

function demoAssessment(
  id: string,
  observedAt: string,
  scores: (0 | 1 | 2)[],
  status: SamAssessment["status"] = "Selesai",
): SamAssessment {
  const answers: SamAssessment["answers"] = {};
  SAM_QUESTIONS_SEED.forEach((item, index) => {
    answers[item.id] = { score: scores[index] ?? 2, note: "" };
  });
  const hitung = samCompute({ answers }, SAM_QUESTIONS_SEED);
  return {
    id,
    institutionCode: "PSN-0018",
    observedAt,
    kind: "Pemeriksaan Rutin",
    observerName: "Validator",
    status,
    answers,
    totalScore: hitung.total,
    maxScore: hitung.max,
    percent: hitung.percent,
    riskLevel: hitung.risk,
    createdAt: `${observedAt}T08:00:00.000Z`,
  };
}

describe("bank SAM-iSAFE", () => {
  test("seed 27 soal aktif, maks 54", () => {
    expect(samActiveQuestions(SAM_QUESTIONS_SEED)).toHaveLength(27);
    expect(samMaxScore(SAM_QUESTIONS_SEED)).toBe(54);
  });

  test("nonaktif 1 soal menurunkan maks 2 poin", () => {
    const bank = SAM_QUESTIONS_SEED.map((item, index) =>
      index === 0 ? { ...item, isActive: false } : item,
    );
    expect(samMaxScore(bank)).toBe(52);
  });

  test("ambang risiko 80/60", () => {
    expect(samRiskFor(80)).toBe("Risiko Rendah");
    expect(samRiskFor(79.9)).toBe("Risiko Sedang");
    expect(samRiskFor(60)).toBe("Risiko Sedang");
    expect(samRiskFor(59.9)).toBe("Risiko Tinggi");
  });

  test("persen memakai maks dinamis", () => {
    const answers: Record<string, { score: 0 | 1 | 2; note: string }> = {};
    for (const item of SAM_QUESTIONS_SEED) answers[item.id] = { score: 2, note: "" };
    const penuh = samCompute({ answers }, SAM_QUESTIONS_SEED);
    expect(penuh.total).toBe(54);
    expect(penuh.percent).toBe(100);
    expect(penuh.risk).toBe("Risiko Rendah");
  });
});

describe("fase 2 SAM-iSAFE", () => {
  test("temuan hanya skor 0/1, 0 dulu", () => {
    const assessment = demoAssessment(
      "SAM-X",
      "2026-09-01",
      SAM_QUESTIONS_SEED.map((_, index) => (index === 5 ? 0 : index === 0 ? 1 : 2)),
    );
    const temuan = samFindings(assessment, SAM_QUESTIONS_SEED);
    expect(temuan).toHaveLength(2);
    expect(temuan[0].answer.score).toBe(0);
    expect(temuan[0].question.id).toBe("SAM-Q-006");
    expect(temuan[1].answer.score).toBe(1);
  });

  test("selesai semua bernilai 2 tanpa temuan", () => {
    const assessment = demoAssessment("SAM-Y", "2026-09-01", SAM_QUESTIONS_SEED.map(() => 2));
    expect(samFindings(assessment, SAM_QUESTIONS_SEED)).toHaveLength(0);
  });

  test("completed mengabaikan draft dan urut tanggal", () => {
    const a = demoAssessment("SAM-1", "2026-09-20", SAM_QUESTIONS_SEED.map(() => 2));
    const b = demoAssessment("SAM-2", "2026-09-05", SAM_QUESTIONS_SEED.map(() => 2));
    const c = demoAssessment("SAM-3", "2026-09-10", SAM_QUESTIONS_SEED.map(() => 2), "Berlangsung");
    expect(samCompleted([a, b, c]).map((item) => item.id)).toEqual(["SAM-2", "SAM-1"]);
  });

  test("rata-rata kategori lintas pengamatan", () => {
    const a = demoAssessment("SAM-1", "2026-09-05", SAM_QUESTIONS_SEED.map(() => 2));
    const b = demoAssessment("SAM-2", "2026-09-06", SAM_QUESTIONS_SEED.map(() => 0));
    const rata = samCategoryAverages([a, b], SAM_CATEGORIES_SEED, SAM_QUESTIONS_SEED);
    expect(rata).toHaveLength(5);
    for (const row of rata) {
      expect(row.average).toBe(50);
      expect(row.count).toBe(2);
    }
  });

  test("tanpa pengamatan selesai rata-rata null", () => {
    const rata = samCategoryAverages([], SAM_CATEGORIES_SEED, SAM_QUESTIONS_SEED);
    for (const row of rata) expect(row.average).toBeNull();
  });
});
