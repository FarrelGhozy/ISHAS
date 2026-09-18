// Adapter repository — kontrak data di depan UI. UI tidak menyentuh store langsung.
// V2-03: pengiriman lapor-cepat diekspos lewat adapter agar validasi + id laporan
// terpusat di satu titik.

import { storeActions, getState, type ActionResult, type ReportActor } from "../store/mock-store";
import {
  selectFindingsByReports,
  selectRecommendationsByReports,
  selectRegisteredInstitutions,
  selectPublicReports,
} from "../store/selectors";
import type { CampusPlanVersion, LocationSnapshot } from "../types";
import { putCampusAsset, deleteCampusAsset, clearCampusAssets } from "./campus-assets";
import { clearEvidenceAssets, deleteEvidenceAsset, getEvidenceAsset, putEvidenceAsset, validateEvidenceFile } from "./report-evidence";
let resettingAssets = false;
let assetEpoch = 0;

export const mockRepository = {
  registeredInstitutions() {
    return selectRegisteredInstitutions(getState());
  },
  validatedReports(institutionCode: string | null) {
    return selectPublicReports(getState(), institutionCode);
  },
  findingsFor(institutionCode: string | null) {
    return selectFindingsByReports(
      getState(),
      selectPublicReports(getState(), institutionCode),
    );
  },
  recommendationsFor(institutionCode: string | null) {
    return selectRecommendationsByReports(
      getState(),
      selectPublicReports(getState(), institutionCode),
    );
  },
  async reset() {
    if (resettingAssets) throw new Error("Reset demo sedang berlangsung.");
    resettingAssets = true;
    assetEpoch += 1;
    try {
      // Commit metadata reset first; on failure existing asset references stay intact.
      storeActions.resetMockData();
      const results = await Promise.allSettled([clearCampusAssets(), clearEvidenceAssets()]);
      if (results.some((result) => result.status === "rejected")) throw new Error("Data demo telah direset, tetapi sebagian gambar belum dapat dibersihkan. Periksa penyimpanan browser lalu ulangi reset.");
    } finally { resettingAssets = false; }
  },
  async uploadCampusPlan(actor: ReportActor, input: Pick<CampusPlanVersion, "institutionCode" | "width" | "height"> & { file: File; expectedActiveId?: string; acknowledged: boolean }): Promise<ActionResult> {
    const assetId = `campus-asset-${crypto.randomUUID()}`;
    const uploadEpoch = assetEpoch;
    try {
      if (resettingAssets) return { ok: false, error: "Reset demo sedang berlangsung. Coba unggah setelah selesai." };
      if (!["image/png", "image/jpeg", "image/webp"].includes(input.file.type) || input.file.size > 5 * 1024 * 1024) return { ok: false, error: "Pilih PNG, JPEG atau WebP maksimum 5 MB." };
      const bitmap = await createImageBitmap(input.file);
      const width = bitmap.width, height = bitmap.height;
      bitmap.close();
      if (Math.min(width, height) < 800) return { ok: false, error: "Sisi pendek denah minimal 800 piksel." };
      await putCampusAsset(assetId, input.file);
      if (resettingAssets || uploadEpoch !== assetEpoch) { await deleteCampusAsset(assetId); return { ok: false, error: "Demo sedang direset. Pilih dan unggah denah kembali." }; }
      const result = storeActions.publishCampusPlan(actor, { institutionCode: input.institutionCode, assetId, width, height, expectedActiveId: input.expectedActiveId, acknowledged: input.acknowledged });
      if (!result.ok) await deleteCampusAsset(assetId);
      return result;
    } catch (error) { return { ok: false, error: error instanceof Error ? error.message : "Gambar gagal dibaca atau disimpan." }; }
  },
  async uploadReportEvidence(actor: ReportActor, institutionCode: string, file: File): Promise<ActionResult> {
    const epoch = assetEpoch;
    try {
      if (resettingAssets) return { ok: false, error: "Reset demo sedang berlangsung. Coba lagi setelah selesai." };
      const state = getState();
      const account = actor.id ? state.users.find((item) => item.id === actor.id) : undefined;
      if (actor.id ? !account || account.status !== "Aktif" || account.roleId !== "pengelola" : actor.role && !["Publik", "Publik / Pelapor"].includes(actor.role)) return { ok: false, error: "Akun ini tidak dapat mengunggah bukti pelaporan." };
      if (!selectRegisteredInstitutions(state).some((item) => item.code === institutionCode)) return { ok: false, error: "Pilih pesantren terdaftar sebelum mengunggah bukti." };
      const error = validateEvidenceFile(file);
      if (error) return { ok: false, error };
      const bitmap = await createImageBitmap(file);
      const pixels = bitmap.width * bitmap.height;
      bitmap.close();
      if (pixels > 20_000_000) return { ok: false, error: "Resolusi gambar terlalu besar. Gunakan gambar maksimal 20 megapiksel." };
      if (resettingAssets || epoch !== assetEpoch) return { ok: false, error: "Demo telah direset. Pilih gambar kembali." };
      const id = `evidence-asset-${crypto.randomUUID()}`;
      await putEvidenceAsset(id, { institutionCode, name: file.name.trim(), blob: file });
      if (resettingAssets || epoch !== assetEpoch) { await deleteEvidenceAsset(id); return { ok: false, error: "Demo telah direset. Pilih gambar kembali." }; }
      return { ok: true, id };
    } catch { return { ok: false, error: "Gambar gagal dibaca atau disimpan. Pilih gambar yang valid dan periksa penyimpanan browser." }; }
  },
  async submitLaporCepat(
    actor: ReportActor,
    input: {
      institutionCode: string;
      reporterName: string;
      title: string;
      description: string;
      areaId?: string;
      manualLocation?: string;
      evidenceName?: string;
      evidenceAssetId?: string;
      contact?: string;
      clientRequestId?: string;
      locationSnapshot?: LocationSnapshot;
    },
  ): Promise<ActionResult> {
    const epoch = assetEpoch;
    try {
      if (resettingAssets) return { ok: false, error: "Reset demo sedang berlangsung. Coba lagi setelah selesai." };
      if (input.evidenceAssetId) {
        const asset = await getEvidenceAsset(input.evidenceAssetId);
        if (!asset || asset.institutionCode !== input.institutionCode || asset.name !== input.evidenceName || validateEvidenceFile({ name: asset.name, size: asset.blob.size, type: asset.blob.type })) return { ok: false, error: "Gambar bukti tidak tersedia atau tidak sesuai. Pilih ulang atau lepas lampiran." };
      }
      if (resettingAssets || epoch !== assetEpoch) return { ok: false, error: "Demo telah direset. Periksa kembali isian dan gambar bukti." };
      return storeActions.submitPublicReport(actor, input);
    } catch { return { ok: false, error: "Gambar bukti tidak dapat diperiksa. Isian tetap tersimpan; coba lagi." }; }
  },
  saveSelfAssessmentDraft(input: {
    id: string;
    institutionCode: string;
    reporterName: string;
    instrumentVersionId: string;
    answers: Record<string, Partial<import("../types").IndicatorAnswer>>;
    activeIndex: number;
    updatedAt: string;
  }): ActionResult {
    return storeActions.saveSelfAssessmentDraft(input);
  },
  submitSelfAssessment(actor: ReportActor, draftId: string): ActionResult {
    return storeActions.submitSelfAssessment(actor, draftId);
  },
  deleteSelfAssessmentDraft(draftId: string): ActionResult {
    return storeActions.deleteSelfAssessmentDraft(draftId);
  },
};
