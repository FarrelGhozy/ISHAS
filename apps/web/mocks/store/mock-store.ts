// Store dummy berversi dengan binding React (useSyncExternalStore).
// Action V2-01 versi konsisten: aturan validasi/scope diperiksa, bukan jalur pintas.
// V2-03: submitPublicReport memvalidasi penuh (panjang field, pesantren terdaftar,
// area milik pesantren) + mengembalikan id + idempotency requestId anti kirim-ganda.

import { useSyncExternalStore } from "react";
import type {
  Area,
  Institution,
  Report,
  SelfAssessmentDraft,
  Severity,
  Priority,
  HandlingStatus,
  User,
  Building,
  InstrumentVersion,
} from "../types";
import { loadState, resetState, saveState } from "./state";
import { selectRegisteredInstitutions } from "./selectors";
import type { IshasState } from "../types";

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

export type ActionResult =
  | { ok: true; id?: string }
  | { ok: false; error: string };

export type ReportActor = { id?: string; name: string; email?: string; role?: string };

// Idempotency kirim-ganda (V2-03): requestId yang sama mengembalikan id yang sama
// tanpa membuat record kedua. Disimpan di memori (sesi halaman); draft dibersihkan
// setelah sukses sehingga kiriman baru selalu memakai requestId baru.
const seenReportRequests = new Map<string, string>();

export const storeActions = {
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
      evidenceName?: string;
      contact?: string;
      clientRequestId?: string;
    },
  ): ActionResult {
    // Recheck the account at the data boundary, including direct adapter calls.
    if (actor.id) {
      const account = currentState.users.find((u) => u.id === actor.id);
      if (!account || account.status !== "Aktif" || account.roleId !== "pengelola") {
        return { ok: false, error: "Hanya publik tanpa login dan Pengelola Pesantren aktif yang dapat mengirim laporan." };
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
    if (reporterName.length < 2) {
      return { ok: false, error: "Nama minimal 2 karakter." };
    }
    if (reporterName.length > 100) {
      return { ok: false, error: "Nama maksimal 100 karakter." };
    }
    const registeredCodes = new Set(
      selectRegisteredInstitutions(currentState).map((i) => i.code),
    );
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
        title,
        description,
        areaId: input.areaId,
        manualLocation,
        evidenceName,
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
      return { ok: false, error: error instanceof Error ? error.message : "Laporan belum dapat disimpan. Coba lagi." };
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
    details?: { owner?: string; dueDate?: string; progress?: number; evidenceName?: string; note?: string },
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
        if (!details?.owner || details.owner.trim().length < 2 || !details?.dueDate || !details?.note?.trim()) {
          return { ok: false, error: "PIC, tenggat, dan catatan rencana wajib diisi untuk memulai penanganan." };
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
          return { ok: false, error: "Progres 100%, bukti penyelesaian, dan catatan penutup wajib diisi." };
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
      if ((previous === "Proses" && next === "Pending") || (previous === "Completed" && next === "Proses")) {
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
        action: (next === "Pending" && previous === "Proses") || (next === "Proses" && previous === "Completed") ? "Mengembalikan status" : "Mengubah status penanganan",
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
    if (typeof console !== "undefined" && typeof process !== "undefined" && process.env?.NODE_ENV !== "production") {
      console.warn("[ISHAS] deleteCompletedReport usang — pakai archiveCompletedReport (D-07: arsip, bukan hapus).");
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

  verifyFinding(
    actor: { id?: string; name: string; role?: string },
    findingId: string,
    note: string,
  ): ActionResult {
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
      const recommendation = draft.recommendations.find((item) => item.id === target.recommendationId);
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

  addBuilding(actor: { id?: string; name: string; role?: string }, input: { code: string; name: string }): ActionResult {
    const account = currentState.users.find((item) => item.id === actor.id);
    if (!account || account.status !== "Aktif" || account.roleId !== "pengelola" || account.institutionCodes.length !== 1) return { ok: false, error: "Hanya Pengelola Pesantren aktif yang dapat mengelola lokasi." };
    const code = input.code.trim().toUpperCase(); const name = input.name.trim();
    if (code.length < 2 || name.length < 2) return { ok: false, error: "Kode dan nama gedung minimal 2 karakter." };
    if (currentState.buildings.some((item) => item.institutionCode === account.institutionCodes[0] && item.code === code)) return { ok: false, error: "Kode gedung sudah digunakan." };
    let id = "";
    setState((draft) => { id = `BLD-${String(draft.buildings.length + 1).padStart(3, "0")}`; const building: Building = { id, institutionCode: account.institutionCodes[0], code, name, floors: [{ id: `FLR-${String(draft.buildings.length + 1).padStart(3, "0")}-1`, name: "Lantai 1", planFile: "", planVersion: "", uploadedBy: actor.id ?? "", uploadedAt: nowIso() }] }; draft.buildings.push(building); audit(draft, actor, { objectType: "Building", objectId: id, institutionCode: building.institutionCode, action: "Menambah gedung", note: name }); });
    return { ok: true, id };
  },

  addArea(actor: { id?: string; name: string; role?: string }, input: { buildingId: string; floor: string; name: string; zone: string }): ActionResult {
    const account = currentState.users.find((item) => item.id === actor.id);
    const building = currentState.buildings.find((item) => item.id === input.buildingId);
    if (!account || account.status !== "Aktif" || account.roleId !== "pengelola" || !building || !account.institutionCodes.includes(building.institutionCode)) return { ok: false, error: "Anda tidak berwenang mengelola area ini." };
    if (!input.floor.trim() || input.name.trim().length < 2 || input.zone.trim().length < 2) return { ok: false, error: "Lantai, nama area, dan zona wajib diisi." };
    let id = "";
    setState((draft) => { id = `AREA-${String(draft.areas.length + 1).padStart(3, "0")}`; const area: Area = { id, institutionCode: building.institutionCode, buildingId: building.id, floor: input.floor.trim(), name: input.name.trim(), zone: input.zone.trim(), x: 50, y: 50, width: 14, height: 10 }; draft.areas.push(area); audit(draft, actor, { objectType: "Area", objectId: id, institutionCode: area.institutionCode, action: "Menambah area", note: `${area.floor} · ${area.name}` }); });
    return { ok: true, id };
  },

  addFloor(actor: { id?: string; name: string; role?: string }, buildingId: string, name: string): ActionResult {
    const account = currentState.users.find((item) => item.id === actor.id);
    const building = currentState.buildings.find((item) => item.id === buildingId);
    if (!account || account.status !== "Aktif" || account.roleId !== "pengelola" || !building || !account.institutionCodes.includes(building.institutionCode)) return { ok: false, error: "Anda tidak berwenang mengelola lantai ini." };
    const floorName = name.trim();
    if (floorName.length < 2) return { ok: false, error: "Nama lantai minimal 2 karakter." };
    if (building.floors.some((item) => item.name.toLowerCase() === floorName.toLowerCase())) return { ok: false, error: "Nama lantai sudah ada pada gedung ini." };
    let id = "";
    setState((draft) => { const target = draft.buildings.find((item) => item.id === buildingId)!; id = `FLR-${String(draft.buildings.flatMap((item) => item.floors).length + 1).padStart(3, "0")}`; target.floors.push({ id, name: floorName, planFile: "", planVersion: "", uploadedBy: "", uploadedAt: "" }); audit(draft, actor, { objectType: "Floor", objectId: id, institutionCode: target.institutionCode, action: "Menambah lantai", note: floorName }); });
    return { ok: true, id };
  },

  savePlanVersion(actor: { id?: string; name: string; role?: string }, buildingId: string, floorId: string, fileName: string): ActionResult {
    const account = currentState.users.find((item) => item.id === actor.id); const building = currentState.buildings.find((item) => item.id === buildingId);
    if (!account || account.roleId !== "pengelola" || !building || !account.institutionCodes.includes(building.institutionCode)) return { ok: false, error: "Anda tidak berwenang mengubah denah ini." };
    if (!fileName.trim()) return { ok: false, error: "Nama file denah wajib diisi." };
    setState((draft) => { const target = draft.buildings.find((item) => item.id === buildingId)?.floors.find((item) => item.id === floorId); if (!target) return; const current = Number(target.planVersion.replace(/\D/g, "")) || 0; target.planFile = fileName.trim(); target.planVersion = `DENAH-v${current + 1}`; target.uploadedBy = actor.id ?? ""; target.uploadedAt = nowIso(); target.planHistory = [...(target.planHistory ?? []), { version: target.planVersion, fileName: target.planFile, uploadedBy: target.uploadedBy, uploadedAt: target.uploadedAt }]; audit(draft, actor, { objectType: "FloorPlan", objectId: floorId, institutionCode: building.institutionCode, action: "Menambah versi denah", note: `${target.planVersion} · ${target.planFile}` }); });
    return { ok: true };
  },

  updateRecommendation(actor: { id?: string; name: string; role?: string }, recommendationId: string, input: { owner?: string; dueDate?: string; note: string; progress?: number; evidenceName?: string; verify?: boolean }): ActionResult {
    const recommendation = currentState.recommendations.find((item) => item.id === recommendationId);
    if (!recommendation) return { ok: false, error: "Rekomendasi tidak ditemukan." };
    return setStateReport(actor, recommendation.reportId, (draft, report) => {
      const target = draft.recommendations.find((item) => item.id === recommendationId)!;
      const note = input.note.trim();
      if (!note) return { ok: false, error: "Catatan wajib diisi." };
      // Tindak lanjut hanya untuk laporan tervalidasi yang belum diarsip.
      if (report.validationStatus !== "Diterima" || report.archivedAt) {
        return { ok: false, error: "Tindak lanjut hanya untuk laporan Diterima yang belum diarsipkan." };
      }
      if (input.verify) {
        if (target.status !== "Menunggu verifikasi") return { ok: false, error: "Rekomendasi belum diajukan untuk verifikasi." };
        target.status = "Terverifikasi";
        draft.findings.filter((item) => item.recommendationId === target.id).forEach((item) => { item.status = "Terverifikasi"; });
      } else if (target.status === "Belum ditindaklanjuti") {
        // Satu sumber syarat dengan Pending → Proses (catatan rencana + cek tenggat).
        if (!input.owner || input.owner.trim().length < 2 || !input.dueDate || !note) {
          return { ok: false, error: "PIC, tenggat, dan catatan rencana wajib diisi untuk membuat rencana tindakan." };
        }
        if (input.dueDate < nowIso().slice(0, 10)) {
          return { ok: false, error: "Tenggat tidak boleh berada di masa lalu." };
        }
        target.owner = input.owner.trim(); target.dueDate = input.dueDate; target.status = "Berjalan"; report.handlingStatus = "Proses";
      } else {
        const progress = input.progress;
        if (progress === undefined || progress < 0 || progress > 100) return { ok: false, error: "Progres harus antara 0 dan 100." };
        target.progress = progress;
        if (progress === 100) { if (!input.evidenceName?.trim()) return { ok: false, error: "Bukti penyelesaian wajib diisi saat mengajukan selesai." }; target.completionEvidence = input.evidenceName.trim(); target.status = "Menunggu verifikasi"; }
      }
      target.lastNote = note;
      if (draft.recommendations.filter((item) => item.reportId === report.id).every((item) => item.status === "Terverifikasi")) report.handlingStatus = "Completed";
      audit(draft, actor, { objectType: "Recommendation", objectId: target.id, institutionCode: report.institutionCode, action: input.verify ? "Memverifikasi tindak lanjut" : "Memperbarui tindak lanjut", note });
      return { ok: true };
    });
  },

  saveSelfAssessmentDraft(draftInput: SelfAssessmentDraft): ActionResult {
    // Boundary validation (D-10/D-11): tolak scope tak terdaftar / versi non-Published.
    // Nama dibiarkan fleksibel saat autosave; validasi panjang final ada di submit.
    if (
      draftInput.institutionCode &&
      !selectRegisteredInstitutions(currentState).some(
        (item) => item.code === draftInput.institutionCode,
      )
    ) {
      return { ok: false, error: "Pesantren tidak tersedia untuk pelaporan." };
    }
    const version = currentState.instrumentVersions.find(
      (item) => item.id === draftInput.instrumentVersionId,
    );
    if (!version || version.status !== "Published") {
      return { ok: false, error: "Instrumen Published tidak tersedia." };
    }
    setState((draft) => {
      draft.selfAssessmentDrafts[draftInput.id] = {
        ...draftInput,
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
    // tanpa login + pengelola aktif. UI saja tidak cukup (panggilan adapter langsung).
    let sender: ReportActor = actor;
    if (actor.id) {
      const account = currentState.users.find((u) => u.id === actor.id);
      if (!account || account.status !== "Aktif" || account.roleId !== "pengelola") {
        return { ok: false, error: "Hanya publik tanpa login dan Pengelola Pesantren aktif yang dapat mengirim penilaian." };
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
      const instrument = draft.instrumentVersions.find((item) => item.id === d.instrumentVersionId);
      // D-10: draft terikat versi lama yang sudah diarsip tidak boleh dikirim.
      if (!instrument) { result = { ok: false, error: "Instrumen Published tidak tersedia." }; return; }
      if (instrument.status !== "Published") { result = { ok: false, error: "Versi instrumen draft sudah diarsipkan. Mulai penilaian baru dengan versi Published terbaru." }; return; }
      const reporterName = d.reporterName.trim();
      if (!selectRegisteredInstitutions(draft).some((item) => item.code === d.institutionCode) || reporterName.length < 2) { result = { ok: false, error: "Pesantren dan nama pelapor wajib diisi." }; return; }
      if (reporterName.length > 100) { result = { ok: false, error: "Nama maksimal 100 karakter." }; return; }
      const indicators = instrument.dimensions.flatMap((dimension) => dimension.indicators);
      for (const indicator of indicators) {
        const answer = d.answers[indicator.id];
        const manualLocation = answer?.manualLocation?.trim() ?? "";
        const hasLocation = Boolean(answer?.areaId) || manualLocation.length >= 3;
        if (!answer?.value || (indicator.evidenceRequired && !answer.evidenceName?.trim()) || (indicator.locationRequired && !hasLocation) || (answer.value === "N/A" && (answer.note?.trim().length ?? 0) < 10)) { result = { ok: false, error: "Lengkapi seluruh jawaban, bukti, catatan N/A, dan lokasi yang wajib." }; return; }
        if (indicator.locationRequired && answer.areaId && !draft.areas.some((area) => area.id === answer.areaId && area.institutionCode === d.institutionCode)) { result = { ok: false, error: "Area penilaian tidak sah untuk pesantren ini." }; return; }
      }
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
        title: "Penilaian mandiri K3L",
        description: "Ringkasan jawaban penilaian mandiri terkirim.",
        instrumentVersionId: d.instrumentVersionId,
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
        instrumentVersionId: d.instrumentVersionId,
        submittedAt: nowIso(),
        answers: Object.fromEntries(
          Object.entries(d.answers).map(([k, v]) => [
            k,
            {
              value: v.value ?? "",
              note: v.note ?? "",
              evidenceName: v.evidenceName ?? "",
              areaId: v.areaId ?? "",
              manualLocation: v.manualLocation?.trim() || undefined,
              planPoint: v.planPoint ?? null,
            },
          ]),
        ),
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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "Format email tidak valid." };
    // D-09 (9 Sep 2026): Super Admin dapat membuat Super Admin, Peneliti, Pengelola.
    // Pengelola wajib tepat 1 pesantren Aktif; admin/peneliti tanpa scope lembaga.
    if (user.roleId === "pengelola" && (user.institutionCodes.length !== 1 || !currentState.institutions.some((item) => item.code === user.institutionCodes[0] && item.status === "Aktif"))) return { ok: false, error: "Pengelola wajib terhubung ke satu pesantren aktif." };
    if ((user.roleId === "admin" || user.roleId === "peneliti") && user.institutionCodes.length !== 0) return { ok: false, error: "Super Admin dan Peneliti tidak terikat pesantren." };
    if (getState().users.some((u) => u.email.toLowerCase() === email)) {
      return { ok: false, error: "Email sudah digunakan pada data demo." };
    }
    setState((draft) => {
      draft.users.push({ ...user, name, email });
      audit(draft, { name: "Sistem" }, {
        objectType: "User",
        objectId: user.id,
        action: "Membuat akun pengguna",
      });
    });
    return { ok: true };
  },

  addInstitution(institution: Institution): ActionResult {
    const name = institution.name.trim();
    const location = institution.location.trim();
    if (name.length < 3) return { ok: false, error: "Nama pesantren minimal 3 karakter." };
    if (location.length < 3) return { ok: false, error: "Lokasi minimal 3 karakter." };
    if (currentState.institutions.some((item) => item.name.toLowerCase() === name.toLowerCase())) return { ok: false, error: "Nama pesantren sudah digunakan." };
    setState((draft) => {
      draft.institutions.push({ ...institution, name, location });
      draft.counters.institution += 1;
      audit(draft, { name: "Sistem" }, {
        objectType: "Institution",
        objectId: institution.code,
        action: "Membuat data pesantren",
      });
    });
    return { ok: true };
  },

  setUserStatus(userId: string, status: User["status"]): ActionResult {
    const target = currentState.users.find((item) => item.id === userId);
    if (!target) return { ok: false, error: "Pengguna tidak ditemukan." };
    if (target.roleId === "admin" && status !== "Aktif" && currentState.users.filter((item) => item.roleId === "admin" && item.status === "Aktif").length === 1) return { ok: false, error: "Minimal satu Super Admin harus tetap aktif." };
    setState((draft) => { const user = draft.users.find((item) => item.id === userId)!; user.status = status; audit(draft, { name: "Super Admin" }, { objectType: "User", objectId: userId, action: "Mengubah status pengguna", note: status }); });
    return { ok: true };
  },

  setInstitutionStatus(code: string, status: Institution["status"]): ActionResult {
    const target = currentState.institutions.find((item) => item.code === code);
    if (!target) return { ok: false, error: "Pesantren tidak ditemukan." };
    if (status === "Aktif" && !currentState.users.some((item) => item.roleId === "pengelola" && item.status === "Aktif" && item.institutionCodes.includes(code))) return { ok: false, error: "Tetapkan minimal satu pengelola aktif sebelum aktivasi." };
    setState((draft) => { const institution = draft.institutions.find((item) => item.code === code)!; institution.status = status; audit(draft, { name: "Super Admin" }, { objectType: "Institution", objectId: code, action: "Mengubah status pesantren", note: status }); });
    return { ok: true };
  },

  createInstrumentDraft(sourceId?: string): ActionResult {
    const source = currentState.instrumentVersions.find((item) => item.id === sourceId) ?? currentState.instrumentVersions.find((item) => item.id === currentState.activeInstrumentVersionId);
    if (!source) return { ok: false, error: "Instrumen sumber tidak ditemukan." };
    const versions = currentState.instrumentVersions.map((item) => Number(item.id.match(/v(\d+)\./)?.[1] ?? 0));
    const major = Math.max(...versions, 0) + 1;
    const id = `INS-v${major}.0`;
    const copy: InstrumentVersion = { ...structuredClone(source), id, label: `ISHAS v${major}.0`, status: "Draft", publishedAt: undefined };
    setState((draft) => { draft.instrumentVersions.push(copy); audit(draft, { name: "Peneliti" }, { objectType: "InstrumentVersion", objectId: id, action: "Membuat draft instrumen", note: `Salinan ${source.id}` }); });
    return { ok: true, id };
  },

  addInstrumentDimension(versionId: string, name: string): ActionResult {
    const clean = name.trim();
    if (clean.length < 3) return { ok: false, error: "Nama dimensi minimal 3 karakter." };
    const target = currentState.instrumentVersions.find((v) => v.id === versionId);
    if (!target) return { ok: false, error: "Versi instrumen tidak ditemukan." };
    if (target.status !== "Draft") return { ok: false, error: "Hanya versi Draft yang dapat diubah. Buat versi baru untuk perubahan." };
    let id = "";
    setState((draft) => {
      const version = draft.instrumentVersions.find((v) => v.id === versionId)!;
      const n = version.dimensions.length + 1;
      id = `DIM-${String(n).padStart(2, "0")}`;
      version.dimensions.push({ id, name: clean, indicators: [] });
      audit(draft, { name: "Peneliti" }, { objectType: "InstrumentVersion", objectId: versionId, action: "Menambah dimensi", note: clean });
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
    if (target.status !== "Draft") return { ok: false, error: "Hanya versi Draft yang dapat diubah. Buat versi baru untuk perubahan." };
    if (target.dimensions.flatMap((d) => d.indicators).some((i) => i.code.toLowerCase() === code.toLowerCase())) {
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
        findingTrigger: "ilustrasi: dikaji pengelola saat validasi",
      });
      audit(draft, { name: "Peneliti" }, { objectType: "InstrumentVersion", objectId: versionId, action: "Menambah indikator", note: `${code} · ${title}` });
    });
    const ok = currentState.instrumentVersions
      .find((v) => v.id === versionId)
      ?.dimensions.find((d) => d.id === dimensionId)
      ?.indicators.some((i) => i.id === id);
    if (!ok) return { ok: false, error: "Dimensi tidak ditemukan." };
    return { ok: true, id };
  },

  publishInstrument(id: string): ActionResult {
    const target = currentState.instrumentVersions.find((item) => item.id === id);
    if (!target) return { ok: false, error: "Versi instrumen tidak ditemukan." };
    if (target.status !== "Draft") return { ok: false, error: "Hanya versi Draft yang dapat dipublikasikan." };
    if (!target.dimensions.length || target.dimensions.some((dimension) => !dimension.indicators.length)) return { ok: false, error: "Setiap dimensi wajib memiliki indikator." };
    setState((draft) => { draft.instrumentVersions.forEach((item) => { if (item.status === "Published") item.status = "Archived"; }); const version = draft.instrumentVersions.find((item) => item.id === id)!; version.status = "Published"; version.publishedAt = nowIso(); draft.activeInstrumentVersionId = id; audit(draft, { name: "Peneliti" }, { objectType: "InstrumentVersion", objectId: id, action: "Mempublikasikan instrumen" }); });
    return { ok: true };
  },
};

// Pembentuk kandidat temuan/rekomendasi turunan (aturan ilustratif, bukan final).
// Menutup flow terputus: kiriman Diterima selalu punya turunan untuk peta/rekomendasi.
// Satu pasang per laporan (BUKAN satu per jawaban rendah — aturan pemicu per indikator
// menunggu keputusan ilmiah). Idempoten: lewati bila turunan sudah ada (mis. seed).
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
  const firstAnswer = snapshot
    ? Object.values(snapshot.answers).find((a) => a.areaId || a.manualLocation)
    : undefined;
  const area = draft.areas.find(
    (a) => a.id === (report.areaId ?? firstAnswer?.areaId ?? "") && a.institutionCode === report.institutionCode,
  );
  const manualLocation = report.manualLocation ?? firstAnswer?.manualLocation?.trim() ?? "";
  const building = draft.buildings.find((b) => b.id === area?.buildingId);
  const location = area
    ? `${building?.name ?? "Gedung"} · ${area.floor} · ${area.name}`
    : manualLocation || "Lokasi menyusul";
  const n = draft.findings.filter((f) => f.reportId === report.id).length + 1;
  const recommendationId = `REC-${report.id}-${n}`;
  const level = severity === "Belum ditentukan" ? "Sedang" : severity;
  draft.findings.push({
    id: `RSK-${report.id}-${n}`,
    reportId: report.id,
    areaId: area?.id ?? "",
    buildingId: building?.id ?? "",
    instrumentVersion: report.instrumentVersionId ?? "Tidak menggunakan instrumen",
    recommendationId,
    location,
    building: building?.name ?? "—",
    zone: area?.zone ?? "—",
    floor: area?.floor ?? "—",
    x: area?.x ?? 50,
    y: area?.y ?? 50,
    level,
    issue: report.title,
    indicator: report.channel === "penilaian-mandiri"
      ? (report.instrumentVersionId ?? "Instrumen")
      : "Tidak menggunakan instrumen",
    recommendation: `Kaji hasil validasi ${report.id} dan susun rencana tindak lanjut.`,
    status: "Belum ditindaklanjuti",
    hazard: "Menunggu kajian pengelola",
    impact: "Menunggu kajian pengelola",
    likelihood: "Belum dinilai",
    severityText: level,
    exposedPeople: "Menunggu kajian pengelola",
    existingControl: "—",
    evidence: report.evidenceName ?? "",
    observedAt: report.createdAt,
    planVersion: building?.floors.find((f) => f.name === area?.floor)?.planVersion || "—",
    residualRisk: "Belum dinilai",
  });
  draft.recommendations.push({
    id: recommendationId,
    reportId: report.id,
    priority: priority === "Belum ditentukan" ? "Sedang" : priority,
    title: `Tindak lanjut: ${report.title}`,
    location,
    source: report.channel === "penilaian-mandiri"
      ? `${report.instrumentVersionId ?? "INS"} · ${report.id}`
      : `IND-LAPOR-CEPAT · ${report.id}`,
    action: "Susun rencana tindakan (PIC + tenggat + catatan), laksanakan, lalu ajukan verifikasi.",
    status: "Belum ditindaklanjuti",
    owner: "",
    dueDate: "",
    progress: 0,
  });
}

function archiveCompletedDraft(report: Report, reason: string): ActionResult {
  if (report.handlingStatus !== "Completed" || report.archivedAt) {
    return { ok: false, error: "Hanya laporan Completed yang belum diarsipkan yang dapat diarsipkan." };
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
      account.roleId !== "pengelola" ||
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
      u.roleId === "pengelola" &&
      u.status === "Aktif" &&
      u.institutionCodes.includes(institutionCode),
  );
  for (const owner of owners) {
    notify(draft, {
      recipientAccountId: owner.id,
      institutionCode,
      sourceObjectId: reportId,
      message: `Laporan baru ${reportId} menunggu validasi.`,
      targetUrl: "/pengelola/validasi-laporan",
    });
  }
}

export function useMockState(): IshasState {
  return useSyncExternalStore(subscribe, getState, getState);
}
