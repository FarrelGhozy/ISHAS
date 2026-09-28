// Validasi + simpan/kirim penilaian-mandiri — port 1:1 `mock-store.ts:1086-1300`.

import { selectRegisteredInstitutions } from "../../../web/mocks/store/selectors";
import { snapshotLocation, validateMapLocation } from "../../../web/mocks/processors/campus-map";
import { BANK_ID, skorLaporanBeku } from "../../../web/mocks/instrument-bank";
import type {
  FrozenIndicator,
  IndicatorAnswer,
  IshasState,
  Report,
  SelfAssessmentDraft,
} from "../../../web/mocks/types";
import type { Actor } from "../router";
import { resolveSender, type Sender } from "./lapor";
import {
  deleteDraft,
  insertAudit,
  insertNotifications,
  insertReport,
  insertSnapshot,
  nextSequence,
  reportIdFrom,
  upsertDraft,
  withTransaction,
} from "../repo/writes";

export type DraftInput = {
  id: string;
  institutionCode: string;
  reporterName: string;
  contact?: string;
  instrumentVersionId: string;
  instrumentChecksum?: string;
  answers: Record<string, Partial<IndicatorAnswer>>;
  activeIndex: number;
  updatedAt: string;
};

export async function saveDraft(
  state: IshasState,
  input: DraftInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (
    input.institutionCode &&
    !selectRegisteredInstitutions(state).some((item) => item.code === input.institutionCode)
  ) {
    return { ok: false, error: "Pesantren tidak tersedia untuk pelaporan." };
  }
  if (!state.instrument || !state.instrument.dimensions.length) {
    return { ok: false, error: "Belum ada instrumen." };
  }
  await withTransaction(async (conn) => {
    await upsertDraft(conn, {
      id: input.id,
      institutionCode: input.institutionCode,
      reporterName: input.reporterName,
      contact: input.contact,
      instrumentVersionId: input.instrumentVersionId || BANK_ID,
      payload: { answers: input.answers, activeIndex: input.activeIndex },
      instrumentChecksum: input.instrumentChecksum ?? state.instrument.checksum,
    });
  });
  return { ok: true };
}

export async function deleteDraftById(
  state: IshasState,
  draftId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!state.selfAssessmentDrafts[draftId]) {
    return { ok: false, error: "Draft tidak ditemukan." };
  }
  await withTransaction(async (conn) => {
    await deleteDraft(conn, draftId);
  });
  return { ok: true };
}

export type SubmitResult = { ok: true; id: string } | { ok: false; error: string };

export async function submitSelfAssessment(
  state: IshasState,
  actor: Actor | null,
  draftId: string,
  extra?: { reporterName?: string; contact?: string },
): Promise<SubmitResult> {
  const senderOrError = resolveSender(state, actor, "penilaian");
  if ("error" in senderOrError) return { ok: false, error: senderOrError.error };
  const sender: Sender = senderOrError;

  const d = state.selfAssessmentDrafts[draftId];
  if (!d) return { ok: false, error: "Draft tidak ditemukan." };
  const instrument = state.instrument;
  if (!instrument || !instrument.dimensions.length) {
    return { ok: false, error: "Belum ada instrumen." };
  }
  if (d.instrumentChecksum && d.instrumentChecksum !== instrument.checksum) {
    return {
      ok: false,
      error: "Instrumen berubah saat Anda mengisi. Buang draft lama dan mulai penilaian baru.",
    };
  }
  const merged: SelfAssessmentDraft = {
    ...d,
    reporterName: extra?.reporterName?.trim() ? extra.reporterName.trim() : d.reporterName,
    contact: extra?.contact?.trim() ? extra.contact.trim() : d.contact,
  };
  const reporterName = merged.reporterName.trim();
  if (
    !selectRegisteredInstitutions(state).some((item) => item.code === merged.institutionCode) ||
    reporterName.length < 2
  ) {
    return { ok: false, error: "Pesantren dan nama pelapor wajib diisi." };
  }
  if (reporterName.length > 100) return { ok: false, error: "Nama maksimal 100 karakter." };
  if ((merged.contact?.trim().length ?? 0) > 100) {
    return { ok: false, error: "Kontak maksimal 100 karakter." };
  }
  const indicators = instrument.dimensions.flatMap((dimension) => dimension.indicators);
  for (const indicator of indicators) {
    const answer = merged.answers[indicator.id];
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
      return {
        ok: false,
        error: "Lengkapi seluruh jawaban, bukti, catatan N/A, dan lokasi yang wajib.",
      };
    }
    if (
      indicator.locationRequired &&
      answer.areaId &&
      !state.areas.some(
        (area) => area.id === answer.areaId && area.institutionCode === merged.institutionCode,
      )
    ) {
      return { ok: false, error: "Area penilaian tidak sah untuk pesantren ini." };
    }
    const mapError = validateMapLocation(state, merged.institutionCode, answer.locationSnapshot);
    if (mapError) return { ok: false, error: mapError };
  }
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
  for (const [k, v] of Object.entries(merged.answers)) {
    builtAnswers[k] = {
      value: v.value ?? "",
      note: v.note ?? "",
      evidenceName: v.evidenceName ?? "",
      evidenceAssetId: v.evidenceAssetId ?? undefined,
      areaId: v.areaId ?? "",
      manualLocation: v.manualLocation?.trim() || undefined,
      planPoint: v.planPoint ?? null,
      locationSnapshot: snapshotLocation(
        state,
        merged.institutionCode,
        v.areaId,
        v.manualLocation,
        v.locationSnapshot,
      ),
    };
  }
  const { scorePercent, byDimension } = skorLaporanBeku(frozen, builtAnswers);
  try {
    return await withTransaction(async (conn) => {
      const deleted = await deleteDraft(conn, draftId);
      if (!deleted) return { ok: false as const, error: "Draft tidak ditemukan." };
      const n = await nextSequence(conn, "report");
      const id = reportIdFrom(n);
      const stampedAt = new Date().toISOString();
      const report: Report = {
        id,
        channel: "penilaian-mandiri",
        institutionCode: merged.institutionCode,
        reporterName,
        reporterUserId: sender.id,
        reporterAccountEmail: sender.email,
        contact: merged.contact?.trim() || undefined,
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
      };
      await insertReport(conn, report);
      await insertSnapshot(conn, {
        reportId: id,
        instrumentVersionId: BANK_ID,
        instrumentChecksum: instrument.checksum,
        submittedAt: stampedAt,
        answers: builtAnswers,
        frozenIndicators: frozen,
        scorePercent,
        byDimension,
      });
      await insertAudit(conn, {
        id: "",
        objectType: "Report",
        objectId: id,
        actorAccountId: sender.id,
        actorName: sender.name || reporterName,
        actorRole: sender.role as never,
        institutionCode: merged.institutionCode,
        action: "Mengirim penilaian mandiri",
        at: stampedAt,
      });
      const owners = state.users.filter(
        (u) =>
          u.roleId === "pesantren" &&
          u.status === "Aktif" &&
          u.institutionCodes.includes(merged.institutionCode),
      );
      await insertNotifications(
        conn,
        owners.map((owner) => ({
          id: "",
          recipientAccountId: owner.id,
          institutionCode: merged.institutionCode,
          sourceObjectId: id,
          message: `Laporan baru ${id} menunggu validasi.`,
          targetUrl: "/pesantren/validasi-laporan",
          at: stampedAt,
          read: false,
        })),
      );
      return { ok: true as const, id };
    });
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Penilaian belum dapat disimpan. Coba lagi.",
    };
  }
}
