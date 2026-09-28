// Bank SAM-iSAFE khusus Validator — D-26.
// Kategori + pertanyaan adalah data master (bukan hard-code di komponen).
// Skor maksimum dinamis: COUNT(aktif) x 2. Ambang prototipe 80/60.

import type {
  SamAnswer,
  SamAssessment,
  SamCategory,
  SamFollowUpStatus,
  SamQuestion,
  SamRiskLevel,
} from "./types";

export const SAM_KINDS = [
  "Pemeriksaan Rutin",
  "Pemeriksaan Khusus",
  "Pemeriksaan Pasca Insiden",
  "Pemeriksaan Evaluasi",
];

export const SAM_CATEGORIES_SEED: SamCategory[] = [
  {
    id: "SAM-KAT-01",
    name: "Keselamatan Fisik",
    description: "Struktur, listrik, ruang, hunian, dan jalur evakuasi.",
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "SAM-KAT-02",
    name: "Kesehatan & Kebersihan",
    description: "Air bersih, sanitasi, makanan, drainase, dan P3K.",
    sortOrder: 2,
    isActive: true,
  },
  {
    id: "SAM-KAT-03",
    name: "Dukungan Sosial & Tata Kelola",
    description: "Kebijakan, komite, partisipasi, pelaporan, korektif.",
    sortOrder: 3,
    isActive: true,
  },
  {
    id: "SAM-KAT-04",
    name: "Kesiapsiagaan Darurat",
    description: "APAR, alarm, jalur evakuasi, simulasi, rencana darurat.",
    sortOrder: 4,
    isActive: true,
  },
  {
    id: "SAM-KAT-05",
    name: "Perilaku Keselamatan",
    description: "Kepatuhan SOP, tindakan aman, briefing, kerja sama.",
    sortOrder: 5,
    isActive: true,
  },
];

const q = (
  id: string,
  categoryId: string,
  text: string,
  sortOrder: number,
): SamQuestion => ({ id, categoryId, text, sortOrder, isActive: true });

export const SAM_QUESTIONS_SEED: SamQuestion[] = [
  q(
    "SAM-Q-001",
    "SAM-KAT-01",
    "Struktur bangunan dan material bangunan aman serta sesuai untuk digunakan.",
    1,
  ),
  q(
    "SAM-Q-002",
    "SAM-KAT-01",
    "Instalasi listrik, stop kontak, pemutus sirkuit, dan peralatan listrik telah diperiksa dan dalam kondisi aman.",
    2,
  ),
  q(
    "SAM-Q-003",
    "SAM-KAT-01",
    "Ruang kelas dan asrama memiliki pencahayaan, ventilasi, serta penataan furnitur yang memadai dan aman.",
    3,
  ),
  q(
    "SAM-Q-004",
    "SAM-KAT-01",
    "Tingkat hunian asrama, jarak antar tempat tidur, dan tata letak ruangan memungkinkan pergerakan yang aman.",
    4,
  ),
  q(
    "SAM-Q-005",
    "SAM-KAT-01",
    "Koridor, tangga, pintu keluar, dan jalur evakuasi tidak terhalang serta dalam kondisi aman.",
    5,
  ),
  q("SAM-Q-006", "SAM-KAT-02", "Tersedia sumber air bersih dan aman.", 1),
  q(
    "SAM-Q-007",
    "SAM-KAT-02",
    "Toilet, kamar mandi, asrama, dapur, dan ruang makan dalam kondisi bersih dan terawat.",
    2,
  ),
  q(
    "SAM-Q-008",
    "SAM-KAT-02",
    "Penyiapan, penyimpanan, dan penanganan makanan mengikuti prosedur kebersihan dan keamanan pangan.",
    3,
  ),
  q(
    "SAM-Q-009",
    "SAM-KAT-02",
    "Drainase, pembuangan sampah, pemilahan sampah, dan pengendalian hama dikelola dengan baik.",
    4,
  ),
  q(
    "SAM-Q-010",
    "SAM-KAT-02",
    "Pertolongan pertama, pemeriksaan kesehatan, dan prosedur pengendalian infeksi tersedia.",
    5,
  ),
  q(
    "SAM-Q-011",
    "SAM-KAT-03",
    "Kebijakan keselamatan dan kesehatan telah ditetapkan, ditampilkan, dan dikomunikasikan.",
    1,
  ),
  q(
    "SAM-Q-012",
    "SAM-KAT-03",
    "Komite keselamatan, tim tanggap darurat, atau klub keselamatan siswa telah dibentuk dan aktif.",
    2,
  ),
  q(
    "SAM-Q-013",
    "SAM-KAT-03",
    "Siswa dan staf berpartisipasi dalam pengarahan keselamatan, latihan, atau kegiatan identifikasi bahaya.",
    3,
  ),
  q(
    "SAM-Q-014",
    "SAM-KAT-03",
    "Insiden, bahaya, dan kejadian nyaris celaka dilaporkan dan didokumentasikan.",
    4,
  ),
  q(
    "SAM-Q-015",
    "SAM-KAT-03",
    "Tindakan korektif dilakukan terhadap perilaku yang berkaitan dengan keselamatan atau ketidakpatuhan.",
    5,
  ),
  q(
    "SAM-Q-016",
    "SAM-KAT-04",
    "Alat pemadam api tersedia, mudah diakses, sesuai kebutuhan, dan telah diservis.",
    1,
  ),
  q(
    "SAM-Q-017",
    "SAM-KAT-04",
    "Alarm kebakaran, smoke detector, lampu darurat, dan tanda EXIT berfungsi dengan baik.",
    2,
  ),
  q(
    "SAM-Q-018",
    "SAM-KAT-04",
    "Jalur evakuasi, pintu keluar, dan titik kumpul telah ditandai dengan jelas dan mudah diakses.",
    3,
  ),
  q(
    "SAM-Q-019",
    "SAM-KAT-04",
    "Simulasi kebakaran atau latihan evakuasi dilakukan dan dicatat secara berkala.",
    4,
  ),
  q(
    "SAM-Q-020",
    "SAM-KAT-04",
    "Rencana tanggap darurat, tim tanggap darurat, dan nomor kontak darurat telah ditetapkan.",
    5,
  ),
  q(
    "SAM-Q-021",
    "SAM-KAT-05",
    "Siswa dan staf mematuhi SOP, peraturan, dan instruksi keselamatan.",
    1,
  ),
  q(
    "SAM-Q-022",
    "SAM-KAT-05",
    "Tidak terdapat tindakan tidak aman seperti menghalangi pintu keluar, bermain dengan api, atau menggunakan peralatan listrik secara tidak aman.",
    2,
  ),
  q(
    "SAM-Q-023",
    "SAM-KAT-05",
    "Siswa dan staf mengikuti briefing keselamatan, identifikasi bahaya, atau kegiatan keselamatan lainnya.",
    3,
  ),
  q(
    "SAM-Q-024",
    "SAM-KAT-05",
    "Insiden, bahaya, dan kejadian nyaris celaka dicatat serta dikategorikan sesuai tingkat keparahan atau ketidakpatuhan.",
    4,
  ),
  q(
    "SAM-Q-025",
    "SAM-KAT-05",
    "Komite keselamatan, tim tanggap darurat, atau klub keselamatan siswa telah dibentuk dan aktif.",
    5,
  ),
  q(
    "SAM-Q-026",
    "SAM-KAT-05",
    "Pemeriksaan keselamatan, rapat, dan tindak lanjut dilakukan secara berkala.",
    6,
  ),
  q(
    "SAM-Q-027",
    "SAM-KAT-05",
    "Kerja sama dengan organisasi siswa, PBT, kantor kesehatan, kepolisian, atau pihak terkait telah dilakukan.",
    7,
  ),
];

export function samActiveQuestions(questions: SamQuestion[]): SamQuestion[] {
  return questions.filter((item) => item.isActive);
}

export function samMaxScore(questions: SamQuestion[]): number {
  return samActiveQuestions(questions).length * 2;
}

export function samRiskFor(percent: number): SamRiskLevel {
  if (percent >= 80) return "Risiko Rendah";
  if (percent >= 60) return "Risiko Sedang";
  return "Risiko Tinggi";
}

// Chip pendek untuk StatusChip existing (Rendah/Sedang/Tinggi).
export function samRiskChip(risk: SamRiskLevel): string {
  if (risk === "Risiko Rendah") return "Rendah";
  if (risk === "Risiko Sedang") return "Sedang";
  return "Tinggi";
}

export function samCompute(
  assessment: Pick<SamAssessment, "answers">,
  questions: SamQuestion[],
): { total: number; max: number; percent: number; risk: SamRiskLevel } {
  const active = samActiveQuestions(questions);
  const max = active.length * 2;
  let total = 0;
  for (const item of active) {
    const answer = assessment.answers[item.id];
    if (answer) total += answer.score;
  }
  const percent = max > 0 ? Math.round((total / max) * 1000) / 10 : 0;
  return { total, max, percent, risk: samRiskFor(percent) };
}

// D-26.e: temuan = jawaban skor 0/1 (0 dulu), urut kategori.
export type SamFinding = { question: SamQuestion; answer: SamAnswer };
export function samFindings(
  assessment: Pick<SamAssessment, "answers">,
  questions: SamQuestion[],
): SamFinding[] {
  const byId = new Map(questions.map((item) => [item.id, item]));
  const out: SamFinding[] = [];
  for (const [questionId, answer] of Object.entries(assessment.answers)) {
    const question = byId.get(questionId);
    if (!question || !question.isActive) continue;
    if (answer.score === 0 || answer.score === 1) out.push({ question, answer });
  }
  return out.sort(
    (a, b) => a.answer.score - b.answer.score || a.question.sortOrder - b.question.sortOrder,
  );
}

// D-26.e: pengamatan Selesai urut tanggal menaik (sumber grafik tren).
export function samCompleted(assessments: SamAssessment[]): SamAssessment[] {
  return assessments
    .filter((item) => item.status === "Selesai")
    .sort((a, b) => a.observedAt.localeCompare(b.observedAt));
}

// D-26.e: rata-rata persen per kategori lintas pengamatan Selesai.
export function samCategoryAverages(
  assessments: SamAssessment[],
  categories: SamCategory[],
  questions: SamQuestion[],
): { category: SamCategory; average: number | null; count: number }[] {
  const done = samCompleted(assessments);
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
            total += answer.score;
            answered += 1;
          }
        }
        if (answered > 0) {
          sum += (total / (items.length * 2)) * 100;
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

export const SAM_FOLLOWUP_STATUSES: SamFollowUpStatus[] = [
  "Belum ditindaklanjuti",
  "Berjalan",
  "Selesai",
  "Dibatalkan",
];

export function samCategoryScores(
  assessment: Pick<SamAssessment, "answers">,
  categories: SamCategory[],
  questions: SamQuestion[],
): { category: SamCategory; total: number; max: number; percent: number }[] {
  return [...categories]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((category) => {
      const items = questions.filter(
        (item) => item.categoryId === category.id && item.isActive,
      );
      const max = items.length * 2;
      let total = 0;
      for (const item of items) {
        const answer = assessment.answers[item.id];
        if (answer) total += answer.score;
      }
      const percent = max > 0 ? Math.round((total / max) * 1000) / 10 : 0;
      return { category, total, max, percent };
    });
}
