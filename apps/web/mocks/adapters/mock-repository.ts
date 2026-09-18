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
      await clearCampusAssets();
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
  submitLaporCepat(
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
      locationSnapshot?: LocationSnapshot;
    },
  ): ActionResult {
    return storeActions.submitPublicReport(actor, input);
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
