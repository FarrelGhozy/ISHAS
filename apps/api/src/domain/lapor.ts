// Validasi + submit lapor-cepat — port 1:1 `mock-store.ts:236-439`.
// Pesan error dipertahankan persis agar test frontend tetap hijau.

import { selectRegisteredInstitutions } from "../../../web/mocks/store/selectors";
import { snapshotLocation, validateMapLocation } from "../../../web/mocks/processors/campus-map";
import type { IshasState, LocationSnapshot, Report } from "../../../web/mocks/types";
import type { Actor } from "../router";
import { getFileAsset, setFileAssetOwner } from "../repo/files";
import {
  findReportIdByClientRequest,
  insertAudit,
  insertNotifications,
  insertReport,
  nextSequence,
  reportIdFrom,
  withTransaction,
} from "../repo/writes";

export type LaporInput = {
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
  reporterRecommendation?: string;
  evidenceName?: string;
  evidenceAssetId?: string;
  contact?: string;
  clientRequestId?: string;
  locationSnapshot?: LocationSnapshot;
};

export type Sender = { id?: string; name: string; email?: string; role: string };

// Cermin `isEvidenceAssetId` (adapters/report-evidence.ts) tanpa impor modul DOM.
const EVIDENCE_ASSET_RE = /^evidence-asset-[0-9a-f-]{36}$/;

export function resolveSender(
  state: IshasState,
  actor: Actor | null,
  kind: "laporan" | "penilaian",
): Sender | { error: string } {
  if (actor) {
    const account = state.users.find((u) => u.id === actor.id);
    if (!account || account.status !== "Aktif" || account.roleId !== "pesantren") {
      return {
        error:
          kind === "laporan"
            ? "Hanya publik tanpa login dan Pesantren aktif yang dapat mengirim laporan."
            : "Hanya publik tanpa login dan Pesantren aktif yang dapat mengirim penilaian.",
      };
    }
    return { id: account.id, name: account.name, email: account.email, role: account.role };
  }
  return { name: "", role: "Publik" };
}

// Cek bukti hanya bila ada; kembalikan pesan error atau null.
export async function validateEvidence(
  input: Pick<LaporInput, "evidenceAssetId" | "evidenceName" | "institutionCode">,
): Promise<string | null> {
  if (!input.evidenceAssetId) return null;
  const evidenceName = input.evidenceName?.trim() || undefined;
  if (!EVIDENCE_ASSET_RE.test(input.evidenceAssetId) || !evidenceName || evidenceName.length > 200) {
    return "Lampiran bukti tidak sah. Pilih gambar kembali.";
  }
  const asset = await getFileAsset(input.evidenceAssetId);
  if (
    !asset ||
    String(asset.institution_code) !== input.institutionCode ||
    String(asset.original_name) !== evidenceName
  ) {
    return "Gambar bukti tidak tersedia atau tidak sesuai. Pilih ulang atau lepas lampiran.";
  }
  return null;
}

export function validateLapor(
  state: IshasState,
  input: LaporInput,
  evidenceError: string | null,
): string | null {
  const reporterName = input.reporterName?.trim() ?? "";
  const title = input.title?.trim() ?? "";
  const description = input.description?.trim() ?? "";
  const contact = input.contact?.trim() ?? "";
  if (evidenceError) return evidenceError;
  if (reporterName.length < 2) return "Nama minimal 2 karakter.";
  if (reporterName.length > 100) return "Nama maksimal 100 karakter.";

  const registered = new Set(selectRegisteredInstitutions(state).map((i) => i.code));
  if (!input.institutionCode || !registered.has(input.institutionCode)) {
    return "Pesantren tidak tersedia untuk pelaporan.";
  }
  const ownedAreas = state.areas.filter((a) => a.institutionCode === input.institutionCode);
  const manualLocation = input.manualLocation?.trim() || undefined;
  if (!input.areaId && (!manualLocation || manualLocation.length < 3)) {
    return "Pilih area atau tulis lokasi secara manual.";
  }
  if (input.areaId && !ownedAreas.some((a) => a.id === input.areaId)) {
    return "Lokasi/area tidak sah untuk pesantren ini.";
  }
  const bankDims = state.instrument?.dimensions ?? [];
  const legacyDims =
    state.instrumentVersions.find(
      (v) => v.id === state.activeInstrumentVersionId && v.status === "Published",
    )?.dimensions ?? [];
  const refDims = bankDims.length ? bankDims : legacyDims;
  const categoryId = input.categoryId?.trim() || undefined;
  const aspectId = input.aspectId?.trim() || undefined;
  if (aspectId && !categoryId) return "Pilih kategori terlebih dahulu.";
  if (categoryId && refDims.length && !refDims.some((d) => (d.categoryId ?? d.id) === categoryId)) {
    return "Kategori tidak dikenal.";
  }
  if (aspectId && refDims.length) {
    const dim = refDims.find((d) => (d.categoryId ?? d.id) === categoryId);
    if (!dim || !(dim.aspects ?? []).some((a) => a.id === aspectId)) {
      return "Kategori/aspek tidak konsisten.";
    }
  }
  const levels = ["Belum ditentukan", "Tinggi", "Sedang", "Rendah"];
  const reporterSeverity = input.reporterSeverity?.trim() || "Belum ditentukan";
  const reporterPriority = input.reporterPriority?.trim() || "Belum ditentukan";
  if (!levels.includes(reporterSeverity)) return "Usulan tingkat keparahan tidak dikenal.";
  if (!levels.includes(reporterPriority)) return "Usulan prioritas perbaikan tidak dikenal.";
  const reporterRecommendation = input.reporterRecommendation?.trim() || undefined;
  if (reporterRecommendation && reporterRecommendation.length < 10) {
    return "Usulan rekomendasi minimal 10 karakter.";
  }
  if (reporterRecommendation && reporterRecommendation.length > 500) {
    return "Usulan rekomendasi maksimal 500 karakter.";
  }
  const mapError = validateMapLocation(state, input.institutionCode, input.locationSnapshot);
  if (mapError) return mapError;
  if (title.length < 10) return "Judul minimal 10 karakter.";
  if (title.length > 140) return "Judul maksimal 140 karakter.";
  if (description.length < 20) return "Deskripsi minimal 20 karakter.";
  if (contact.length > 100) return "Kontak maksimal 100 karakter.";
  return null;
}

export async function submitLaporCepat(
  state: IshasState,
  sender: Sender,
  input: LaporInput,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const requestKey = input.clientRequestId?.trim() || undefined;
  try {
    return await withTransaction(async (conn) => {
      if (requestKey) {
        const existing = await findReportIdByClientRequest(conn, requestKey);
        if (existing) return { ok: true as const, id: existing };
      }
      const reporterName = input.reporterName?.trim() ?? "";
      const title = input.title?.trim() ?? "";
      const description = input.description?.trim() ?? "";
      const contact = input.contact?.trim() ?? "";
      const manualLocation = input.manualLocation?.trim() || undefined;
      const categoryId = input.categoryId?.trim() || undefined;
      const aspectId = input.aspectId?.trim() || undefined;
      const reporterRecommendation = input.reporterRecommendation?.trim() || undefined;
      const n = await nextSequence(conn, "report");
      const id = reportIdFrom(n);
      const stampedAt = new Date().toISOString();
      const report: Report = {
        id,
        channel: "lapor-cepat",
        institutionCode: input.institutionCode,
        reporterName,
        reporterUserId: sender.id,
        reporterAccountEmail: sender.email,
        categoryId: categoryId as Report["categoryId"],
        aspectId,
        reporterSeverity: (input.reporterSeverity?.trim() ||
          "Belum ditentukan") as Report["reporterSeverity"],
        reporterPriority: (input.reporterPriority?.trim() ||
          "Belum ditentukan") as Report["reporterPriority"],
        reporterRecommendation,
        title,
        description,
        areaId: input.areaId,
        manualLocation,
        locationSnapshot: snapshotLocation(
          state,
          input.institutionCode,
          input.areaId,
          manualLocation,
          input.locationSnapshot,
        ),
        evidenceName: input.evidenceName?.trim() || undefined,
        evidenceAssetId: input.evidenceAssetId,
        contact: contact || undefined,
        validationStatus: "Menunggu validasi",
        severity: "Belum ditentukan",
        priority: "Belum ditentukan",
        handlingStatus: "Menunggu validasi",
        createdAt: stampedAt,
        submittedAt: stampedAt,
        updatedAt: stampedAt,
      };
      await insertReport(conn, report, requestKey);
      if (input.evidenceAssetId) await setFileAssetOwner(conn, input.evidenceAssetId, id);
      await insertAudit(conn, {
        id: "",
        objectType: "Report",
        objectId: id,
        actorAccountId: sender.id,
        actorName: sender.name || reporterName,
        actorRole: sender.role as never,
        institutionCode: input.institutionCode,
        action: "Mengirim laporan publik",
        at: stampedAt,
      });
      const owners = state.users.filter(
        (u) =>
          u.roleId === "pesantren" &&
          u.status === "Aktif" &&
          u.institutionCodes.includes(input.institutionCode),
      );
      await insertNotifications(
        conn,
        owners.map((owner) => ({
          id: "",
          recipientAccountId: owner.id,
          institutionCode: input.institutionCode,
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
      error: error instanceof Error ? error.message : "Laporan belum dapat disimpan. Coba lagi.",
    };
  }
}
