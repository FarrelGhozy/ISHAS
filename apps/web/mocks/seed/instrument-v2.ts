// Instrumen penilaian mandiri v2 — 6 dimensi / 59 indikator (D-44).
// Sumber soal bank live `INS-LIVE`; dipakai seed demo dan seed inisiasi (empty).
// Aspek tidak diduplikasi: diambil dari `K3_CATEGORIES` (single source of truth).

import { aspectsOfCategory, type K3CategoryId } from "../kategori-k3";
import type { IndicatorAnswer, InstrumentAnswerType, InstrumentVersion } from "../types";

export type InstrumenV2IndicatorSpec = {
  no: number;
  title: string;
  prompt: string;
  type: InstrumentAnswerType;
  aspectId: string;
  evidence?: boolean;
  location?: boolean;
};

export type InstrumenV2DimensionSpec = {
  id: string;
  name: string;
  categoryId: K3CategoryId;
  description: string;
  indicators: InstrumenV2IndicatorSpec[];
};

export const INSTRUMEN_V2_ID = "INS-v2.0";
export const INSTRUMEN_V2_LABEL = "ISHAS v2.0";

export function indikatorId(no: number): string {
  return `IND-K3L-${String(no).padStart(3, "0")}`;
}

const TRIGGER: Record<string, string> = {
  "ya-tidak": "Tidak",
  "kualitas-1-5": "1",
  frekuensi: "Sering",
  keparahan: "Berat",
};

export const INSTRUMEN_V2_SPEC: InstrumenV2DimensionSpec[] = [
  {
    id: "DIM-KES",
    name: "Keselamatan dan Keamanan Gedung & Asrama",
    categoryId: "KAT-KESELAMATAN",
    description:
      "Kelaikan bangunan, keamanan asrama/kampus, dan fasilitas khusus tempat kegiatan.",
    indicators: [
      { no: 1, title: "Kelaikan bangunan", prompt: "Nilai kelaikan struktur dan kondisi bangunan pesantren.", type: "kualitas-1-5", aspectId: "ASP-KES-001", location: true },
      { no: 2, title: "Kondisi tangga", prompt: "Nilai kondisi tangga (kelayakan, pegangan, anti-slip).", type: "kualitas-1-5", aspectId: "ASP-KES-001", location: true },
      { no: 3, title: "Kondisi koridor & jalur sirkulasi", prompt: "Nilai kondisi koridor dan jalur sirkulasi.", type: "kualitas-1-5", aspectId: "ASP-KES-001", location: true },
      { no: 4, title: "Pintu dan akses keluar", prompt: "Apakah pintu dan akses keluar berfungsi serta tidak terhalang?", type: "ya-tidak", aspectId: "ASP-KES-001", location: true },
      { no: 5, title: "Instalasi listrik", prompt: "Nilai keamanan instalasi listrik.", type: "kualitas-1-5", aspectId: "ASP-KES-002", evidence: true, location: true },
      { no: 6, title: "Pencegahan kebakaran", prompt: "Apakah upaya pencegahan kebakaran tersedia dan layak?", type: "ya-tidak", aspectId: "ASP-KES-002", evidence: true, location: true },
      { no: 7, title: "Keamanan asrama", prompt: "Nilai keamanan asrama (akses, pengawasan, kunci).", type: "kualitas-1-5", aspectId: "ASP-KES-003", location: true },
      { no: 8, title: "Keamanan area kampus", prompt: "Nilai keamanan area kampus (pagar, pos, akses).", type: "kualitas-1-5", aspectId: "ASP-KES-003" },
      { no: 9, title: "Keselamatan fasilitas olahraga", prompt: "Nilai keselamatan fasilitas olahraga.", type: "kualitas-1-5", aspectId: "ASP-KES-004", location: true },
      { no: 10, title: "Keselamatan laboratorium/workshop", prompt: "Nilai keselamatan laboratorium/workshop.", type: "kualitas-1-5", aspectId: "ASP-KES-004", evidence: true, location: true },
    ],
  },
  {
    id: "DIM-DARURAT",
    name: "Sistem Tanggap Darurat & Antisipasi Kebencanaan",
    categoryId: "KAT-DARURAT",
    description:
      "Kesiapan jalur evakuasi, sistem peringatan, perlengkapan darurat, serta prosedur kebencanaan.",
    indicators: [
      { no: 11, title: "Jalur evakuasi", prompt: "Apakah jalur evakuasi jelas, bebas hambatan, dan menuju titik aman?", type: "ya-tidak", aspectId: "ASP-DAR-001", location: true },
      { no: 12, title: "Titik kumpul", prompt: "Apakah titik kumpul tersedia dan mudah dijangkau?", type: "ya-tidak", aspectId: "ASP-DAR-001", location: true },
      { no: 13, title: "Rambu keselamatan", prompt: "Apakah rambu keselamatan tersedia, jelas, dan sesuai?", type: "kualitas-1-5", aspectId: "ASP-DAR-001", location: true },
      { no: 14, title: "Sistem alarm darurat", prompt: "Apakah sistem alarm darurat berfungsi?", type: "ya-tidak", aspectId: "ASP-DAR-002", evidence: true },
      { no: 15, title: "APAR", prompt: "Apakah APAR tersedia, layak, dan tidak kedaluwarsa?", type: "ya-tidak", aspectId: "ASP-DAR-002", evidence: true, location: true },
      { no: 16, title: "Kotak P3K", prompt: "Apakah kotak P3K tersedia dan lengkap?", type: "ya-tidak", aspectId: "ASP-DAR-002", location: true },
      { no: 17, title: "Emergency lighting", prompt: "Apakah pencahayaan darurat berfungsi saat listrik padam?", type: "ya-tidak", aspectId: "ASP-DAR-002", location: true },
      { no: 18, title: "Sistem komunikasi darurat", prompt: "Apakah sistem komunikasi darurat tersedia dan berfungsi?", type: "ya-tidak", aspectId: "ASP-DAR-002" },
      { no: 19, title: "Simulasi kebencanaan", prompt: "Seberapa rutin simulasi kebencanaan dilakukan?", type: "frekuensi", aspectId: "ASP-DAR-003", evidence: true },
      { no: 20, title: "SOP/Rencana Tanggap Darurat", prompt: "Apakah SOP/rencana tanggap darurat tersedia dan dipahami?", type: "ya-tidak", aspectId: "ASP-DAR-003", evidence: true },
    ],
  },
  {
    id: "DIM-SEH",
    name: "Kesehatan",
    categoryId: "KAT-KESEHATAN",
    description:
      "Layanan kesehatan, sanitasi personal, dan kualitas lingkungan yang menunjang kesehatan penghuni.",
    indicators: [
      { no: 21, title: "Ruang/fasilitas kesehatan", prompt: "Nilai kelayakan ruang/fasilitas kesehatan.", type: "kualitas-1-5", aspectId: "ASP-SEH-001", location: true },
      { no: 22, title: "Pelayanan kesehatan", prompt: "Nilai ketersediaan dan kualitas pelayanan kesehatan.", type: "kualitas-1-5", aspectId: "ASP-SEH-001" },
      { no: 23, title: "Akses pertolongan medis", prompt: "Nilai kecepatan akses ke pertolongan medis.", type: "kualitas-1-5", aspectId: "ASP-SEH-001" },
      { no: 24, title: "P3K", prompt: "Apakah layanan P3K tersedia dan mudah diakses?", type: "ya-tidak", aspectId: "ASP-SEH-001", location: true },
      { no: 25, title: "Ketersediaan air minum", prompt: "Nilai ketersediaan dan kelayakan air minum.", type: "kualitas-1-5", aspectId: "ASP-SEH-002", evidence: true },
      { no: 26, title: "Sanitasi personal", prompt: "Nilai kebersihan dan ketersediaan sarana sanitasi personal.", type: "kualitas-1-5", aspectId: "ASP-SEH-002" },
      { no: 27, title: "Ventilasi & kualitas udara", prompt: "Nilai ventilasi dan kualitas udara ruangan.", type: "kualitas-1-5", aspectId: "ASP-SEH-003" },
      { no: 28, title: "Pencahayaan", prompt: "Nilai pencahayaan ruangan.", type: "kualitas-1-5", aspectId: "ASP-SEH-003", location: true },
      { no: 29, title: "Pengendalian penyakit", prompt: "Nilai upaya pengendalian penyakit menular.", type: "kualitas-1-5", aspectId: "ASP-SEH-003" },
      { no: 30, title: "Fasilitas kebugaran/olahraga", prompt: "Nilai ketersediaan fasilitas kebugaran/olahraga.", type: "kualitas-1-5", aspectId: "ASP-SEH-003", location: true },
    ],
  },
  {
    id: "DIM-LING",
    name: "Kesehatan Lingkungan",
    categoryId: "KAT-LINGKUNGAN",
    description:
      "Pengelolaan sampah & limbah, air & drainase, sanitasi, pengendalian vektor, dan kebersihan lingkungan.",
    indicators: [
      { no: 31, title: "Pengelolaan sampah", prompt: "Nilai pengelolaan sampah.", type: "kualitas-1-5", aspectId: "ASP-LING-001", location: true },
      { no: 32, title: "Pengelolaan limbah", prompt: "Nilai pengelolaan limbah.", type: "kualitas-1-5", aspectId: "ASP-LING-001", evidence: true, location: true },
      { no: 33, title: "Drainase", prompt: "Nilai kondisi drainase (tidak tersumbat/genangan).", type: "kualitas-1-5", aspectId: "ASP-LING-002", location: true },
      { no: 34, title: "Air bersih", prompt: "Nilai ketersediaan dan kualitas air bersih.", type: "kualitas-1-5", aspectId: "ASP-LING-002", evidence: true },
      { no: 35, title: "Air limbah", prompt: "Nilai pengelolaan air limbah.", type: "kualitas-1-5", aspectId: "ASP-LING-001" },
      { no: 36, title: "Toilet & kamar mandi", prompt: "Nilai kebersihan dan kelayakan toilet & kamar mandi.", type: "kualitas-1-5", aspectId: "ASP-LING-003", location: true },
      { no: 37, title: "Pengendalian vektor", prompt: "Nilai pengendalian vektor (nyamuk, tikus, lalat, kecoa).", type: "kualitas-1-5", aspectId: "ASP-LING-003" },
      { no: 38, title: "Kebersihan lingkungan", prompt: "Nilai kebersihan lingkungan secara umum.", type: "kualitas-1-5", aspectId: "ASP-LING-004" },
      { no: 39, title: "Ruang terbuka hijau", prompt: "Nilai ketersediaan dan kondisi ruang terbuka hijau.", type: "kualitas-1-5", aspectId: "ASP-LING-004", location: true },
      { no: 40, title: "Kualitas lingkungan", prompt: "Nilai kualitas lingkungan secara keseluruhan.", type: "kualitas-1-5", aspectId: "ASP-LING-004" },
    ],
  },
  {
    id: "DIM-PSI",
    name: "Psikososial: Bullying & Kesehatan Mental",
    categoryId: "KAT-PSIKOSOSIAL",
    description:
      "Kebijakan dan penanganan bullying, layanan kesehatan mental, kondisi psikososial, dan perlindungan kelompok rentan.",
    indicators: [
      { no: 41, title: "Kebijakan/peraturan anti-bullying", prompt: "Apakah kebijakan anti-bullying tersedia dan tersosialisasi?", type: "ya-tidak", aspectId: "ASP-PSI-001", evidence: true },
      { no: 42, title: "Mekanisme pelaporan", prompt: "Apakah mekanisme pelaporan bullying mudah diakses?", type: "ya-tidak", aspectId: "ASP-PSI-001" },
      { no: 43, title: "Penanganan kasus bullying", prompt: "Nilai penanganan kasus bullying sesuai prosedur.", type: "kualitas-1-5", aspectId: "ASP-PSI-001" },
      { no: 44, title: "Fasilitas konseling", prompt: "Nilai ketersediaan fasilitas konseling.", type: "kualitas-1-5", aspectId: "ASP-PSI-002", location: true },
      { no: 45, title: "Layanan kesehatan mental", prompt: "Nilai ketersediaan layanan kesehatan mental.", type: "kualitas-1-5", aspectId: "ASP-PSI-002" },
      { no: 46, title: "Program promotif kesehatan mental", prompt: "Seberapa rutin program promotif kesehatan mental dilakukan?", type: "frekuensi", aspectId: "ASP-PSI-002" },
      { no: 47, title: "Kondisi psikososial", prompt: "Nilai kondisi psikososial penghuni.", type: "kualitas-1-5", aspectId: "ASP-PSI-003" },
      { no: 48, title: "Perlindungan kelompok rentan", prompt: "Nilai perlindungan kelompok rentan.", type: "kualitas-1-5", aspectId: "ASP-PSI-003" },
    ],
  },
  {
    id: "DIM-AKSES",
    name: "Fasilitas Disabilitas & Aksesibilitas",
    categoryId: "KAT-AKSESIBILITAS",
    description:
      "Jalur, ruang, fasilitas, dan informasi yang aksesibel bagi penyandang disabilitas.",
    indicators: [
      { no: 49, title: "Jalur aksesibilitas", prompt: "Apakah jalur aksesibilitas tersedia dan bebas hambatan?", type: "ya-tidak", aspectId: "ASP-AKS-001", location: true },
      { no: 50, title: "Toilet aksesibel", prompt: "Apakah toilet aksesibel tersedia dan layak?", type: "ya-tidak", aspectId: "ASP-AKS-002", location: true },
      { no: 51, title: "Tangga & handrail", prompt: "Apakah tangga & handrail memadai untuk aksesibilitas?", type: "ya-tidak", aspectId: "ASP-AKS-001", location: true },
      { no: 52, title: "Lift/platform lift", prompt: "Apakah lift/platform lift tersedia dan berfungsi?", type: "ya-tidak", aspectId: "ASP-AKS-001" },
      { no: 53, title: "Pintu aksesibel", prompt: "Apakah pintu aksesibel (lebar dan mudah dibuka) tersedia?", type: "ya-tidak", aspectId: "ASP-AKS-002", location: true },
      { no: 54, title: "Parkir disabilitas", prompt: "Apakah parkir disabilitas tersedia?", type: "ya-tidak", aspectId: "ASP-AKS-002", location: true },
      { no: 55, title: "Guiding block", prompt: "Apakah guiding block tersedia dan terpasang benar?", type: "ya-tidak", aspectId: "ASP-AKS-001", location: true },
      { no: 56, title: "Signage aksesibilitas", prompt: "Apakah signage aksesibilitas tersedia dan jelas?", type: "ya-tidak", aspectId: "ASP-AKS-003" },
      { no: 57, title: "Aksesibilitas asrama", prompt: "Nilai aksesibilitas asrama bagi penyandang disabilitas.", type: "kualitas-1-5", aspectId: "ASP-AKS-003" },
      { no: 58, title: "Aksesibilitas ruang akademik", prompt: "Nilai aksesibilitas ruang akademik.", type: "kualitas-1-5", aspectId: "ASP-AKS-003" },
      { no: 59, title: "Aksesibilitas informasi", prompt: "Nilai aksesibilitas informasi (teks alternatif, bahasa isyarat, dsb.).", type: "kualitas-1-5", aspectId: "ASP-AKS-003" },
    ],
  },
];

export function hitungJumlahIndikatorV2(): number {
  return INSTRUMEN_V2_SPEC.reduce((total, dim) => total + dim.indicators.length, 0);
}

export function buildInstrumentV2Dimensions(): InstrumentVersion["dimensions"] {
  return INSTRUMEN_V2_SPEC.map((dim) => ({
    id: dim.id,
    name: dim.name,
    categoryId: dim.categoryId,
    description: dim.description,
    aspects: aspectsOfCategory(dim.categoryId),
    indicators: dim.indicators.map((ind) => ({
      id: indikatorId(ind.no),
      code: indikatorId(ind.no),
      title: ind.title,
      prompt: ind.prompt,
      categoryId: dim.categoryId,
      aspectId: ind.aspectId,
      answerType: ind.type,
      required: true,
      evidenceRequired: ind.evidence ?? false,
      locationRequired: ind.location ?? false,
      findingTrigger: TRIGGER[ind.type] ?? "Tidak",
    })),
  }));
}

export type NilaiProfil = "baik" | "sedang" | "buruk";

function pilihNilai(type: InstrumentAnswerType, n: number, profil: NilaiProfil): string {
  if (type === "ya-tidak") {
    if (profil === "baik") return "Ya";
    if (profil === "buruk") return n % 6 === 0 ? "Ya" : "Tidak";
    return n % 2 === 0 ? "Ya" : "Tidak";
  }
  if (type === "frekuensi") {
    if (profil === "baik") return n % 3 === 0 ? "Jarang" : "Tidak pernah";
    if (profil === "buruk") return n % 2 === 0 ? "Selalu" : "Sering";
    return n % 3 === 0 ? "Kadang" : "Jarang";
  }
  if (type === "keparahan") {
    if (profil === "baik") return "Ringan";
    if (profil === "buruk") return n % 2 === 0 ? "Kritis" : "Berat";
    return "Sedang";
  }
  // kualitas-1-5
  if (profil === "baik") return n % 4 === 0 ? "4" : "5";
  if (profil === "buruk") return n % 5 === 0 ? "3" : n % 2 === 0 ? "2" : "1";
  return ["4", "3", "2"][n % 3];
}

// Jawaban untuk seluruh indikator instrumen v2, deterministik per profil.
// `overrides` menambahkan catatan/bukti/lokasi pada indikator tertentu agar demo kaya.
// `defaults` mengisi area/bukti otomatis untuk indikator yang mewajibkannya
// (dipakai draft uji agar lolos validasi kirim).
export function buildSelfAssessmentAnswers(
  dimensions: InstrumentVersion["dimensions"],
  profil: NilaiProfil,
  overrides: Record<string, Partial<IndicatorAnswer>> = {},
  defaults: { areaId?: string; evidenceName?: string } = {},
): Record<string, IndicatorAnswer> {
  const answers: Record<string, IndicatorAnswer> = {};
  let counter = 0;
  for (const dim of dimensions) {
    for (const ind of dim.indicators) {
      counter += 1;
      answers[ind.id] = {
        value: pilihNilai(ind.answerType, counter, profil),
        note: "",
        evidenceName: ind.evidenceRequired ? (defaults.evidenceName ?? "") : "",
        areaId: ind.locationRequired ? (defaults.areaId ?? "") : "",
        planPoint: null,
      };
    }
  }
  for (const [id, patch] of Object.entries(overrides)) {
    if (!answers[id]) continue;
    answers[id] = { ...answers[id], ...patch };
  }
  return answers;
}
