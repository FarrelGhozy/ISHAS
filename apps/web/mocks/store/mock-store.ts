// Store dummy berversi dengan binding React (useSyncExternalStore).
// Action V2-01 versi konsisten: aturan validasi/scope diperiksa, bukan jalur pintas.
// V2-03: submitPublicReport memvalidasi penuh (panjang field, pesantren terdaftar,
// area milik pesantren) + mengembalikan id + idempotency requestId anti kirim-ganda.

import { useSyncExternalStore } from "react";
import type {
  Area,
  FrozenIndicator,
  IndicatorAnswer,
  Institution,
  InstrumentAnswerType,
  InstrumentDoc,
  InstrumentDocVisibility,
  InstrumentIndicator,
  InstrumentOption,
  Report,
  RiskFinding,
  RiskLevel,
  SelfAssessmentDraft,
  Severity,
  Priority,
  HandlingStatus,
  User,
  Building,
  InstrumentVersion,
  LocationSnapshot,
  CampusPlanVersion,
} from "../types";
import { loadState, resetState, saveState } from "./state";
import { selectRegisteredInstitutions } from "./selectors";
import { K3_ASPECT_MAP, K3_CATEGORY_MAP } from "../kategori-k3";
import type { IshasState } from "../types";
import { snapshotLocation, validateMapLocation } from "../processors/campus-map";
import {
  BANK_ID,
  defaultOptionsForType,
  hitungChecksumInstrument,
  isJawabanTemuan,
  skorLaporanBeku,
} from "../instrument-bank";

type Listener = () => void;

const listeners = new Set<Listener>();
let currentState: IshasState = loadState();

function emit(): void {
  for (const l of listeners) l();
}

function setState(mutate: (draft: IshasState) => void): void {
  const draft = structuredClone(currentState);
  mutate(draft);
  saveState(draft);
  currentState = draft;
  emit();
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getState(): IshasState {
  return currentState;
}

function nowIso(): string {
  return new Date().toISOString();
}

function audit(
  draft: IshasState,
  actor: { id?: string; name: string; role?: string },
  entry: {
    objectType: string;
    objectId: string;
    institutionCode?: string;
    action: string;
    note?: string;
  },
): void {
  draft.auditEvents.unshift({
    id: `AUD-DEMO-${String(draft.auditEvents.length + 1).padStart(3, "0")}`,
    objectType: entry.objectType,
    objectId: entry.objectId,
    actorAccountId: actor.id,
    actorName: actor.name,
    actorRole: actor.role as IshasState["auditEvents"][number]["actorRole"],
    institutionCode: entry.institutionCode,
    action: entry.action,
    at: nowIso(),
    note: entry.note,
  });
}

function notify(
  draft: IshasState,
  entry: {
    recipientAccountId?: string;
    institutionCode?: string;
    sourceObjectId: string;
    message: string;
    targetUrl: string;
  },
): void {
  draft.notifications.unshift({
    id: `NOT-${String(draft.notifications.length + 1).padStart(3, "0")}`,
    recipientAccountId: entry.recipientAccountId,
    institutionCode: entry.institutionCode,
    sourceObjectId: entry.sourceObjectId,
    message: entry.message,
    targetUrl: entry.targetUrl,
    at: nowIso(),
    read: false,
  });
}

export type ActionResult = { ok: true; id?: string } | { ok: false; error: string };

export type ReportActor = { id?: string; name: string; email?: string; role?: string };

// D-24: setiap perubahan bank memperbarui waktu + checksum (draft basi = ulang).
function touchBank(bank: IshasState["instrument"]): void {
  bank.updatedAt = nowIso();
  bank.checksum = hitungChecksumInstrument(bank.dimensions);
}

function findBankIndicator(
  state: IshasState,
  id: string,
): { dimensionId: string; indicator: InstrumentIndicator } | null {
  for (const dim of state.instrument.dimensions) {
    const indicator = dim.indicators.find((i) => i.id === id);
    if (indicator) return { dimensionId: dim.id, indicator };
  }
  return null;
}

// Idempotency kirim-ganda (V2-03): requestId yang sama mengembalikan id yang sama
// tanpa membuat record kedua. Disimpan di memori (sesi halaman); draft dibersihkan
// setelah sukses sehingga kiriman baru selalu memakai requestId baru.
const seenReportRequests = new Map<string, string>();

export const storeActions = {
  publishCampusPlan(
    actor: { id?: string },
    input: Pick<CampusPlanVersion, "institutionCode" | "assetId" | "width" | "height"> & {
      expectedActiveId?: string;
      acknowledged: boolean;
    },
  ): ActionResult {
    const account = currentState.users.find((user) => user.id === actor.id);
    const institution = currentState.institutions.find(
      (item) => item.code === input.institutionCode,
    );
    if (
      !account ||
      account.status !== "Aktif" ||
      account.roleId !== "pesantren" ||
      account.institutionCodes.length !== 1 ||
      account.institutionCodes[0] !== input.institutionCode ||
      !institution
    )
      return { ok: false, error: "Anda tidak berwenang mengganti denah pesantren ini." };
    if (!input.acknowledged)
      return { ok: false, error: "Konfirmasi dampak perubahan denah terlebih dahulu." };
    if (institution.activeCampusPlanVersionId !== input.expectedActiveId)
      return {
        ok: false,
        error: "Denah aktif berubah. Muat ulang dan periksa versi terbaru sebelum mengganti.",
      };
    if (
      !input.assetId.startsWith("campus-asset-") ||
      currentState.campusPlans.some((plan) => plan.assetId === input.assetId) ||
      !Number.isSafeInteger(input.width) ||
      !Number.isSafeInteger(input.height) ||
      Math.min(input.width, input.height) < 800
    )
      return {
        ok: false,
        error: "Aset atau ukuran denah tidak sah; sisi pendek minimal 800 piksel.",
      };
    let id = "";
    try {
      setState((draft) => {
        const revision =
          Math.max(
            0,
            ...draft.campusPlans
              .filter((plan) => plan.institutionCode === input.institutionCode)
              .map((plan) => plan.revision),
          ) + 1;
        id = `CAMPUS-${input.institutionCode}-v${revision}`;
        draft.campusPlans.push({
          id,
          institutionCode: input.institutionCode,
          revision,
          assetId: input.assetId,
          width: input.width,
          height: input.height,
          uploadedBy: account.id,
          uploadedAt: nowIso(),
          illustration: false,
        });
        draft.institutions.find(
          (item) => item.code === input.institutionCode,
        )!.activeCampusPlanVersionId = id;
        audit(draft, account, {
          objectType: "CampusPlan",
          objectId: id,
          institutionCode: input.institutionCode,
          action: "Menerbitkan denah pesantren",
          note: `Versi ${revision}; titik lama tetap di versi asal.`,
        });
      });
      return { ok: true, id };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Denah belum tersimpan.",
      };
    }
  },
  resetMockData(): IshasState {
    seenReportRequests.clear();
    currentState = resetState();
    emit();
    return currentState;
  },

  submitPublicReport(
    actor: ReportActor,
    input: {
      institutionCode: string;
      reporterName: string;
      title: string;
      description: string;
      areaId?: string;
      manualLocation?: string;
      categoryId?: string;
      aspectId?: string;
      reporterSeverity?: string;
      reporterPriority?: string;
      evidenceName?: string;
      evidenceAssetId?: string;
      contact?: string;
      clientRequestId?: string;
      locationSnapshot?: LocationSnapshot;
    },
  ): ActionResult {
    // Recheck the account at the data boundary, including direct adapter calls.
    if (actor.id) {
      const account = currentState.users.find((u) => u.id === actor.id);
      if (!account || account.status !== "Aktif" || account.roleId !== "pesantren") {
        return {
          ok: false,
          error:
            "Hanya publik tanpa login dan Pesantren aktif yang dapat mengirim laporan.",
        };
      }
      actor = { id: account.id, name: account.name, email: account.email, role: account.role };
    } else if (actor.role && actor.role !== "Publik" && actor.role !== "Publik / Pelapor") {
      return { ok: false, error: "Keluar dari akun untuk melapor sebagai publik." };
    }
    // Idempotency: kirim ulang dengan requestId sama → kembalikan id lama.
    const requestKey = input.clientRequestId?.trim() || undefined;
    if (requestKey && seenReportRequests.has(requestKey)) {
      const existingId = seenReportRequests.get(requestKey)!;
      if (currentState.reports.some((r) => r.id === existingId)) {
        return { ok: true, id: existingId };
      }
      seenReportRequests.delete(requestKey);
    }

    // Validasi ketat (FLOWS §2; pesan selaras dengan error inline form):
    const reporterName = input.reporterName?.trim() ?? "";
    const title = input.title?.trim() ?? "";
    const description = input.description?.trim() ?? "";
    const contact = input.contact?.trim() ?? "";
    const evidenceName = input.evidenceName?.trim() || undefined;
    if (
      input.evidenceAssetId &&
      (!/^evidence-asset-[0-9a-f-]{36}$/.test(input.evidenceAssetId) ||
        !evidenceName ||
        evidenceName.length > 200)
    )
      return { ok: false, error: "Lampiran bukti tidak sah. Pilih gambar kembali." };
    if (reporterName.length < 2) {
      return { ok: false, error: "Nama minimal 2 karakter." };
    }
    if (reporterName.length > 100) {
      return { ok: false, error: "Nama maksimal 100 karakter." };
    }
    const registeredCodes = new Set(selectRegisteredInstitutions(currentState).map((i) => i.code));
    if (!input.institutionCode || !registeredCodes.has(input.institutionCode)) {
      return { ok: false, error: "Pesantren tidak tersedia untuk pelaporan." };
    }
    const ownedAreas = currentState.areas.filter(
      (a) => a.institutionCode === input.institutionCode,
    );
    const manualLocation = input.manualLocation?.trim() || undefined;
    if (!input.areaId && (!manualLocation || manualLocation.length < 3)) {
      return { ok: false, error: "Pilih area atau tulis lokasi secara manual." };
    }
    if (input.areaId && !ownedAreas.some((a) => a.id === input.areaId)) {
      return { ok: false, error: "Lokasi/area tidak sah untuk pesantren ini." };
    }
    // D-19/D-24: lapor-cepat baru tanpa indikator; cascading kategori → aspek
    // dicek di bank live; tanpa pilihan tetap sah.
    const bankDims = currentState.instrument?.dimensions ?? [];
    const legacyDims =
      currentState.instrumentVersions.find(
        (v) => v.id === currentState.activeInstrumentVersionId && v.status === "Published",
      )?.dimensions ?? [];
    const refDims = bankDims.length ? bankDims : legacyDims;
    const categoryId = input.categoryId?.trim() || undefined;
    const aspectId = input.aspectId?.trim() || undefined;
    if (aspectId && !categoryId) return { ok: false, error: "Pilih kategori terlebih dahulu." };
    if (
      categoryId &&
      refDims.length &&
      !refDims.some((d) => (d.categoryId ?? d.id) === categoryId)
    ) {
      return { ok: false, error: "Kategori tidak dikenal." };
    }
    if (aspectId && refDims.length) {
      const dim = refDims.find((d) => (d.categoryId ?? d.id) === categoryId);
      if (!dim || !(dim.aspects ?? []).some((a) => a.id === aspectId)) {
        return { ok: false, error: "Kategori/aspek tidak konsisten." };
      }
    }
    // D-19: usulan mandiri opsional; nilai tak dikenal ditolak agar konsisten.
    const levels = ["Belum ditentukan", "Tinggi", "Sedang", "Rendah"];
    const reporterSeverity = input.reporterSeverity?.trim() || "Belum ditentukan";
    const reporterPriority = input.reporterPriority?.trim() || "Belum ditentukan";
    if (!levels.includes(reporterSeverity)) {
      return { ok: false, error: "Usulan tingkat keparahan tidak dikenal." };
    }
    if (!levels.includes(reporterPriority)) {
      return { ok: false, error: "Usulan prioritas perbaikan tidak dikenal." };
    }
    const mapError = validateMapLocation(
      currentState,
      input.institutionCode,
      input.locationSnapshot,
    );
    if (mapError) return { ok: false, error: mapError };
    if (title.length < 10) {
      return { ok: false, error: "Judul minimal 10 karakter." };
    }
    if (title.length > 140) {
      return { ok: false, error: "Judul maksimal 140 karakter." };
    }
    if (description.length < 20) {
      return { ok: false, error: "Deskripsi minimal 20 karakter." };
    }
    if (contact.length > 100) {
      return { ok: false, error: "Kontak maksimal 100 karakter." };
    }

    let createdId = "";
    try {
      setState((draft) => {
        const n = draft.counters.report;
        draft.counters.report = n + 1;
        const id = `RPT-${String(n).padStart(4, "0")}`;
        createdId = id;
        const stampedAt = nowIso();
        draft.reports.push({
          id,
          channel: "lapor-cepat",
          institutionCode: input.institutionCode,
          reporterName,
          reporterUserId: actor.id,
          reporterAccountEmail: actor.email ?? undefined,
          categoryId: categoryId as Report["categoryId"],
          aspectId,
          reporterSeverity: reporterSeverity as Report["reporterSeverity"],
          reporterPriority: reporterPriority as Report["reporterPriority"],
          title,
          description,
          areaId: input.areaId,
          manualLocation,
          locationSnapshot: snapshotLocation(
            draft,
            input.institutionCode,
            input.areaId,
            manualLocation,
            input.locationSnapshot,
          ),
          evidenceName,
          evidenceAssetId: input.evidenceAssetId,
          contact: contact || undefined,
          validationStatus: "Menunggu validasi",
          severity: "Belum ditentukan",
          priority: "Belum ditentukan",
          handlingStatus: "Menunggu validasi",
          createdAt: stampedAt,
          submittedAt: stampedAt,
          updatedAt: stampedAt,
        });
        audit(draft, actor, {
          objectType: "Report",
          objectId: id,
          institutionCode: input.institutionCode,
          action: "Mengirim laporan publik",
        });
        notifyOwners(draft, input.institutionCode, id);
      });
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Laporan belum dapat disimpan. Coba lagi.",
      };
    }
    if (requestKey) {
      seenReportRequests.set(requestKey, createdId);
      if (seenReportRequests.size > 500) {
        const oldest = seenReportRequests.keys().next().value;
        if (oldest) seenReportRequests.delete(oldest);
      }
    }
    return { ok: true, id: createdId };
  },

  acceptReport(
    actor: { id?: string; name: string; role?: string },
    reportId: string,
    severity: Severity,
    priority: Priority,
    note?: string,
  ): ActionResult {
    if (
      !severity ||
      !priority ||
      severity === "Belum ditentukan" ||
      priority === "Belum ditentukan"
    ) {
      return { ok: false, error: "Severity dan priority wajib dipilih tanpa default." };
    }
    return setStateReport(actor, reportId, (draft, report) => {
      if (report.validationStatus !== "Menunggu validasi") {
        return { ok: false, error: "Hanya laporan Menunggu validasi yang dapat diterima." };
      }
      report.validationStatus = "Diterima";
      report.handlingStatus = "Pending";
      report.severity = severity;
      report.priority = priority;
      report.validatedBy = actor.id;
      report.validatedByName = actor.name;
      report.validatedByRole = actor.role;
      report.validatedAt = nowIso();
      report.updatedAt = report.validatedAt;
      report.validationNote = note;
      // Bentuk kandidat temuan/rekomendasi turunan agar kiriman yang diterima
      // langsung mengalir ke peta/rekomendasi (aturan ilustratif, bukan final).
      ensureDerivedWork(draft, report, severity, priority);
      audit(draft, actor, {
        objectType: "Report",
        objectId: reportId,
        institutionCode: report.institutionCode,
        action: "Memvalidasi laporan",
      });
      return { ok: true };
    });
  },

  rejectReport(
    actor: { id?: string; name: string; role?: string },
    reportId: string,
    reason: string,
  ): ActionResult {
    if (!reason || reason.trim().length < 10) {
      return { ok: false, error: "Alasan penolakan minimal 10 karakter." };
    }
    return setStateReport(actor, reportId, (draft, report) => {
      if (report.validationStatus !== "Menunggu validasi") {
        return { ok: false, error: "Hanya laporan Menunggu validasi yang dapat ditolak." };
      }
      report.validationStatus = "Ditolak";
      report.handlingStatus = "Ditolak";
      report.rejectionReason = reason.trim();
      report.validatedBy = actor.id;
      report.validatedByName = actor.name;
      report.validatedByRole = actor.role;
      report.validatedAt = nowIso();
      report.updatedAt = report.validatedAt;
      audit(draft, actor, {
        objectType: "Report",
        objectId: reportId,
        institutionCode: report.institutionCode,
        action: "Menolak laporan",
        note: reason.trim(),
      });
      return { ok: true };
    });
  },

  updateHandlingStatus(
    actor: { id?: string; name: string; role?: string },
    reportId: string,
    next: HandlingStatus,
    details?: {
      owner?: string;
      dueDate?: string;
      progress?: number;
      evidenceName?: string;
      note?: string;
    },
  ): ActionResult {
    return setStateReport(actor, reportId, (draft, report) => {
      const previous = report.handlingStatus;
      const valid: Record<HandlingStatus, HandlingStatus[]> = {
        "Menunggu validasi": [],
        Pending: ["Proses"],
        Proses: ["Completed", "Pending"],
        Completed: ["Proses"],
        Ditolak: [],
      };
      if (!valid[previous].includes(next)) {
        return { ok: false, error: `Transisi ${report.handlingStatus} → ${next} tidak sah.` };
      }
      if (next === "Proses" && previous === "Pending") {
        if (
          !details?.owner ||
          details.owner.trim().length < 2 ||
          !details?.dueDate ||
          !details?.note?.trim()
        ) {
          return {
            ok: false,
            error: "PIC, tenggat, dan catatan rencana wajib diisi untuk memulai penanganan.",
          };
        }
        if (details.dueDate < nowIso().slice(0, 10)) {
          return { ok: false, error: "Tenggat tidak boleh berada di masa lalu." };
        }
        draft.recommendations
          .filter((recommendation) => recommendation.reportId === reportId)
          .forEach((recommendation) => {
            recommendation.owner = details.owner!.trim();
            recommendation.dueDate = details.dueDate!;
            recommendation.status = "Berjalan";
            recommendation.lastNote = details.note!.trim();
          });
      }
      if (next === "Completed") {
        const related = draft.findings.filter((finding) => finding.reportId === reportId);
        if (related.some((finding) => finding.status !== "Terverifikasi")) {
          return { ok: false, error: "Seluruh temuan harus selesai sebelum laporan Completed." };
        }
        if (details?.progress !== 100 || !details.evidenceName?.trim() || !details.note?.trim()) {
          return {
            ok: false,
            error: "Progres 100%, bukti penyelesaian, dan catatan penutup wajib diisi.",
          };
        }
        draft.recommendations
          .filter((recommendation) => recommendation.reportId === reportId)
          .forEach((recommendation) => {
            recommendation.status = "Terverifikasi";
            recommendation.progress = 100;
            recommendation.completionEvidence = details.evidenceName!.trim();
            recommendation.lastNote = details.note!.trim();
          });
      }
      if (
        (previous === "Proses" && next === "Pending") ||
        (previous === "Completed" && next === "Proses")
      ) {
        if (!details?.note || details.note.trim().length < 10) {
          return { ok: false, error: "Alasan pengembalian status minimal 10 karakter." };
        }
      }
      report.handlingStatus = next;
      report.updatedAt = nowIso();
      audit(draft, actor, {
        objectType: "Report",
        objectId: reportId,
        institutionCode: report.institutionCode,
        action:
          (next === "Pending" && previous === "Proses") ||
          (next === "Proses" && previous === "Completed")
            ? "Mengembalikan status"
            : "Mengubah status penanganan",
        note: `${details?.note ? `${details.note} · ` : ""}→ ${next}`,
      });
      return { ok: true };
    });
  },

  // Alias D-07: nama menyesatkan lama. Gunakan archiveCompletedReport.
  deleteCompletedReport(
    actor: { id?: string; name: string; role?: string },
    reportId: string,
    reason: string,
  ): ActionResult {
    if (
      typeof console !== "undefined" &&
      typeof process !== "undefined" &&
      process.env?.NODE_ENV !== "production"
    ) {
      console.warn(
        "[ISHAS] deleteCompletedReport usang — pakai archiveCompletedReport (D-07: arsip, bukan hapus).",
      );
    }
    return storeActions.archiveCompletedReport(actor, reportId, reason);
  },

  archiveCompletedReport(
    actor: { id?: string; name: string; role?: string },
    reportId: string,
    reason: string,
  ): ActionResult {
    if (!reason || reason.trim().length < 5) {
      return { ok: false, error: "Alasan arsip minimal 5 karakter." };
    }
    return setStateReport(actor, reportId, (draft, report) => {
      const prepared = archiveCompletedDraft(report, reason);
      if (!prepared.ok) return prepared;
      audit(draft, actor, {
        objectType: "Report",
        objectId: reportId,
        institutionCode: report.institutionCode,
        action: "Mengarsipkan laporan selesai",
        note: reason.trim(),
      });
      return { ok: true };
    });
  },

  // D-23.c: jalur legacy. Tetap berfungsi agar test lama hijau; jalur utama
  // verifikasi adalah updateRecommendation(verify:true).
  verifyFinding(
    actor: { id?: string; name: string; role?: string },
    findingId: string,
    note: string,
  ): ActionResult {
    if (
      typeof console !== "undefined" &&
      typeof process !== "undefined" &&
      process.env?.NODE_ENV !== "production"
    ) {
      console.warn(
        "[ISHAS] verifyFinding usang — pakai updateRecommendation(verify:true) (D-23.c).",
      );
    }
    if (!note.trim()) return { ok: false, error: "Catatan verifikasi wajib diisi." };
    const finding = currentState.findings.find((item) => item.id === findingId);
    if (!finding) return { ok: false, error: "Temuan tidak ditemukan." };
    return setStateReport(actor, finding.reportId, (draft, report) => {
      if (report.handlingStatus !== "Proses") {
        return { ok: false, error: "Temuan hanya dapat diverifikasi saat laporan Proses." };
      }
      const target = draft.findings.find((item) => item.id === findingId);
      if (!target) return { ok: false, error: "Temuan tidak ditemukan." };
      target.status = "Terverifikasi";
      const recommendation = draft.recommendations.find(
        (item) => item.id === target.recommendationId,
      );
      if (recommendation) {
        recommendation.status = "Menunggu verifikasi";
        recommendation.lastNote = note.trim();
      }
      audit(draft, actor, {
        objectType: "RiskFinding",
        objectId: findingId,
        institutionCode: report.institutionCode,
        action: "Memverifikasi temuan selesai",
        note: note.trim(),
      });
      return { ok: true };
    });
  },

  // D-23.b: ubah tingkat risiko per temuan (termasuk Ekstrem) secara eksplisit.
  // Severity laporan tetap Tinggi/Sedang/Rendah; tanpa rumus turunan otomatis.
  setFindingLevel(
    actor: { id?: string; name: string; role?: string },
    findingId: string,
    level: RiskLevel,
  ): ActionResult {
    const allowed: RiskLevel[] = ["Rendah", "Sedang", "Tinggi", "Ekstrem"];
    if (!allowed.includes(level)) return { ok: false, error: "Tingkat risiko tidak dikenal." };
    const finding = currentState.findings.find((item) => item.id === findingId);
    if (!finding) return { ok: false, error: "Temuan tidak ditemukan." };
    return setStateReport(actor, finding.reportId, (draft, report) => {
      if (report.validationStatus !== "Diterima" || report.archivedAt) {
        return {
          ok: false,
          error: "Tingkat risiko hanya untuk temuan laporan Diterima yang belum diarsipkan.",
        };
      }
      const target = draft.findings.find((item) => item.id === findingId);
      if (!target) return { ok: false, error: "Temuan tidak ditemukan." };
      target.level = level;
      target.severityText = level;
      audit(draft, actor, {
        objectType: "RiskFinding",
        objectId: findingId,
        institutionCode: report.institutionCode,
        action: "Mengubah tingkat risiko temuan",
        note: level,
      });
      return { ok: true };
    });
  },

  addBuilding(
    actor: { id?: string; name: string; role?: string },
    input: { code: string; name: string },
  ): ActionResult {
    const account = currentState.users.find((item) => item.id === actor.id);
    if (
      !account ||
      account.status !== "Aktif" ||
      account.roleId !== "pesantren" ||
      account.institutionCodes.length !== 1
    )
      return { ok: false, error: "Hanya Pesantren aktif yang dapat mengelola lokasi." };
    const code = input.code.trim().toUpperCase();
    const name = input.name.trim();
    if (code.length < 2 || name.length < 2)
      return { ok: false, error: "Kode dan nama gedung minimal 2 karakter." };
    if (
      currentState.buildings.some(
        (item) => item.institutionCode === account.institutionCodes[0] && item.code === code,
      )
    )
      return { ok: false, error: "Kode gedung sudah digunakan." };
    let id = "";
    setState((draft) => {
      id = `BLD-${String(draft.buildings.length + 1).padStart(3, "0")}`;
      const building: Building = {
        id,
        institutionCode: account.institutionCodes[0],
        code,
        name,
        floors: [
          {
            id: `FLR-${String(draft.buildings.length + 1).padStart(3, "0")}-1`,
            name: "Lantai 1",
            planFile: "",
            planVersion: "",
            uploadedBy: actor.id ?? "",
            uploadedAt: nowIso(),
          },
        ],
      };
      draft.buildings.push(building);
      audit(draft, actor, {
        objectType: "Building",
        objectId: id,
        institutionCode: building.institutionCode,
        action: "Menambah gedung",
        note: name,
      });
    });
    return { ok: true, id };
  },

  addArea(
    actor: { id?: string; name: string; role?: string },
    input: { buildingId: string; floor: string; name: string; zone: string },
  ): ActionResult {
    const account = currentState.users.find((item) => item.id === actor.id);
    const building = currentState.buildings.find((item) => item.id === input.buildingId);
    if (
      !account ||
      account.status !== "Aktif" ||
      account.roleId !== "pesantren" ||
      !building ||
      !account.institutionCodes.includes(building.institutionCode)
    )
      return { ok: false, error: "Anda tidak berwenang mengelola area ini." };
    if (!input.floor.trim() || input.name.trim().length < 2 || input.zone.trim().length < 2)
      return { ok: false, error: "Lantai, nama area, dan zona wajib diisi." };
    let id = "";
    setState((draft) => {
      id = `AREA-${String(draft.areas.length + 1).padStart(3, "0")}`;
      const area: Area = {
        id,
        institutionCode: building.institutionCode,
        buildingId: building.id,
        floor: input.floor.trim(),
        name: input.name.trim(),
        zone: input.zone.trim(),
        x: 50,
        y: 50,
        width: 14,
        height: 10,
      };
      draft.areas.push(area);
      audit(draft, actor, {
        objectType: "Area",
        objectId: id,
        institutionCode: area.institutionCode,
        action: "Menambah area",
        note: `${area.floor} · ${area.name}`,
      });
    });
    return { ok: true, id };
  },

  addFloor(
    actor: { id?: string; name: string; role?: string },
    buildingId: string,
    name: string,
  ): ActionResult {
    const account = currentState.users.find((item) => item.id === actor.id);
    const building = currentState.buildings.find((item) => item.id === buildingId);
    if (
      !account ||
      account.status !== "Aktif" ||
      account.roleId !== "pesantren" ||
      !building ||
      !account.institutionCodes.includes(building.institutionCode)
    )
      return { ok: false, error: "Anda tidak berwenang mengelola lantai ini." };
    const floorName = name.trim();
    if (floorName.length < 2) return { ok: false, error: "Nama lantai minimal 2 karakter." };
    if (building.floors.some((item) => item.name.toLowerCase() === floorName.toLowerCase()))
      return { ok: false, error: "Nama lantai sudah ada pada gedung ini." };
    let id = "";
    setState((draft) => {
      const target = draft.buildings.find((item) => item.id === buildingId)!;
      id = `FLR-${String(draft.buildings.flatMap((item) => item.floors).length + 1).padStart(3, "0")}`;
      target.floors.push({
        id,
        name: floorName,
        planFile: "",
        planVersion: "",
        uploadedBy: "",
        uploadedAt: "",
      });
      audit(draft, actor, {
        objectType: "Floor",
        objectId: id,
        institutionCode: target.institutionCode,
        action: "Menambah lantai",
        note: floorName,
      });
    });
    return { ok: true, id };
  },

  // D-23.c: denah per lantai legacy (historis). Jalur utama adalah
  // publishCampusPlan gambaran besar. Tetap berfungsi + warn.
  savePlanVersion(
    actor: { id?: string; name: string; role?: string },
    buildingId: string,
    floorId: string,
    fileName: string,
  ): ActionResult {
    if (
      typeof console !== "undefined" &&
      typeof process !== "undefined" &&
      process.env?.NODE_ENV !== "production"
    ) {
      console.warn(
        "[ISHAS] savePlanVersion usang — pakai publishCampusPlan gambaran besar (D-23.c).",
      );
    }
    const account = currentState.users.find((item) => item.id === actor.id);
    const building = currentState.buildings.find((item) => item.id === buildingId);
    if (
      !account ||
      account.roleId !== "pesantren" ||
      !building ||
      !account.institutionCodes.includes(building.institutionCode)
    )
      return { ok: false, error: "Anda tidak berwenang mengubah denah ini." };
    if (!fileName.trim()) return { ok: false, error: "Nama file denah wajib diisi." };
    setState((draft) => {
      const target = draft.buildings
        .find((item) => item.id === buildingId)
        ?.floors.find((item) => item.id === floorId);
      if (!target) return;
      const current = Number(target.planVersion.replace(/\D/g, "")) || 0;
      target.planFile = fileName.trim();
      target.planVersion = `DENAH-v${current + 1}`;
      target.uploadedBy = actor.id ?? "";
      target.uploadedAt = nowIso();
      target.planHistory = [
        ...(target.planHistory ?? []),
        {
          version: target.planVersion,
          fileName: target.planFile,
          uploadedBy: target.uploadedBy,
          uploadedAt: target.uploadedAt,
        },
      ];
      audit(draft, actor, {
        objectType: "FloorPlan",
        objectId: floorId,
        institutionCode: building.institutionCode,
        action: "Menambah versi denah",
        note: `${target.planVersion} · ${target.planFile}`,
      });
    });
    return { ok: true };
  },

  updateRecommendation(
    actor: { id?: string; name: string; role?: string },
    recommendationId: string,
    input: {
      owner?: string;
      dueDate?: string;
      note: string;
      progress?: number;
      evidenceName?: string;
      evidenceAssetId?: string;
      verify?: boolean;
    },
  ): ActionResult {
    const recommendation = currentState.recommendations.find(
      (item) => item.id === recommendationId,
    );
    if (!recommendation) return { ok: false, error: "Rekomendasi tidak ditemukan." };
    return setStateReport(actor, recommendation.reportId, (draft, report) => {
      const target = draft.recommendations.find((item) => item.id === recommendationId)!;
      const note = input.note.trim();
      if (!note) return { ok: false, error: "Catatan wajib diisi." };
      // Tindak lanjut hanya untuk laporan tervalidasi yang belum diarsip.
      if (report.validationStatus !== "Diterima" || report.archivedAt) {
        return {
          ok: false,
          error: "Tindak lanjut hanya untuk laporan Diterima yang belum diarsipkan.",
        };
      }
      if (input.verify) {
        if (target.status !== "Menunggu verifikasi")
          return { ok: false, error: "Rekomendasi belum diajukan untuk verifikasi." };
        target.status = "Terverifikasi";
        target.verifiedBy = actor.id;
        target.verifiedAt = nowIso();
        target.updatedAt = target.verifiedAt;
        draft.findings
          .filter((item) => item.recommendationId === target.id)
          .forEach((item) => {
            item.status = "Terverifikasi";
          });
      } else if (target.status === "Belum ditindaklanjuti") {
        // Satu sumber syarat dengan Pending → Proses (catatan rencana + cek tenggat).
        if (!input.owner || input.owner.trim().length < 2 || !input.dueDate || !note) {
          return {
            ok: false,
            error: "PIC, tenggat, dan catatan rencana wajib diisi untuk membuat rencana tindakan.",
          };
        }
        if (input.dueDate < nowIso().slice(0, 10)) {
          return { ok: false, error: "Tenggat tidak boleh berada di masa lalu." };
        }
        target.owner = input.owner.trim();
        target.dueDate = input.dueDate;
        target.status = "Berjalan";
        target.updatedAt = nowIso();
        report.handlingStatus = "Proses";
      } else {
        // D-21: hanya Berjalan yang dapat diperbarui progresnya.
        // Menunggu verifikasi (kunci verifikasi), Terverifikasi/Dibatalkan (terminal) ditolak.
        if (target.status !== "Berjalan")
          return {
            ok: false,
            error: "Hanya rekomendasi Berjalan yang dapat diperbarui progresnya.",
          };
        const progress = input.progress;
        if (progress === undefined || !Number.isFinite(progress) || progress < 0 || progress > 100)
          return { ok: false, error: "Progres harus antara 0 dan 100." };
        // D-20: normalisasi ke titik slider terdekat (0/25/50/75/100).
        const snapped = Math.min(100, Math.max(0, Math.round(progress / 25) * 25));
        target.progress = snapped;
        if (snapped === 100) {
          if (!input.evidenceName?.trim())
            return { ok: false, error: "Bukti penyelesaian wajib diisi saat mengajukan selesai." };
          if (
            input.evidenceAssetId &&
            !/^evidence-asset-[0-9a-f-]{36}$/.test(input.evidenceAssetId)
          )
            return { ok: false, error: "Lampiran bukti tidak sah. Pilih gambar kembali." };
          target.completionEvidence = input.evidenceName.trim();
          // D-21: blob upload bila ada; nama saja = "Bukti lama" (seed/legacy).
          target.completionEvidenceAssetId = input.evidenceAssetId;
          target.status = "Menunggu verifikasi";
        }
        target.updatedAt = nowIso();
      }
      target.lastNote = note;
      if (
        draft.recommendations
          .filter((item) => item.reportId === report.id)
          .every((item) => item.status === "Terverifikasi")
      )
        report.handlingStatus = "Completed";
      audit(draft, actor, {
        objectType: "Recommendation",
        objectId: target.id,
        institutionCode: report.institutionCode,
        action: input.verify ? "Memverifikasi tindak lanjut" : "Memperbarui tindak lanjut",
        note,
      });
      return { ok: true };
    });
  },

  // D-21: batalkan perbaikan per rekomendasi (bukan hapus baris/arsip laporan).
  // Terminal; baris tetap tampil internal + publik beserta alasan.
  cancelRecommendation(
    actor: { id?: string; name: string; role?: string },
    recommendationId: string,
    reason: string,
  ): ActionResult {
    const recommendation = currentState.recommendations.find(
      (item) => item.id === recommendationId,
    );
    if (!recommendation) return { ok: false, error: "Rekomendasi tidak ditemukan." };
    const trimmed = reason.trim();
    if (trimmed.length < 10)
      return { ok: false, error: "Alasan pembatalan minimal 10 karakter." };
    return setStateReport(actor, recommendation.reportId, (draft, report) => {
      const target = draft.recommendations.find((item) => item.id === recommendationId)!;
      if (report.validationStatus !== "Diterima" || report.archivedAt) {
        return {
          ok: false,
          error: "Tindak lanjut hanya untuk laporan Diterima yang belum diarsipkan.",
        };
      }
      if (
        target.status !== "Belum ditindaklanjuti" &&
        target.status !== "Berjalan" &&
        target.status !== "Menunggu verifikasi"
      )
        return { ok: false, error: "Hanya perbaikan yang belum selesai yang dapat dibatalkan." };
      target.status = "Dibatalkan";
      target.canceledReason = trimmed;
      target.canceledBy = actor.id;
      target.canceledAt = nowIso();
      target.updatedAt = target.canceledAt;
      draft.findings
        .filter((item) => item.recommendationId === target.id)
        .forEach((item) => {
          item.status = "Dibatalkan";
        });
      // Laporan induk tetap Proses/Pending; Dibatalkan menghalangi Completed
      // otomatis karena syarat every(Terverifikasi) tak terpenuhi.
      audit(draft, actor, {
        objectType: "Recommendation",
        objectId: target.id,
        institutionCode: report.institutionCode,
        action: "Membatalkan tindak lanjut",
        note: trimmed,
      });
      return { ok: true };
    });
  },

  saveSelfAssessmentDraft(draftInput: SelfAssessmentDraft): ActionResult {
    // Boundary validation (D-24/D-11): tolak scope tak terdaftar.
    // Checksum dicatat apa adanya (UI menilai basi/tidaknya); nama fleksibel
    // saat autosave, validasi panjang final ada di submit.
    if (
      draftInput.institutionCode &&
      !selectRegisteredInstitutions(currentState).some(
        (item) => item.code === draftInput.institutionCode,
      )
    ) {
      return { ok: false, error: "Pesantren tidak tersedia untuk pelaporan." };
    }
    if (!currentState.instrument || !currentState.instrument.dimensions.length) {
      return { ok: false, error: "Belum ada instrumen." };
    }
    setState((draft) => {
      draft.selfAssessmentDrafts[draftInput.id] = {
        ...draftInput,
        instrumentVersionId: draftInput.instrumentVersionId || BANK_ID,
        instrumentChecksum:
          draftInput.instrumentChecksum ?? currentState.instrument.checksum,
        updatedAt: nowIso(),
      };
    });
    return { ok: true };
  },

  deleteSelfAssessmentDraft(draftId: string): ActionResult {
    // D-10: hapus draft versi lama agar pelapor dapat memulai penilaian baru
    // dengan versi Published terbaru. Draft terkirim sudah dihapus saat submit.
    if (!currentState.selfAssessmentDrafts[draftId]) {
      return { ok: false, error: "Draft tidak ditemukan." };
    }
    setState((draft) => {
      delete draft.selfAssessmentDrafts[draftId];
    });
    return { ok: true };
  },

  submitSelfAssessment(
    actor: { id?: string; name: string; email?: string; role?: string },
    draftId: string,
  ): ActionResult {
    // Penegakan D-03 di boundary data (sama seperti lapor-cepat): hanya publik
    // tanpa login + akun Pesantren aktif. UI saja tidak cukup (panggilan adapter langsung).
    let sender: ReportActor = actor;
    if (actor.id) {
      const account = currentState.users.find((u) => u.id === actor.id);
      if (!account || account.status !== "Aktif" || account.roleId !== "pesantren") {
        return {
          ok: false,
          error:
            "Hanya publik tanpa login dan Pesantren aktif yang dapat mengirim penilaian.",
        };
      }
      sender = { id: account.id, name: account.name, email: account.email, role: account.role };
    } else if (actor.role && actor.role !== "Publik" && actor.role !== "Publik / Pelapor") {
      return { ok: false, error: "Keluar dari akun untuk melapor sebagai publik." };
    }
    let result: ActionResult = { ok: true };
    setState((draft) => {
      const d = draft.selfAssessmentDrafts[draftId];
      if (!d) {
        result = { ok: false, error: "Draft tidak ditemukan." };
        return;
      }
      const instrument = draft.instrument;
      if (!instrument || !instrument.dimensions.length) {
        result = { ok: false, error: "Belum ada instrumen." };
        return;
      }
      // D-24: soal berubah di tengah jalan = draft basi, wajib ulang dari awal.
      if (d.instrumentChecksum && d.instrumentChecksum !== instrument.checksum) {
        result = {
          ok: false,
          error:
            "Instrumen berubah saat Anda mengisi. Buang draft lama dan mulai penilaian baru.",
        };
        return;
      }
      const reporterName = d.reporterName.trim();
      if (
        !selectRegisteredInstitutions(draft).some((item) => item.code === d.institutionCode) ||
        reporterName.length < 2
      ) {
        result = { ok: false, error: "Pesantren dan nama pelapor wajib diisi." };
        return;
      }
      if (reporterName.length > 100) {
        result = { ok: false, error: "Nama maksimal 100 karakter." };
        return;
      }
      if ((d.contact?.trim().length ?? 0) > 100) {
        result = { ok: false, error: "Kontak maksimal 100 karakter." };
        return;
      }
      const indicators = instrument.dimensions.flatMap((dimension) => dimension.indicators);
      for (const indicator of indicators) {
        const answer = d.answers[indicator.id];
        const manualLocation = answer?.manualLocation?.trim() ?? "";
        const hasLocation = Boolean(answer?.areaId) || manualLocation.length >= 3;
        const nilaiSah = indicator.options.map((o) => o.value);
        if (
          !answer?.value ||
          (indicator.required !== false && !nilaiSah.includes(answer.value)) ||
          (indicator.evidenceRequired && !answer.evidenceName?.trim()) ||
          (indicator.locationRequired && !hasLocation) ||
          (answer.value === "N/A" && (answer.note?.trim().length ?? 0) < 10)
        ) {
          result = {
            ok: false,
            error: "Lengkapi seluruh jawaban, bukti, catatan N/A, dan lokasi yang wajib.",
          };
          return;
        }
        if (
          indicator.locationRequired &&
          answer.areaId &&
          !draft.areas.some(
            (area) => area.id === answer.areaId && area.institutionCode === d.institutionCode,
          )
        ) {
          result = { ok: false, error: "Area penilaian tidak sah untuk pesantren ini." };
          return;
        }
        const mapError = validateMapLocation(draft, d.institutionCode, answer.locationSnapshot);
        if (mapError) {
          result = { ok: false, error: mapError };
          return;
        }
      }
      // D-24: bekukan soal + opsi + bobot + hitung skor % saat kirim.
      const frozen: FrozenIndicator[] = instrument.dimensions.flatMap((dimension) =>
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
      const builtAnswers: Record<string, IndicatorAnswer> = {};
      for (const [k, v] of Object.entries(d.answers)) {
        builtAnswers[k] = {
          value: v.value ?? "",
          note: v.note ?? "",
          evidenceName: v.evidenceName ?? "",
          areaId: v.areaId ?? "",
          manualLocation: v.manualLocation?.trim() || undefined,
          planPoint: v.planPoint ?? null,
          locationSnapshot: snapshotLocation(
            draft,
            d.institutionCode,
            v.areaId,
            v.manualLocation,
            v.locationSnapshot,
          ),
        };
      }
      const { scorePercent, byDimension } = skorLaporanBeku(frozen, builtAnswers);
      const n = draft.counters.report;
      draft.counters.report = n + 1;
      const id = `RPT-${String(n).padStart(4, "0")}`;
      result = { ok: true, id };
      const stampedAt = nowIso();
      draft.reports.push({
        id,
        channel: "penilaian-mandiri",
        institutionCode: d.institutionCode,
        reporterName,
        reporterUserId: sender.id,
        reporterAccountEmail: sender.email ?? undefined,
        contact: d.contact?.trim() || undefined,
        title: "Penilaian mandiri K3L",
        description: "Ringkasan jawaban penilaian mandiri terkirim.",
        instrumentVersionId: BANK_ID,
        instrumentChecksum: instrument.checksum,
        scorePercent,
        pdfGeneratedAt: stampedAt,
        validationStatus: "Menunggu validasi",
        severity: "Belum ditentukan",
        priority: "Belum ditentukan",
        handlingStatus: "Menunggu validasi",
        createdAt: stampedAt,
        submittedAt: stampedAt,
        updatedAt: stampedAt,
      });
      draft.selfAssessmentSnapshots.push({
        reportId: id,
        instrumentVersionId: BANK_ID,
        instrumentChecksum: instrument.checksum,
        submittedAt: nowIso(),
        answers: builtAnswers,
        frozenIndicators: frozen,
        scorePercent,
        byDimension,
      });
      delete draft.selfAssessmentDrafts[draftId];
      audit(draft, sender, {
        objectType: "Report",
        objectId: id,
        institutionCode: d.institutionCode,
        action: "Mengirim penilaian mandiri",
      });
      notifyOwners(draft, d.institutionCode, id);
    });
    return result;
  },

  addUser(user: User): ActionResult {
    const name = user.name.trim();
    const email = user.email.trim().toLowerCase();
    if (name.length < 2) return { ok: false, error: "Nama pengguna minimal 2 karakter." };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return { ok: false, error: "Format email tidak valid." };
    // D-09 (9 Sep 2026): Super Admin dapat membuat Super Admin, Validator, Pesantren.
    // Pesantren wajib tepat 1 pesantren Aktif; admin/validator tanpa scope lembaga.
    if (
      user.roleId === "pesantren" &&
      (user.institutionCodes.length !== 1 ||
        !currentState.institutions.some(
          (item) => item.code === user.institutionCodes[0] && item.status === "Aktif",
        ))
    )
      return { ok: false, error: "Pesantren wajib terhubung ke satu pesantren aktif." };
    if (
      (user.roleId === "admin" || user.roleId === "validator") &&
      user.institutionCodes.length !== 0
    )
      return { ok: false, error: "Super Admin dan Validator tidak terikat pesantren." };
    if (getState().users.some((u) => u.email.toLowerCase() === email)) {
      return { ok: false, error: "Email sudah digunakan pada data demo." };
    }
    setState((draft) => {
      draft.users.push({ ...user, name, email });
      audit(
        draft,
        { name: "Sistem" },
        {
          objectType: "User",
          objectId: user.id,
          action: "Membuat akun pengguna",
        },
      );
    });
    return { ok: true };
  },

  addInstitution(institution: Institution): ActionResult {
    const name = institution.name.trim();
    const location = institution.location.trim();
    if (name.length < 3) return { ok: false, error: "Nama pesantren minimal 3 karakter." };
    if (location.length < 3) return { ok: false, error: "Lokasi minimal 3 karakter." };
    if (currentState.institutions.some((item) => item.name.toLowerCase() === name.toLowerCase()))
      return { ok: false, error: "Nama pesantren sudah digunakan." };
    setState((draft) => {
      draft.institutions.push({ ...institution, name, location });
      draft.counters.institution += 1;
      audit(
        draft,
        { name: "Sistem" },
        {
          objectType: "Institution",
          objectId: institution.code,
          action: "Membuat data pesantren",
        },
      );
    });
    return { ok: true };
  },

  setUserStatus(userId: string, status: User["status"]): ActionResult {
    const target = currentState.users.find((item) => item.id === userId);
    if (!target) return { ok: false, error: "Pengguna tidak ditemukan." };
    if (
      target.roleId === "admin" &&
      status !== "Aktif" &&
      currentState.users.filter((item) => item.roleId === "admin" && item.status === "Aktif")
        .length === 1
    )
      return { ok: false, error: "Minimal satu Super Admin harus tetap aktif." };
    setState((draft) => {
      const user = draft.users.find((item) => item.id === userId)!;
      user.status = status;
      audit(
        draft,
        { name: "Super Admin" },
        { objectType: "User", objectId: userId, action: "Mengubah status pengguna", note: status },
      );
    });
    return { ok: true };
  },

  setInstitutionStatus(code: string, status: Institution["status"]): ActionResult {
    const target = currentState.institutions.find((item) => item.code === code);
    if (!target) return { ok: false, error: "Pesantren tidak ditemukan." };
    if (
      status === "Aktif" &&
      !currentState.users.some(
        (item) =>
          item.roleId === "pesantren" &&
          item.status === "Aktif" &&
          item.institutionCodes.includes(code),
      )
    )
      return { ok: false, error: "Tetapkan minimal satu akun Pesantren aktif sebelum aktivasi." };
    setState((draft) => {
      const institution = draft.institutions.find((item) => item.code === code)!;
      institution.status = status;
      audit(
        draft,
        { name: "Super Admin" },
        {
          objectType: "Institution",
          objectId: code,
          action: "Mengubah status pesantren",
          note: status,
        },
      );
    });
    return { ok: true };
  },

  createInstrumentDraft(sourceId?: string): ActionResult {
    const source =
      currentState.instrumentVersions.find((item) => item.id === sourceId) ??
      currentState.instrumentVersions.find(
        (item) => item.id === currentState.activeInstrumentVersionId,
      );
    if (!source) return { ok: false, error: "Instrumen sumber tidak ditemukan." };
    const versions = currentState.instrumentVersions.map((item) =>
      Number(item.id.match(/v(\d+)\./)?.[1] ?? 0),
    );
    const major = Math.max(...versions, 0) + 1;
    const id = `INS-v${major}.0`;
    const copy: InstrumentVersion = {
      ...structuredClone(source),
      id,
      label: `ISHAS v${major}.0`,
      status: "Draft",
      publishedAt: undefined,
    };
    setState((draft) => {
      draft.instrumentVersions.push(copy);
      audit(
        draft,
        { name: "Validator" },
        {
          objectType: "InstrumentVersion",
          objectId: id,
          action: "Membuat draft instrumen",
          note: `Salinan ${source.id}`,
        },
      );
    });
    return { ok: true, id };
  },

  addInstrumentDimension(versionId: string, name: string, categoryId?: string): ActionResult {
    const clean = name.trim();
    if (clean.length < 3) return { ok: false, error: "Nama dimensi minimal 3 karakter." };
    const target = currentState.instrumentVersions.find((v) => v.id === versionId);
    if (!target) return { ok: false, error: "Versi instrumen tidak ditemukan." };
    if (target.status !== "Draft")
      return {
        ok: false,
        error: "Hanya versi Draft yang dapat diubah. Buat versi baru untuk perubahan.",
      };
    let id = "";
    setState((draft) => {
      const version = draft.instrumentVersions.find((v) => v.id === versionId)!;
      const n = version.dimensions.length + 1;
      id = `DIM-${String(n).padStart(2, "0")}`;
      version.dimensions.push({
        id,
        name: clean,
        categoryId: categoryId as InstrumentVersion["dimensions"][number]["categoryId"],
        indicators: [],
      });
      audit(
        draft,
        { name: "Validator" },
        {
          objectType: "InstrumentVersion",
          objectId: versionId,
          action: "Menambah dimensi",
          note: clean,
        },
      );
    });
    return { ok: true, id };
  },

  addInstrumentIndicator(
    versionId: string,
    dimensionId: string,
    input: {
      code: string;
      title: string;
      prompt: string;
      answerType: "likert-1-5" | "boolean-ya-tidak" | "likert-1-2-tidak";
      required: boolean;
      evidenceRequired: boolean;
      locationRequired: boolean;
      categoryId?: string;
      aspectId?: string;
    },
  ): ActionResult {
    const code = input.code.trim();
    const title = input.title.trim();
    const prompt = input.prompt.trim();
    if (!code) return { ok: false, error: "Kode indikator wajib diisi." };
    if (title.length < 5) return { ok: false, error: "Judul indikator minimal 5 karakter." };
    if (prompt.length < 10) return { ok: false, error: "Prompt minimal 10 karakter." };
    const target = currentState.instrumentVersions.find((v) => v.id === versionId);
    if (!target) return { ok: false, error: "Versi instrumen tidak ditemukan." };
    if (target.status !== "Draft")
      return {
        ok: false,
        error: "Hanya versi Draft yang dapat diubah. Buat versi baru untuk perubahan.",
      };
    if (
      target.dimensions
        .flatMap((d) => d.indicators)
        .some((i) => i.code.toLowerCase() === code.toLowerCase())
    ) {
      return { ok: false, error: "Kode indikator sudah digunakan pada versi ini." };
    }
    let id = "";
    setState((draft) => {
      const version = draft.instrumentVersions.find((v) => v.id === versionId)!;
      const dim = version.dimensions.find((d) => d.id === dimensionId);
      if (!dim) return;
      const count = version.dimensions.flatMap((d) => d.indicators).length + 1;
      id = `IND-NEW-${String(count).padStart(3, "0")}`;
      dim.indicators.push({
        id,
        code,
        title,
        prompt,
        answerType: input.answerType,
        required: input.required,
        evidenceRequired: input.evidenceRequired,
        locationRequired: input.locationRequired,
        categoryId: (input.categoryId ??
          dim.categoryId) as InstrumentVersion["dimensions"][number]["indicators"][number]["categoryId"],
        aspectId: input.aspectId,
        findingTrigger: "ilustrasi: dikaji Pesantren saat validasi",
      });
      audit(
        draft,
        { name: "Validator" },
        {
          objectType: "InstrumentVersion",
          objectId: versionId,
          action: "Menambah indikator",
          note: `${code} · ${title}`,
        },
      );
    });
    const ok = currentState.instrumentVersions
      .find((v) => v.id === versionId)
      ?.dimensions.find((d) => d.id === dimensionId)
      ?.indicators.some((i) => i.id === id);
    if (!ok) return { ok: false, error: "Dimensi tidak ditemukan." };
    return { ok: true, id };
  },

  publishInstrument(id: string): ActionResult {
    // Warisan versioning (D-24: tidak dipakai UI baru; dipertahankan agar
    // test/migrasi lama tetap hijau — deprecasi lembut).
    const target = currentState.instrumentVersions.find((item) => item.id === id);
    if (!target) return { ok: false, error: "Versi instrumen tidak ditemukan." };
    if (target.status !== "Draft")
      return { ok: false, error: "Hanya versi Draft yang dapat dipublikasikan." };
    if (
      !target.dimensions.length ||
      target.dimensions.some((dimension) => !dimension.indicators.length)
    )
      return { ok: false, error: "Setiap dimensi wajib memiliki indikator." };
    setState((draft) => {
      draft.instrumentVersions.forEach((item) => {
        if (item.status === "Published") item.status = "Archived";
      });
      const version = draft.instrumentVersions.find((item) => item.id === id)!;
      version.status = "Published";
      version.publishedAt = nowIso();
      draft.activeInstrumentVersionId = id;
      audit(
        draft,
        { name: "Validator" },
        { objectType: "InstrumentVersion", objectId: id, action: "Mempublikasikan instrumen" },
      );
    });
    return { ok: true };
  },

  // ---- D-24: bank instrumen live (edit penuh, langsung aktif) ----

  addBankDimension(name: string, categoryId?: string): ActionResult {
    const clean = name.trim();
    if (clean.length < 3) return { ok: false, error: "Nama dimensi minimal 3 karakter." };
    if (categoryId && !K3_CATEGORY_MAP[categoryId as keyof typeof K3_CATEGORY_MAP])
      return { ok: false, error: "Kategori tidak dikenal." };
    let id = "";
    setState((draft) => {
      const bank = draft.instrument;
      let n = bank.dimensions.length + 1;
      id = `DIM-${String(n).padStart(2, "0")}`;
      while (bank.dimensions.some((d) => d.id === id)) {
        n += 1;
        id = `DIM-${String(n).padStart(2, "0")}`;
      }
      bank.dimensions.push({
        id,
        name: clean,
        categoryId: (categoryId || undefined) as InstrumentIndicator["categoryId"],
        indicators: [],
      });
      touchBank(bank);
      audit(
        draft,
        { name: "Validator" },
        { objectType: "Instrument", objectId: id, action: "Menambah dimensi", note: clean },
      );
    });
    return { ok: true, id };
  },

  updateBankDimension(id: string, patch: { name?: string; categoryId?: string }): ActionResult {
    const target = currentState.instrument.dimensions.find((d) => d.id === id);
    if (!target) return { ok: false, error: "Dimensi tidak ditemukan." };
    const name = patch.name?.trim() ?? target.name;
    if (name.length < 3) return { ok: false, error: "Nama dimensi minimal 3 karakter." };
    const categoryId = patch.categoryId?.trim() || undefined;
    if (categoryId && !K3_CATEGORY_MAP[categoryId as keyof typeof K3_CATEGORY_MAP])
      return { ok: false, error: "Kategori tidak dikenal." };
    setState((draft) => {
      const dim = draft.instrument.dimensions.find((d) => d.id === id)!;
      dim.name = name;
      dim.categoryId = (categoryId || undefined) as InstrumentIndicator["categoryId"];
      touchBank(draft.instrument);
      audit(
        draft,
        { name: "Validator" },
        { objectType: "Instrument", objectId: id, action: "Mengubah dimensi", note: name },
      );
    });
    return { ok: true };
  },

  deleteBankDimension(id: string): ActionResult {
    const target = currentState.instrument.dimensions.find((d) => d.id === id);
    if (!target) return { ok: false, error: "Dimensi tidak ditemukan." };
    const used = currentState.selfAssessmentSnapshots.some((s) =>
      Object.keys(s.answers ?? {}).some((key) =>
        target.indicators.some((i) => i.id === key),
      ),
    );
    setState((draft) => {
      draft.instrument.dimensions = draft.instrument.dimensions.filter((d) => d.id !== id);
      touchBank(draft.instrument);
      audit(
        draft,
        { name: "Validator" },
        {
          objectType: "Instrument",
          objectId: id,
          action: "Menghapus dimensi",
          note: used ? `${target.name} (punya riwayat snapshot beku)` : target.name,
        },
      );
    });
    return { ok: true };
  },

  addBankIndicator(
    dimensionId: string,
    input: {
      code: string;
      title: string;
      prompt: string;
      answerType: InstrumentAnswerType;
      required: boolean;
      evidenceRequired: boolean;
      locationRequired: boolean;
      categoryId?: string;
      aspectId?: string;
    },
  ): ActionResult {
    const code = input.code.trim();
    const title = input.title.trim();
    const prompt = input.prompt.trim();
    if (!code) return { ok: false, error: "Kode indikator wajib diisi." };
    if (title.length < 5) return { ok: false, error: "Judul indikator minimal 5 karakter." };
    if (prompt.length < 10) return { ok: false, error: "Prompt minimal 10 karakter." };
    if (!["ya-tidak", "kualitas-1-5", "frekuensi", "keparahan"].includes(input.answerType))
      return { ok: false, error: "Tipe jawaban tidak dikenal." };
    const dim = currentState.instrument.dimensions.find((d) => d.id === dimensionId);
    if (!dim) return { ok: false, error: "Dimensi tidak ditemukan." };
    if (
      currentState.instrument.dimensions
        .flatMap((d) => d.indicators)
        .some((i) => i.code.toLowerCase() === code.toLowerCase())
    )
      return { ok: false, error: "Kode indikator sudah digunakan." };
    const categoryId = input.categoryId?.trim() || undefined;
    if (categoryId && !K3_CATEGORY_MAP[categoryId as keyof typeof K3_CATEGORY_MAP])
      return { ok: false, error: "Kategori tidak dikenal." };
    const aspectId = input.aspectId?.trim() || undefined;
    if (
      aspectId &&
      (!K3_ASPECT_MAP[aspectId] ||
        (categoryId ?? dim.categoryId) !== K3_ASPECT_MAP[aspectId].categoryId)
    )
      return { ok: false, error: "Aspek tidak sesuai kategori." };
    let id = "";
    setState((draft) => {
      const bank = draft.instrument;
      const target = bank.dimensions.find((d) => d.id === dimensionId)!;
      let n = bank.dimensions.flatMap((d) => d.indicators).length + 1;
      id = `IND-K3L-${String(n).padStart(3, "0")}`;
      while (bank.dimensions.flatMap((d) => d.indicators).some((i) => i.id === id)) {
        n += 1;
        id = `IND-K3L-${String(n).padStart(3, "0")}`;
      }
      target.indicators.push({
        id,
        code,
        title,
        prompt,
        categoryId: (categoryId ?? target.categoryId) as InstrumentIndicator["categoryId"],
        aspectId,
        answerType: input.answerType,
        required: input.required,
        evidenceRequired: input.evidenceRequired,
        locationRequired: input.locationRequired,
        weight: 1,
        options: defaultOptionsForType(input.answerType),
      });
      touchBank(bank);
      audit(
        draft,
        { name: "Validator" },
        { objectType: "Instrument", objectId: id, action: "Menambah indikator", note: `${code} · ${title}` },
      );
    });
    return { ok: true, id };
  },

  updateBankIndicator(
    id: string,
    patch: {
      code?: string;
      title?: string;
      prompt?: string;
      answerType?: InstrumentAnswerType;
      required?: boolean;
      evidenceRequired?: boolean;
      locationRequired?: boolean;
      categoryId?: string;
      aspectId?: string;
    },
  ): ActionResult {
    const found = findBankIndicator(currentState, id);
    if (!found) return { ok: false, error: "Indikator tidak ditemukan." };
    const code = patch.code?.trim() ?? found.indicator.code;
    const title = patch.title?.trim() ?? found.indicator.title;
    const prompt = patch.prompt?.trim() ?? found.indicator.prompt;
    if (!code) return { ok: false, error: "Kode indikator wajib diisi." };
    if (title.length < 5) return { ok: false, error: "Judul indikator minimal 5 karakter." };
    if (prompt.length < 10) return { ok: false, error: "Prompt minimal 10 karakter." };
    if (
      patch.answerType &&
      !["ya-tidak", "kualitas-1-5", "frekuensi", "keparahan"].includes(patch.answerType)
    )
      return { ok: false, error: "Tipe jawaban tidak dikenal." };
    if (
      currentState.instrument.dimensions
        .flatMap((d) => d.indicators)
        .some((i) => i.id !== id && i.code.toLowerCase() === code.toLowerCase())
    )
      return { ok: false, error: "Kode indikator sudah digunakan." };
    const categoryId = patch.categoryId?.trim() || found.indicator.categoryId;
    if (categoryId && !K3_CATEGORY_MAP[categoryId as keyof typeof K3_CATEGORY_MAP])
      return { ok: false, error: "Kategori tidak dikenal." };
    const aspectId = patch.aspectId?.trim() || undefined;
    if (aspectId && (!K3_ASPECT_MAP[aspectId] || K3_ASPECT_MAP[aspectId].categoryId !== categoryId))
      return { ok: false, error: "Aspek tidak sesuai kategori." };
    setState((draft) => {
      const live = findBankIndicator(draft, id)!;
      const nextType = patch.answerType ?? live.indicator.answerType;
      const typeChanged = nextType !== live.indicator.answerType;
      Object.assign(live.indicator, {
        code,
        title,
        prompt,
        answerType: nextType,
        required: patch.required ?? live.indicator.required,
        evidenceRequired: patch.evidenceRequired ?? live.indicator.evidenceRequired,
        locationRequired: patch.locationRequired ?? live.indicator.locationRequired,
        categoryId: (categoryId || undefined) as InstrumentIndicator["categoryId"],
        aspectId,
      });
      // Ganti tipe = opsi kembali ke bawaan (bobot lama tidak lagi bermakna).
      if (typeChanged) live.indicator.options = defaultOptionsForType(nextType);
      touchBank(draft.instrument);
      audit(
        draft,
        { name: "Validator" },
        { objectType: "Instrument", objectId: id, action: "Mengubah indikator", note: `${code} · ${title}` },
      );
    });
    return { ok: true };
  },

  deleteBankIndicator(id: string): ActionResult {
    const found = findBankIndicator(currentState, id);
    if (!found) return { ok: false, error: "Indikator tidak ditemukan." };
    setState((draft) => {
      for (const dim of draft.instrument.dimensions)
        dim.indicators = dim.indicators.filter((i) => i.id !== id);
      touchBank(draft.instrument);
      audit(
        draft,
        { name: "Validator" },
        {
          objectType: "Instrument",
          objectId: id,
          action: "Menghapus indikator",
          note: `${found.indicator.code} (snapshot lama tetap beku)`,
        },
      );
    });
    return { ok: true };
  },

  // Tombol Atur Bobot: bobot tiap opsi 0–100 + flag temuan + pengali indikator.
  setBankIndicatorOptions(
    id: string,
    options: InstrumentOption[],
    weight?: number,
  ): ActionResult {
    const found = findBankIndicator(currentState, id);
    if (!found) return { ok: false, error: "Indikator tidak ditemukan." };
    if (options.length < 2) return { ok: false, error: "Minimal 2 opsi jawaban." };
    const seen = new Set<string>();
    for (const o of options) {
      const value = o.value.trim();
      const label = o.label.trim();
      if (!value) return { ok: false, error: "Nilai opsi tidak boleh kosong." };
      if (!label) return { ok: false, error: "Label opsi tidak boleh kosong." };
      if (!Number.isFinite(o.weight) || o.weight < 0 || o.weight > 100)
        return { ok: false, error: "Bobot opsi harus 0–100." };
      if (seen.has(value.toLowerCase())) return { ok: false, error: "Nilai opsi tidak boleh ganda." };
      seen.add(value.toLowerCase());
    }
    if (weight !== undefined && (!Number.isFinite(weight) || weight <= 0 || weight > 10))
      return { ok: false, error: "Pengali indikator harus 0–10." };
    setState((draft) => {
      const live = findBankIndicator(draft, id)!;
      live.indicator.options = options.map((o) => ({
        value: o.value.trim(),
        label: o.label.trim(),
        weight: Math.round(o.weight),
        isFinding: Boolean(o.isFinding),
      }));
      if (weight !== undefined) live.indicator.weight = weight;
      touchBank(draft.instrument);
      audit(
        draft,
        { name: "Validator" },
        { objectType: "Instrument", objectId: id, action: "Mengatur bobot jawaban" },
      );
    });
    return { ok: true };
  },

  // D-16: pustaka detail indikator — independen dari versioning instrumen.
  // Satu indicatorId = satu berkas; unggah baru mengganti metadata lama.
  upsertInstrumentDoc(
    actor: { id?: string; name: string; role?: string },
    input: {
      indicatorId: string;
      fileName: string;
      fileSize: number;
      assetId: string;
      visibility?: InstrumentDocVisibility;
      categoryId?: string;
      aspectId?: string;
    },
  ): ActionResult {
    const account = actor.id ? currentState.users.find((user) => user.id === actor.id) : undefined;
    if (!account || account.status !== "Aktif" || account.roleId !== "validator") {
      return {
        ok: false,
        error: "Hanya akun Validator aktif yang dapat mengelola berkas indikator.",
      };
    }
    const indicatorId = input.indicatorId.trim();
    const fileName = input.fileName.trim();
    if (!indicatorId) return { ok: false, error: "Indikator tidak ditemukan." };
    const catalog = currentState.instrumentVersions.flatMap((v) =>
      v.dimensions.flatMap((d) => d.indicators.map((i) => ({ dim: d, ind: i }))),
    );
    const found = catalog.find((entry) => entry.ind.id === indicatorId);
    const existing = currentState.instrumentDocs.find((item) => item.indicatorId === indicatorId);
    if (!found && !existing) return { ok: false, error: "Indikator tidak ditemukan." };
    if (!fileName.toLowerCase().endsWith(".pdf") || fileName.length > 200) {
      return { ok: false, error: "Hanya berkas PDF yang didukung." };
    }
    if (
      !Number.isSafeInteger(input.fileSize) ||
      input.fileSize <= 0 ||
      input.fileSize > 10 * 1024 * 1024
    ) {
      return { ok: false, error: "Ukuran PDF harus lebih dari 0 dan maksimal 10 MB." };
    }
    if (typeof input.assetId !== "string" || !input.assetId) {
      return { ok: false, error: "Berkas belum tersimpan. Unggah ulang PDF." };
    }
    const visibility: InstrumentDocVisibility = input.visibility === "Public" ? "Public" : "Privat";
    const id = `DOC-${indicatorId}`;
    setState((draft) => {
      const doc: InstrumentDoc = {
        id,
        indicatorId,
        categoryId:
          input.categoryId ??
          found?.ind.categoryId ??
          found?.dim.categoryId ??
          existing?.categoryId,
        aspectId: input.aspectId ?? found?.ind.aspectId ?? existing?.aspectId,
        indicatorCode: existing?.indicatorCode,
        indicatorTitle: existing?.indicatorTitle,
        manual: existing?.manual,
        fileName,
        fileSize: input.fileSize,
        mime: "application/pdf",
        assetId: input.assetId,
        visibility,
        updatedBy: account.name,
        updatedAt: nowIso(),
      };
      const at = draft.instrumentDocs.findIndex((item) => item.indicatorId === indicatorId);
      if (at >= 0) draft.instrumentDocs[at] = doc;
      else draft.instrumentDocs.push(doc);
      audit(draft, account, {
        objectType: "InstrumentDoc",
        objectId: id,
        action: "Mengunggah berkas indikator",
        note: `${fileName} · ${visibility}`,
      });
    });
    return { ok: true, id };
  },

  // D-16.g: Validator membuat entri dokumen indikator baru di luar katalog versi.
  // Metadata indikator di-denormalisasi; InstrumentVersion tidak diubah.
  createInstrumentDocEntry(
    actor: { id?: string; name: string; role?: string },
    input: {
      code: string;
      title: string;
      categoryId: string;
      aspectId?: string;
      visibility?: InstrumentDocVisibility;
      fileName: string;
      fileSize: number;
      assetId: string;
    },
  ): ActionResult {
    const account = actor.id ? currentState.users.find((user) => user.id === actor.id) : undefined;
    if (!account || account.status !== "Aktif" || account.roleId !== "validator") {
      return {
        ok: false,
        error: "Hanya akun Validator aktif yang dapat menambah dokumen indikator.",
      };
    }
    const code = input.code.trim();
    const title = input.title.trim();
    const categoryId = input.categoryId.trim();
    if (code.length < 3) return { ok: false, error: "Kode indikator minimal 3 karakter." };
    if (title.length < 5) return { ok: false, error: "Judul indikator minimal 5 karakter." };
    if (!K3_CATEGORY_MAP[categoryId as keyof typeof K3_CATEGORY_MAP]) {
      return { ok: false, error: "Kategori wajib dipilih." };
    }
    const aspectId = input.aspectId?.trim() ?? "";
    if (
      aspectId &&
      (!K3_ASPECT_MAP[aspectId] || K3_ASPECT_MAP[aspectId].categoryId !== categoryId)
    ) {
      return { ok: false, error: "Aspek tidak sesuai kategori." };
    }
    const fileName = input.fileName.trim();
    if (!fileName.toLowerCase().endsWith(".pdf") || fileName.length > 200) {
      return { ok: false, error: "Hanya berkas PDF yang didukung." };
    }
    if (
      !Number.isSafeInteger(input.fileSize) ||
      input.fileSize <= 0 ||
      input.fileSize > 10 * 1024 * 1024
    ) {
      return { ok: false, error: "Ukuran PDF harus lebih dari 0 dan maksimal 10 MB." };
    }
    if (typeof input.assetId !== "string" || !input.assetId) {
      return { ok: false, error: "Berkas belum tersimpan. Unggah ulang PDF." };
    }
    const catalogCodes = [
      ...currentState.instrument.dimensions.flatMap((d) =>
        d.indicators.map((i) => i.code.toLowerCase()),
      ),
      ...currentState.instrumentVersions.flatMap((v) =>
        v.dimensions.flatMap((d) => d.indicators.map((i) => i.code.toLowerCase())),
      ),
    ];
    const manualCodes = currentState.instrumentDocs
      .filter((doc) => doc.manual)
      .map((doc) => (doc.indicatorCode ?? "").toLowerCase());
    if (catalogCodes.includes(code.toLowerCase()) || manualCodes.includes(code.toLowerCase())) {
      return { ok: false, error: "Kode indikator sudah digunakan." };
    }
    const visibility: InstrumentDocVisibility = input.visibility === "Public" ? "Public" : "Privat";
    let id = "";
    setState((draft) => {
      let n = draft.instrumentDocs.filter((doc) => doc.manual).length + 1;
      let indicatorId = `IND-DOC-${String(n).padStart(3, "0")}`;
      while (draft.instrumentDocs.some((doc) => doc.indicatorId === indicatorId)) {
        n += 1;
        indicatorId = `IND-DOC-${String(n).padStart(3, "0")}`;
      }
      id = `DOC-${indicatorId}`;
      draft.instrumentDocs.push({
        id,
        indicatorId,
        categoryId,
        aspectId: aspectId || undefined,
        indicatorCode: code,
        indicatorTitle: title,
        manual: true,
        fileName,
        fileSize: input.fileSize,
        mime: "application/pdf",
        assetId: input.assetId,
        visibility,
        updatedBy: account.name,
        updatedAt: nowIso(),
      });
      audit(draft, account, {
        objectType: "InstrumentDoc",
        objectId: id,
        action: "Menambahkan dokumen indikator",
        note: `${code} · ${fileName} · ${visibility}`,
      });
    });
    return { ok: true, id };
  },

  setInstrumentDocVisibility(
    actor: { id?: string; name: string; role?: string },
    indicatorId: string,
    visibility: InstrumentDocVisibility,
  ): ActionResult {
    const account = actor.id ? currentState.users.find((user) => user.id === actor.id) : undefined;
    if (!account || account.status !== "Aktif" || account.roleId !== "validator") {
      return {
        ok: false,
        error: "Hanya akun Validator aktif yang dapat mengubah visibilitas berkas.",
      };
    }
    if (visibility !== "Public" && visibility !== "Privat") {
      return { ok: false, error: "Visibilitas harus Public atau Privat." };
    }
    const target = currentState.instrumentDocs.find((item) => item.indicatorId === indicatorId);
    if (!target) return { ok: false, error: "Berkas indikator belum diunggah." };
    setState((draft) => {
      const doc = draft.instrumentDocs.find((item) => item.indicatorId === indicatorId)!;
      doc.visibility = visibility;
      doc.updatedBy = account.name;
      doc.updatedAt = nowIso();
      audit(draft, account, {
        objectType: "InstrumentDoc",
        objectId: doc.id,
        action: "Mengubah visibilitas berkas",
        note: visibility,
      });
    });
    return { ok: true };
  },

  deleteInstrumentDoc(
    actor: { id?: string; name: string; role?: string },
    indicatorId: string,
  ): ActionResult {
    const account = actor.id ? currentState.users.find((user) => user.id === actor.id) : undefined;
    if (!account || account.status !== "Aktif" || account.roleId !== "validator") {
      return { ok: false, error: "Hanya akun Validator aktif yang dapat menghapus berkas." };
    }
    const target = currentState.instrumentDocs.find((item) => item.indicatorId === indicatorId);
    if (!target) return { ok: false, error: "Berkas indikator belum diunggah." };
    setState((draft) => {
      draft.instrumentDocs = draft.instrumentDocs.filter(
        (item) => item.indicatorId !== indicatorId,
      );
      audit(draft, account, {
        objectType: "InstrumentDoc",
        objectId: target.id,
        action: "Menghapus berkas indikator",
        note: target.fileName,
      });
    });
    return { ok: true };
  },
};

// Pembentuk kandidat temuan/rekomendasi turunan (aturan ilustratif, bukan final).
// Menutup flow terputus: kiriman Diterima selalu punya turunan untuk peta/rekomendasi.
// Usulan ilustratif: 1/2/Tidak memicu temuan per jawaban; bukan aturan ilmiah final.
// Idempoten: lewati bila turunan sudah ada (mis. seed).
function ensureDerivedWork(
  draft: IshasState,
  report: Report,
  severity: Severity,
  priority: Priority,
): void {
  if (
    draft.findings.some((f) => f.reportId === report.id) ||
    draft.recommendations.some((r) => r.reportId === report.id)
  ) {
    return;
  }
  const snapshot = draft.selfAssessmentSnapshots.find((s) => s.reportId === report.id);
  // D-24: pemicu dari opsi beku dulu; fallback bank live; terakhir versi warisan.
  const frozenById = new Map((snapshot?.frozenIndicators ?? []).map((f) => [f.id, f]));
  const liveById = new Map(
    draft.instrument.dimensions.flatMap((d) => d.indicators.map((i) => [i.id, i] as const)),
  );
  const legacyById = new Map(
    (draft.instrumentVersions
      .find((version) => version.id === report.instrumentVersionId)
      ?.dimensions.flatMap((dimension) => dimension.indicators) ?? []
    ).map((i) => [i.id, i] as const),
  );
  const candidates = snapshot
    ? Object.entries(snapshot.answers).filter(([id, answer]) => {
        const frozen = frozenById.get(id);
        if (frozen) return isJawabanTemuan(frozen, answer.value);
        const live = liveById.get(id);
        if (live) return isJawabanTemuan(live, answer.value);
        const legacy = legacyById.get(id);
        const type = legacy?.answerType;
        return type === "likert-1-5"
          ? ["1", "2"].includes(answer.value)
          : type === "likert-1-2-tidak"
            ? ["1", "Tidak"].includes(answer.value)
            : type === "boolean-ya-tidak" && answer.value === "Tidak";
      })
    : [];
  if (snapshot && !candidates.length) return;
  const sources = candidates.length ? candidates : ([["", undefined]] as const);
  for (const [sourceAnswerId, sourceAnswer] of sources) {
    const area = draft.areas.find(
      (a) =>
        a.id === (sourceAnswer?.areaId ?? report.areaId ?? "") &&
        a.institutionCode === report.institutionCode,
    );
    const manualLocation = sourceAnswer?.manualLocation?.trim() ?? report.manualLocation ?? "";
    const locationSnapshot =
      sourceAnswer?.locationSnapshot ??
      (report.channel === "lapor-cepat" ? report.locationSnapshot : undefined) ??
      snapshotLocation(draft, report.institutionCode, area?.id, manualLocation);
    const building = draft.buildings.find((b) => b.id === area?.buildingId);
    const location = `${locationSnapshot.locationText}${locationSnapshot.floorNote ? ` · ${locationSnapshot.floorNote}` : ""}`;
    const indicator =
      frozenById.get(sourceAnswerId) ?? liveById.get(sourceAnswerId) ?? legacyById.get(sourceAnswerId);
    const issue = indicator ? indicator.title : report.title;
    const n = draft.findings.filter((f) => f.reportId === report.id).length + 1;
    const recommendationId = `REC-${report.id}-${n}`;
    const level = severity === "Belum ditentukan" ? "Sedang" : severity;
    // D-15/D-24: wariskan relasi kategori/aspek dari indikator; lapor-cepat
    // memakai pilihan pelapor bila ada (tanpa menebak dari judul).
    const liveDims = draft.instrument.dimensions;
    const versionDims =
      draft.instrumentVersions.find((v) => v.id === report.instrumentVersionId)?.dimensions ?? [];
    const dimOfIndicator = indicator
      ? (liveDims.find((d) => d.indicators.some((i) => i.id === indicator.id)) ??
        versionDims.find((d) => d.indicators.some((i) => i.id === indicator.id)))
      : undefined;
    draft.findings.push({
      id: `RSK-${report.id}-${n}`,
      reportId: report.id,
      sourceAnswerId: sourceAnswerId || undefined,
      locationSnapshot: structuredClone(locationSnapshot),
      areaId: area?.id ?? "",
      buildingId: building?.id ?? "",
      instrumentVersion: report.instrumentVersionId ?? "Tidak menggunakan instrumen",
      categoryId: (indicator?.categoryId ??
        dimOfIndicator?.categoryId ??
        report.categoryId) as RiskFinding["categoryId"],
      aspectId: indicator?.aspectId ?? report.aspectId,
      recommendationId,
      location,
      building: building?.name ?? "—",
      zone: area?.zone ?? "—",
      floor: area?.floor ?? "—",
      x: locationSnapshot.point?.x ?? 0, // legacy display fields; null snapshot remains unplaced
      y: locationSnapshot.point?.y ?? 0,
      level,
      issue,
      indicator:
        report.channel === "penilaian-mandiri"
          ? sourceAnswerId || report.instrumentVersionId || "Instrumen"
          : (report.indicatorId ?? "Tidak menggunakan instrumen"),
      recommendation: `Kaji hasil validasi ${report.id} dan susun rencana tindak lanjut.`,
      status: "Belum ditindaklanjuti",
      hazard: "Menunggu kajian Pesantren",
      impact: "Menunggu kajian Pesantren",
      likelihood: "Belum dinilai",
      severityText: level,
      exposedPeople: "Menunggu kajian Pesantren",
      existingControl: "—",
      evidence: sourceAnswer?.evidenceName ?? report.evidenceName ?? "",
      observedAt: report.createdAt,
      planVersion: locationSnapshot.campusPlanVersionId ?? "—",
      residualRisk: "Belum dinilai",
    });
    draft.recommendations.push({
      id: recommendationId,
      reportId: report.id,
      priority: priority === "Belum ditentukan" ? "Sedang" : priority,
      title: `Tindak lanjut: ${issue}`,
      location,
      source:
        report.channel === "penilaian-mandiri"
          ? `${report.instrumentVersionId ?? "INS"} · ${report.id}`
          : `${report.indicatorId ?? "IND-LAPOR-CEPAT"} · ${report.id}`,
      action:
        "Susun rencana tindakan (PIC + tenggat + catatan), laksanakan, lalu ajukan verifikasi.",
      status: "Belum ditindaklanjuti",
      owner: "",
      dueDate: "",
      progress: 0,
    });
  }
}

function archiveCompletedDraft(report: Report, reason: string): ActionResult {
  if (report.handlingStatus !== "Completed" || report.archivedAt) {
    return {
      ok: false,
      error: "Hanya laporan Completed yang belum diarsipkan yang dapat diarsipkan.",
    };
  }
  report.archivedAt = nowIso();
  report.archivedReason = reason.trim();
  return { ok: true };
}

function setStateReport(
  actor: { id?: string; name: string; role?: string },
  reportId: string,
  mutate: (draft: IshasState, report: Report) => ActionResult,
): ActionResult {
  let result: ActionResult = { ok: true };
  setState((draft) => {
    const report = draft.reports.find((r) => r.id === reportId);
    if (!report) {
      result = { ok: false, error: "Laporan tidak ditemukan." };
      return;
    }
    const account = actor.id ? draft.users.find((user) => user.id === actor.id) : undefined;
    if (
      !account ||
      account.status !== "Aktif" ||
      account.roleId !== "pesantren" ||
      !account.institutionCodes.includes(report.institutionCode)
    ) {
      result = { ok: false, error: "Anda tidak berwenang mengubah laporan pesantren ini." };
      return;
    }
    result = mutate(draft, report);
  });
  return result;
}

function notifyOwners(draft: IshasState, institutionCode: string, reportId: string): void {
  const owners = draft.users.filter(
    (u) =>
      u.roleId === "pesantren" &&
      u.status === "Aktif" &&
      u.institutionCodes.includes(institutionCode),
  );
  for (const owner of owners) {
    notify(draft, {
      recipientAccountId: owner.id,
      institutionCode,
      sourceObjectId: reportId,
      message: `Laporan baru ${reportId} menunggu validasi.`,
      targetUrl: "/pesantren/validasi-laporan",
    });
  }
}

export function useMockState(): IshasState {
  return useSyncExternalStore(subscribe, getState, getState);
}
