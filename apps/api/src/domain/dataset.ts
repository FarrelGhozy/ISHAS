// Dataset penelitian + audit publikasi (Fase 3, D-25) — port 1:1
// `research-export.ts` + `importResearchDataset` mock. Ekspor memakai whitelist
// D-02; impor hanya menjadi `Menunggu validasi` (tidak langsung publik).

import { BANK_ID } from "../../../web/mocks/instrument-bank";
import {
  buildResearchRows,
  parseResearchImport,
  researchToCSV,
  researchToJSON,
  RESEARCH_IMPORT_MAX,
  type ResearchRow,
  type ValidImportRow,
} from "../../../web/mocks/research-export";
import { selectRegisteredInstitutions } from "../../../web/mocks/store/selectors";
import type {
  FrozenIndicator,
  IshasState,
  Notification,
  Report,
  SelfAssessmentSnapshot,
} from "../../../web/mocks/types";
import type { Actor } from "../router";
import {
  insertAudit,
  insertNotifications,
  insertReport,
  insertSnapshot,
  nextSequence,
  reportIdFrom,
  withTransaction,
} from "../repo/writes";

export type DatasetActionResult = { ok: true; id?: string } | { ok: false; error: string };

const nowIso = (): string => new Date().toISOString();

export type DatasetFilter = {
  institution?: string;
  includeNonRegistered?: boolean;
  status?: string;
  q?: string;
};

export function buildDatasetRows(state: IshasState, filter: DatasetFilter = {}): ResearchRow[] {
  const q = (filter.q ?? "").trim().toLowerCase();
  return buildResearchRows(state).filter((row) => {
    if (filter.institution && filter.institution !== "Semua terdaftar" && filter.institution !== "Semua") {
      if (row.institutionCode !== filter.institution) return false;
    } else if (!filter.includeNonRegistered && !row.institutionRegistered) {
      return false;
    }
    if (filter.status && filter.status !== "Semua" && row.validationStatus !== filter.status) {
      return false;
    }
    if (!q) return true;
    return `${row.reportId} ${row.institutionName} ${row.validatorPesantren}`.toLowerCase().includes(q);
  });
}

export function exportDataset(
  state: IshasState,
  format: string,
): { ok: true; content: string; contentType: string; fileName: string } | { ok: false; error: string } {
  const rows = buildResearchRows(state);
  if (format === "json") {
    return {
      ok: true,
      content: researchToJSON(rows),
      contentType: "application/json; charset=utf-8",
      fileName: "dataset-penelitian.json",
    };
  }
  if (format === "csv" || format === "") {
    return {
      ok: true,
      content: researchToCSV(rows),
      contentType: "text/csv; charset=utf-8",
      fileName: "dataset-penelitian.csv",
    };
  }
  return { ok: false, error: "Format ekspor harus csv atau json." };
}

export function previewDatasetImport(
  state: IshasState,
  text: string,
): { valid: ValidImportRow[]; errors: string[] } {
  const registered = new Set(selectRegisteredInstitutions(state).map((item) => item.code));
  return parseResearchImport(text, registered);
}

function validateImportRows(state: IshasState, rows: ValidImportRow[]): string | null {
  if (!rows.length) return "Tidak ada baris valid untuk diimpor.";
  if (rows.length > RESEARCH_IMPORT_MAX) {
    return `Maksimal ${RESEARCH_IMPORT_MAX} baris per impor.`;
  }
  const registered = new Set(selectRegisteredInstitutions(state).map((item) => item.code));
  for (const [index, row] of rows.entries()) {
    if (!registered.has(row.institutionCode)) {
      return `Baris ${index + 1}: bukan pesantren terdaftar.`;
    }
    const name = row.reporterName.trim();
    if (name.length < 2 || name.length > 100) {
      return `Baris ${index + 1}: nama 2–100 karakter.`;
    }
    if (
      row.scorePercent !== null &&
      (!Number.isFinite(row.scorePercent) || row.scorePercent < 0 || row.scorePercent > 100)
    ) {
      return `Baris ${index + 1}: scorePercent 0–100.`;
    }
  }
  return null;
}

function frozenFromBank(state: IshasState): FrozenIndicator[] {
  return (state.instrument?.dimensions ?? []).flatMap((dimension) =>
    dimension.indicators.map((indicator) => ({
      id: indicator.id,
      code: indicator.code,
      title: indicator.title,
      prompt: indicator.prompt,
      dimensionId: dimension.id,
      dimensionName: dimension.name,
      categoryId: indicator.categoryId,
      aspectId: indicator.aspectId,
      answerType: indicator.answerType,
      weight: indicator.weight ?? 1,
      options: structuredClone(indicator.options),
    })),
  );
}

export async function applyDatasetImport(
  state: IshasState,
  actor: Actor | null,
  rows: ValidImportRow[],
): Promise<DatasetActionResult> {
  const account = actor ? state.users.find((user) => user.id === actor.id) : undefined;
  if (!account || account.status !== "Aktif" || account.roleId !== "validator") {
    return { ok: false, error: "Hanya akun Validator aktif yang dapat mengimpor dataset." };
  }
  const invalid = validateImportRows(state, rows);
  if (invalid) return { ok: false, error: invalid };
  const frozen = frozenFromBank(state);
  const checksum = state.instrument?.checksum;
  let first = "";
  await withTransaction(async (conn) => {
    for (const row of rows) {
      const sequence = await nextSequence(conn, "report");
      const id = reportIdFrom(sequence);
      if (!first) first = id;
      const at = nowIso();
      const report: Report = {
        id,
        channel: "penilaian-mandiri",
        institutionCode: row.institutionCode,
        reporterName: row.reporterName.trim(),
        title: row.title.trim() || "Penilaian mandiri K3L (impor)",
        description: "Baris impor dataset penelitian; langsung terbit (D-32).",
        instrumentVersionId: BANK_ID,
        instrumentChecksum: checksum,
        scorePercent: row.scorePercent,
        pdfGeneratedAt: at,
        validationStatus: "Terbit",
        severity: "Belum ditentukan",
        priority: "Belum ditentukan",
        handlingStatus: "Tidak berlaku",
        createdAt: at,
        submittedAt: at,
        updatedAt: at,
      };
      await insertReport(conn, report);
      await insertSnapshot(conn, {
        reportId: id,
        instrumentVersionId: BANK_ID,
        instrumentChecksum: checksum,
        submittedAt: at,
        answers: {},
        frozenIndicators: frozen,
        scorePercent: row.scorePercent,
        byDimension: {},
      });
      await insertAudit(conn, {
        id: "",
        objectType: "Report",
        objectId: id,
        actorAccountId: account.id,
        actorName: account.name,
        actorRole: "Validator",
        institutionCode: row.institutionCode,
        action: "Mengimpor dataset penelitian",
        at,
      });
      const owners = state.users.filter(
        (user) =>
          user.roleId === "pesantren" &&
          user.status === "Aktif" &&
          user.institutionCodes.includes(row.institutionCode),
      );
      const notifications: Notification[] = owners.map((owner) => ({
        id: "",
        recipientAccountId: owner.id,
        institutionCode: row.institutionCode,
        sourceObjectId: id,
        message: `Penilaian mandiri ${id} telah terbit.`,
        targetUrl: "/pesantren/hasil-penilaian-mandiri",
        at,
        read: false,
      }));
      if (notifications.length) await insertNotifications(conn, notifications);
    }
  });
  return { ok: true, id: first };
}

export type PublicationAuditItem = {
  reportId: string;
  institutionCode: string;
  title: string;
  validationStatus: string;
  scorePercent: number | null;
  pdfGeneratedAt: string | null;
  answered: number;
  expected: number;
  lengkap: boolean;
  terbit: boolean;
  skorAda: boolean;
  pdfAda: boolean;
  checksumCocok: boolean;
  warisan: boolean;
  layak: boolean;
};

// Kriteria layak publik D-25 (port `features/validator/audit-kesiapan.ts`):
// snapshot lengkap + Diterima + skor ada + PDF ada + checksum cocok.
function readinessOf(
  snapshot: SelfAssessmentSnapshot | undefined,
  report: Report,
  bankChecksum: string | undefined,
  bankIndicatorCount: number,
) {
  const expected = snapshot?.frozenIndicators?.length ?? bankIndicatorCount;
  const answered = snapshot
    ? Object.values(snapshot.answers).filter((answer) => Boolean(answer?.value)).length
    : 0;
  const lengkap = Boolean(snapshot && expected > 0 && answered === expected);
  // D-32: penilaian-mandiri `Terbit`; lapor-cepat tidak masuk dataset ini.
  const terbit = report.validationStatus === "Terbit" || report.validationStatus === "Diterima";
  const skor = snapshot?.scorePercent ?? report.scorePercent ?? null;
  const skorAda = skor !== null && skor !== undefined;
  const pdfAda = Boolean(report.pdfGeneratedAt);
  const warisan = Boolean(snapshot && !snapshot.frozenIndicators);
  const checksumCocok = Boolean(
    snapshot?.instrumentChecksum &&
      bankChecksum &&
      snapshot.instrumentChecksum === bankChecksum,
  );
  return {
    answered,
    expected,
    lengkap,
    terbit,
    skorAda,
    pdfAda,
    checksumCocok,
    warisan,
    layak: lengkap && terbit && skorAda && pdfAda && checksumCocok,
  };
}

export function buildPublicationAudit(state: IshasState): PublicationAuditItem[] {
  const bankCount = (state.instrument?.dimensions ?? []).reduce(
    (total, dimension) => total + dimension.indicators.length,
    0,
  );
  return state.reports
    .filter((report) => report.channel === "penilaian-mandiri")
    .map((report) => {
      const snapshot = state.selfAssessmentSnapshots.find((item) => item.reportId === report.id);
      const readiness = readinessOf(snapshot, report, state.instrument?.checksum, bankCount);
      return {
        reportId: report.id,
        institutionCode: report.institutionCode,
        title: report.title,
        validationStatus: report.validationStatus,
        scorePercent: snapshot?.scorePercent ?? report.scorePercent ?? null,
        pdfGeneratedAt: report.pdfGeneratedAt ?? null,
        answered: readiness.answered,
        expected: readiness.expected,
        lengkap: readiness.lengkap,
        terbit: readiness.terbit,
        skorAda: readiness.skorAda,
        pdfAda: readiness.pdfAda,
        checksumCocok: readiness.checksumCocok,
        warisan: readiness.warisan,
        layak: readiness.layak,
      };
    })
    .sort((a, b) => b.reportId.localeCompare(a.reportId));
}
