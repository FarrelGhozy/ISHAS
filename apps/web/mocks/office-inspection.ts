// Bank Inspeksi K3L Perkantoran khusus Validator — D-49.
// Kategori + pertanyaan adalah data master (bukan hard-code di komponen).
// Jawaban biner: Ya = sesuai (1), Tidak = temuan (0).
// Skor maksimum dinamis: COUNT(aktif) x 1. Ambang prototipe 80/60.

import type {
  OfficeAnswer,
  OfficeAssessment,
  OfficeCategory,
  OfficeFollowUpStatus,
  OfficeQuestion,
  OfficeRiskLevel,
} from "./types";

export const OFFICE_KINDS = [
  "Inspeksi Rutin",
  "Inspeksi Khusus",
  "Inspeksi Pasca Insiden",
  "Inspeksi Evaluasi",
];

// Nomor referensi formulir sumber (label cetakan, bukan nomor resmi).
export const OFFICE_FORM_REF = "FORM/UNIDA/MUTU-12-11-14";

// D-49.d: tanggal kalender valid `YYYY-MM-DD` (bukan sekadar string terisi).
export function isValidOfficeDate(value: unknown): boolean {
  if (typeof value !== "string") return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [tahun, bulan, tanggal] = value.split("-").map(Number);
  if (bulan < 1 || bulan > 12 || tanggal < 1 || tanggal > 31) return false;
  const kalender = new Date(Date.UTC(tahun, bulan - 1, tanggal));
  return (
    kalender.getUTCFullYear() === tahun &&
    kalender.getUTCMonth() === bulan - 1 &&
    kalender.getUTCDate() === tanggal
  );
}

export function isOfficeAnswerValue(value: unknown): value is "Ya" | "Tidak" {
  return value === "Ya" || value === "Tidak";
}

export const OFFICE_CATEGORIES_SEED: OfficeCategory[] = [
  {
    id: "KTR-KAT-A",
    name: "A. Housekeeping",
    description: "Kebersihan lantai, langit-langit, jalur, kabel, dan kerapian barang.",
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "KTR-KAT-B",
    name: "B. Keselamatan Peralatan",
    description: "Stop kontak, kabel, peralatan listrik, dan panel listrik.",
    sortOrder: 2,
    isActive: true,
  },
  {
    id: "KTR-KAT-C",
    name: "C. Pencegahan Kebakaran",
    description: "Ketersediaan APAR, akses APAR, indikator tekanan, dan jalur evakuasi.",
    sortOrder: 3,
    isActive: true,
  },
  {
    id: "KTR-KAT-D",
    name: "D. Ergonomi dan Lingkungan Kerja",
    description: "Meja kursi, pencahayaan, ventilasi/AC, dan bahaya terpeleset.",
    sortOrder: 4,
    isActive: true,
  },
  {
    id: "KTR-KAT-E",
    name: "E. Kesiapsiagaan Darurat",
    description: "Kotak P3K, kontak darurat, dan tanda jalur evakuasi.",
    sortOrder: 5,
    isActive: true,
  },
];

const q = (
  id: string,
  categoryId: string,
  text: string,
  sortOrder: number,
  panduan = "",
  contohBukti = "",
): OfficeQuestion => ({ id, categoryId, text, panduan, contohBukti, sortOrder, isActive: true });

export const OFFICE_QUESTIONS_SEED: OfficeQuestion[] = [
  q("KTR-Q-001", "KTR-KAT-A", "Lantai bersih, kering, dan tidak licin.", 1),
  q(
    "KTR-Q-002",
    "KTR-KAT-A",
    "Atap/langit-langit ruangan bersih, tidak berjamur, dan tidak berlubang.",
    2,
  ),
  q("KTR-Q-003", "KTR-KAT-A", "Jalur jalan dan koridor bebas hambatan.", 3),
  q(
    "KTR-Q-004",
    "KTR-KAT-A",
    "Kabel listrik tertata rapi dan tidak melintang di jalur jalan.",
    4,
  ),
  q("KTR-Q-005", "KTR-KAT-A", "Barang disimpan rapi dan tidak berpotensi jatuh.", 5),
  q(
    "KTR-Q-006",
    "KTR-KAT-B",
    "Stop kontak tidak digunakan secara berlebihan (overload).",
    1,
  ),
  q("KTR-Q-007", "KTR-KAT-B", "Kabel dan steker tidak rusak atau terkelupas.", 2),
  q(
    "KTR-Q-008",
    "KTR-KAT-B",
    "Peralatan listrik (printer, dispenser, komputer, dll.) dalam kondisi baik.",
    3,
  ),
  q("KTR-Q-009", "KTR-KAT-B", "Panel listrik tertutup dan tidak terhalang barang.", 4),
  q("KTR-Q-010", "KTR-KAT-C", "APAR tersedia pada lokasi yang ditentukan.", 1),
  q("KTR-Q-011", "KTR-KAT-C", "APAR mudah dijangkau dan tidak terhalang.", 2),
  q("KTR-Q-012", "KTR-KAT-C", "Indikator tekanan APAR baik/hijau.", 3),
  q("KTR-Q-013", "KTR-KAT-C", "Jalur evakuasi dan pintu darurat bebas hambatan.", 4),
  q("KTR-Q-014", "KTR-KAT-D", "Kursi dan meja kerja dalam kondisi baik.", 1),
  q("KTR-Q-015", "KTR-KAT-D", "Pencahayaan ruang kerja memadai.", 2),
  q(
    "KTR-Q-016",
    "KTR-KAT-D",
    "Ventilasi atau AC berfungsi dengan baik.",
    3,
    "Ukur suhu ruang dan catat pada kolom suhu.",
    "Foto termometer atau tampilan AC.",
  ),
  q(
    "KTR-Q-017",
    "KTR-KAT-D",
    "Tidak terdapat kondisi yang dapat menyebabkan tersandung atau terpeleset.",
    4,
  ),
  q("KTR-Q-018", "KTR-KAT-E", "Kotak P3K tersedia dan mudah dijangkau.", 1),
  q("KTR-Q-019", "KTR-KAT-E", "Nomor kontak darurat tersedia di area kerja.", 2),
  q("KTR-Q-020", "KTR-KAT-E", "Terdapat tanda jalur evakuasi yang mudah terlihat.", 3),
];

export function officeActiveQuestions(questions: OfficeQuestion[]): OfficeQuestion[] {
  return questions.filter((item) => item.isActive);
}

// Teks yang sama persis (abaikan kapital/tanda baca) antar soal.
// Dipakai sebagai penanda, bukan penghapusan otomatis.
export function officeDuplicateQuestions(questions: OfficeQuestion[]): Map<string, string[]> {
  const normal = (text: string): string =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(Boolean)
      .join(" ");
  const groups = new Map<string, OfficeQuestion[]>();
  for (const item of questions) {
    const key = normal(item.text);
    if (!key) continue;
    const list = groups.get(key) ?? [];
    list.push(item);
    groups.set(key, list);
  }
  const out = new Map<string, string[]>();
  for (const list of groups.values()) {
    if (list.length < 2) continue;
    for (const item of list) {
      out.set(
        item.id,
        list.filter((other) => other.id !== item.id).map((other) => other.id),
      );
    }
  }
  return out;
}

export function officeMaxScore(questions: OfficeQuestion[]): number {
  return officeActiveQuestions(questions).length;
}

export function officeRiskFor(percent: number): OfficeRiskLevel {
  if (percent >= 80) return "Risiko Rendah";
  if (percent >= 60) return "Risiko Sedang";
  return "Risiko Tinggi";
}

// Chip pendek untuk StatusChip existing (Rendah/Sedang/Tinggi).
export function officeRiskChip(risk: OfficeRiskLevel): string {
  if (risk === "Risiko Rendah") return "Rendah";
  if (risk === "Risiko Sedang") return "Sedang";
  return "Tinggi";
}

export function officeScoreOf(answer: OfficeAnswer | undefined): number {
  return answer?.value === "Ya" ? 1 : 0;
}

export function officeCompute(
  assessment: Pick<OfficeAssessment, "answers">,
  questions: OfficeQuestion[],
): { total: number; max: number; percent: number; risk: OfficeRiskLevel } {
  const active = officeActiveQuestions(questions);
  const max = active.length;
  let total = 0;
  for (const item of active) {
    total += officeScoreOf(assessment.answers[item.id]);
  }
  const percent = max > 0 ? Math.round((total / max) * 1000) / 10 : 0;
  return { total, max, percent, risk: officeRiskFor(percent) };
}

// D-49.e: temuan = jawaban Tidak, urut kategori.
export type OfficeFinding = { question: OfficeQuestion; answer: OfficeAnswer };
export function officeFindings(
  assessment: Pick<OfficeAssessment, "answers">,
  questions: OfficeQuestion[],
): OfficeFinding[] {
  const byId = new Map(questions.map((item) => [item.id, item]));
  const out: OfficeFinding[] = [];
  for (const [questionId, answer] of Object.entries(assessment.answers)) {
    const question = byId.get(questionId);
    if (!question || !question.isActive) continue;
    if (answer.value === "Tidak") out.push({ question, answer });
  }
  return out.sort((a, b) => a.question.sortOrder - b.question.sortOrder);
}

// Pengamatan Selesai urut tanggal menaik (sumber grafik tren).
export function officeCompleted(assessments: OfficeAssessment[]): OfficeAssessment[] {
  return assessments
    .filter((item) => item.status === "Selesai")
    .sort((a, b) => a.observedAt.localeCompare(b.observedAt));
}

// Rata-rata persen per kategori lintas pengamatan Selesai.
export function officeCategoryAverages(
  assessments: OfficeAssessment[],
  categories: OfficeCategory[],
  questions: OfficeQuestion[],
): { category: OfficeCategory; average: number | null; count: number }[] {
  const done = officeCompleted(assessments);
  return [...categories]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((category) => {
      const items = questions.filter(
        (item) => item.categoryId === category.id && item.isActive,
      );
      if (items.length === 0 || done.length === 0)
        return { category, average: null, count: 0 };
      let sum = 0;
      let count = 0;
      for (const assessment of done) {
        let total = 0;
        let answered = 0;
        for (const item of items) {
          const answer = assessment.answers[item.id];
          if (answer) {
            total += officeScoreOf(answer);
            answered += 1;
          }
        }
        if (answered > 0) {
          sum += (total / items.length) * 100;
          count += 1;
        }
      }
      return {
        category,
        average: count > 0 ? Math.round((sum / count) * 10) / 10 : null,
        count,
      };
    });
}

export const OFFICE_FOLLOWUP_STATUSES: OfficeFollowUpStatus[] = [
  "Belum ditindaklanjuti",
  "Berjalan",
  "Selesai",
  "Dibatalkan",
];

export function officeCategoryScores(
  assessment: Pick<OfficeAssessment, "answers">,
  categories: OfficeCategory[],
  questions: OfficeQuestion[],
): { category: OfficeCategory; total: number; max: number; percent: number }[] {
  return [...categories]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((category) => {
      const items = questions.filter(
        (item) => item.categoryId === category.id && item.isActive,
      );
      const max = items.length;
      let total = 0;
      for (const item of items) {
        total += officeScoreOf(assessment.answers[item.id]);
      }
      const percent = max > 0 ? Math.round((total / max) * 1000) / 10 : 0;
      return { category, total, max, percent };
    });
}
