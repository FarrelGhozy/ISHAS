// Dataset penelitian D-25 — bangun baris whitelist D-02 + parser impor aman.
// Ekspor TIDAK memuat: nama/kontak pelapor mentah sebagai publik, bukti,
// jawaban mentah, alasan tolak, audit mentah. Impor hanya jadi
// `Menunggu validasi` lewat store action (tidak langsung publik).

import type { IshasState } from "./types";

export type ResearchRow = {
  reportId: string;
  institutionCode: string;
  institutionName: string;
  institutionRegistered: boolean;
  channel: string;
  validationStatus: string;
  handlingStatus: string;
  scorePercent: number | null;
  pdfTersedia: boolean;
  validatorPesantren: string;
  validatedAt: string;
  submittedAt: string;
  answerCount: number;
  expectedCount: number;
  checksumCocok: boolean;
  warisan: boolean;
};

export type ValidImportRow = {
  institutionCode: string;
  reporterName: string;
  scorePercent: number | null;
  title: string;
};

export const RESEARCH_IMPORT_MAX = 200;

export const RESEARCH_TEMPLATE_CSV =
  "institutionCode,reporterName,scorePercent,title\n" +
  "PSN-0018,Tim impor dummy,65,Penilaian mandiri K3L (impor)\n";

function jawabanTerisi(snapshot: IshasState["selfAssessmentSnapshots"][number]): number {
  return Object.values(snapshot.answers).filter((a) => Boolean(a?.value)).length;
}

export function buildResearchRows(state: IshasState): ResearchRow[] {
  const registered = new Set(
    state.users
      .filter(
        (u) =>
          u.roleId === "pesantren" && u.status === "Aktif" && u.institutionCodes.length === 1,
      )
      .flatMap((u) => u.institutionCodes),
  );
  const bankCount = (state.instrument?.dimensions ?? []).reduce(
    (n, d) => n + d.indicators.length,
    0,
  );
  return state.reports
    .filter((r) => r.channel === "penilaian-mandiri")
    .map((r) => {
      const snapshot = state.selfAssessmentSnapshots.find((s) => s.reportId === r.id);
      const inst = state.institutions.find((i) => i.code === r.institutionCode);
      const expected = snapshot?.frozenIndicators?.length ?? bankCount;
      const answerCount = snapshot ? jawabanTerisi(snapshot) : 0;
      const checksumCocok = Boolean(
        snapshot?.instrumentChecksum &&
          state.instrument?.checksum &&
          snapshot.instrumentChecksum === state.instrument.checksum,
      );
      return {
        reportId: r.id,
        institutionCode: r.institutionCode,
        institutionName: inst?.name ?? r.institutionCode,
        institutionRegistered:
          (inst?.status === "Aktif" && registered.has(r.institutionCode)) || false,
        channel: r.channel,
        validationStatus: r.validationStatus,
        handlingStatus: r.handlingStatus,
        scorePercent: snapshot?.scorePercent ?? r.scorePercent ?? null,
        pdfTersedia: Boolean(r.pdfGeneratedAt),
        validatorPesantren: r.validatedByName ?? r.validatedBy ?? "—",
        validatedAt: r.validatedAt ?? "—",
        submittedAt: snapshot?.submittedAt ?? r.submittedAt ?? r.createdAt,
        answerCount,
        expectedCount: expected,
        checksumCocok,
        warisan: Boolean(snapshot && !snapshot.frozenIndicators),
      };
    })
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
}

function selCsv(value: string | number | null): string {
  if (value === null || value === undefined) {
    return "";
  }
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function researchToCSV(rows: ResearchRow[]): string {
  const head =
    "reportId,institutionCode,institutionName,validationStatus,handlingStatus," +
    "scorePercent,pdfTersedia,validatorPesantren,validatedAt,submittedAt," +
    "answerCount,expectedCount,checksumCocok";
  const body = rows.map((r) =>
    [
      selCsv(r.reportId),
      selCsv(r.institutionCode),
      selCsv(r.institutionName),
      selCsv(r.validationStatus),
      selCsv(r.handlingStatus),
      r.scorePercent === null ? "" : String(Math.round(r.scorePercent)),
      r.pdfTersedia ? "ya" : "tidak",
      selCsv(r.validatorPesantren),
      selCsv(r.validatedAt),
      selCsv(r.submittedAt),
      String(r.answerCount),
      String(r.expectedCount),
      r.checksumCocok ? "ya" : "tidak",
    ].join(","),
  );
  return [head, ...body].join("\n") + "\n";
}

export function researchToJSON(rows: ResearchRow[]): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      count: rows.length,
      rows,
    },
    null,
    2,
  );
}

function pecahCsv(baris: string): string[] {
  const out: string[] = [];
  let cur = "";
  let kutip = false;
  for (let i = 0; i < baris.length; i += 1) {
    const c = baris[i];
    if (kutip) {
      if (c === '"') {
        if (baris[i + 1] === '"') {
          cur += '"';
          i += 1;
        } else {
          kutip = false;
        }
      } else {
        cur += c;
      }
    } else if (c === '"') {
      kutip = true;
    } else if (c === ",") {
      out.push(cur.trim());
      cur = "";
    } else {
      cur += c;
    }
  }
  out.push(cur.trim());
  return out;
}

export function parseResearchImport(
  text: string,
  registeredCodes: Set<string>,
): { valid: ValidImportRow[]; errors: string[] } {
  const valid: ValidImportRow[] = [];
  const errors: string[] = [];
  const input = text.trim();
  if (!input) {
    return { valid, errors: ["Berkas kosong."] };
  }
  type Mentah = {
    institutionCode?: string;
    reporterName?: string;
    scorePercent?: string | number | null;
    title?: string;
  };
  let mentah: Mentah[] = [];
  if (input.startsWith("[") || input.startsWith("{")) {
    try {
      const parsed: unknown = JSON.parse(input);
      const list = Array.isArray(parsed)
        ? parsed
        : ((parsed as { rows?: unknown } | null)?.rows ?? []);
      if (!Array.isArray(list)) {
        return { valid, errors: ["Format JSON tidak dikenali (butuh array)."] };
      }
      mentah = list as Mentah[];
    } catch {
      return { valid, errors: ["JSON tidak valid."] };
    }
  } else {
    const lines = input.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
      return { valid, errors: ["CSV butuh header + minimal 1 baris data."] };
    }
    const head = pecahCsv(lines[0]).map((h) => h.trim());
    const idx = (nama: string): number => head.indexOf(nama);
    if (idx("institutionCode") === -1) {
      return { valid, errors: ["Header CSV wajib memuat institutionCode."] };
    }
    for (let i = 1; i < lines.length; i += 1) {
      const cols = pecahCsv(lines[i]);
      mentah.push({
        institutionCode: cols[idx("institutionCode")] ?? "",
        reporterName: idx("reporterName") === -1 ? "" : (cols[idx("reporterName")] ?? ""),
        scorePercent: idx("scorePercent") === -1 ? null : (cols[idx("scorePercent")] ?? ""),
        title: idx("title") === -1 ? "" : (cols[idx("title")] ?? ""),
      });
    }
  }
  if (mentah.length > RESEARCH_IMPORT_MAX) {
    errors.push(`Maksimal ${RESEARCH_IMPORT_MAX} baris per impor.`);
    mentah = mentah.slice(0, RESEARCH_IMPORT_MAX);
  }
  mentah.forEach((m, i) => {
    const baris = i + 1;
    const code = String(m.institutionCode ?? "").trim();
    if (!code) {
      errors.push(`Baris ${baris}: institutionCode wajib.`);
      return;
    }
    if (!registeredCodes.has(code)) {
      errors.push(`Baris ${baris}: ${code} bukan pesantren terdaftar.`);
      return;
    }
    const nama = String(m.reporterName ?? "").trim() || "Impor dataset";
    if (nama.length < 2 || nama.length > 100) {
      errors.push(`Baris ${baris}: nama 2–100 karakter.`);
      return;
    }
    let skor: number | null = null;
    const mentahSkor = m.scorePercent;
    if (mentahSkor !== null && mentahSkor !== undefined && String(mentahSkor).trim() !== "") {
      const angka = Number(mentahSkor);
      if (!Number.isFinite(angka) || angka < 0 || angka > 100) {
        errors.push(`Baris ${baris}: scorePercent 0–100.`);
        return;
      }
      skor = Math.round(angka);
    }
    const judul = String(m.title ?? "").trim() || "Penilaian mandiri K3L (impor)";
    if (judul.length > 140) {
      errors.push(`Baris ${baris}: judul maksimal 140 karakter.`);
      return;
    }
    valid.push({ institutionCode: code, reporterName: nama, scorePercent: skor, title: judul });
  });
  return { valid, errors };
}
