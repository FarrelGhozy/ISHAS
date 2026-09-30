// Adapter repository — kontrak data di depan UI. UI tidak menyentuh store langsung.
// V2-03: pengiriman lapor-cepat diekspos lewat adapter agar validasi + id laporan
// terpusat di satu titik.

import { storeActions, getState, type ActionResult, type ReportActor } from "../store/mock-store";
import { selectRegisteredInstitutions } from "../store/selectors";
import type { CampusPlanVersion, LocationSnapshot } from "../types";
import { putCampusAsset, deleteCampusAsset, clearCampusAssets } from "./campus-assets";
import {
  clearEvidenceAssets,
  deleteEvidenceAsset,
  getEvidenceAsset,
  putEvidenceAsset,
  validateEvidenceFile,
} from "./report-evidence";
import {
  buildSeedPdfBlob,
  clearInstrumentDocAssets,
  deleteInstrumentDocAsset,
  getInstrumentDocAsset,
  hasPdfHeader,
  isSeedInstrumentDocAssetId,
  putInstrumentDocAsset,
  validateInstrumentDocFile,
} from "./instrument-docs";
let resettingAssets = false;
let assetEpoch = 0;

export const mockRepository = {
  async reset() {
    if (resettingAssets) throw new Error("Reset demo sedang berlangsung.");
    resettingAssets = true;
    assetEpoch += 1;
    try {
      // Commit metadata reset first; on failure existing asset references stay intact.
      storeActions.resetMockData();
      const results = await Promise.allSettled([
        clearCampusAssets(),
        clearEvidenceAssets(),
        clearInstrumentDocAssets(),
      ]);
      if (results.some((result) => result.status === "rejected"))
        throw new Error(
          "Data demo telah direset, tetapi sebagian gambar belum dapat dibersihkan. Periksa penyimpanan browser lalu ulangi reset.",
        );
    } finally {
      resettingAssets = false;
    }
  },
  async uploadCampusPlan(
    actor: ReportActor,
    input: Pick<CampusPlanVersion, "institutionCode" | "width" | "height"> & {
      file: File;
      expectedActiveId?: string;
      acknowledged: boolean;
    },
  ): Promise<ActionResult> {
    const assetId = `campus-asset-${crypto.randomUUID()}`;
    const uploadEpoch = assetEpoch;
    try {
      if (resettingAssets)
        return { ok: false, error: "Reset demo sedang berlangsung. Coba unggah setelah selesai." };
      if (
        !["image/png", "image/jpeg", "image/webp"].includes(input.file.type) ||
        input.file.size > 5 * 1024 * 1024
      )
        return { ok: false, error: "Pilih PNG, JPEG atau WebP maksimum 5 MB." };
      const bitmap = await createImageBitmap(input.file);
      const width = bitmap.width,
        height = bitmap.height;
      bitmap.close();
      if (Math.min(width, height) < 800)
        return { ok: false, error: "Sisi pendek denah minimal 800 piksel." };
      await putCampusAsset(assetId, input.file);
      if (resettingAssets || uploadEpoch !== assetEpoch) {
        await deleteCampusAsset(assetId);
        return { ok: false, error: "Demo sedang direset. Pilih dan unggah denah kembali." };
      }
      const result = storeActions.publishCampusPlan(actor, {
        institutionCode: input.institutionCode,
        assetId,
        width,
        height,
        expectedActiveId: input.expectedActiveId,
        acknowledged: input.acknowledged,
      });
      if (!result.ok) await deleteCampusAsset(assetId);
      return result;
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Gambar gagal dibaca atau disimpan.",
      };
    }
  },
  async uploadReportEvidence(
    actor: ReportActor,
    institutionCode: string,
    file: File,
  ): Promise<ActionResult> {
    const epoch = assetEpoch;
    try {
      if (resettingAssets)
        return { ok: false, error: "Reset demo sedang berlangsung. Coba lagi setelah selesai." };
      const state = getState();
      const account = actor.id ? state.users.find((item) => item.id === actor.id) : undefined;
      if (
        actor.id
          ? !account || account.status !== "Aktif" || account.roleId !== "pesantren"
          : actor.role && !["Publik", "Publik / Pelapor"].includes(actor.role)
      )
        return { ok: false, error: "Akun ini tidak dapat mengunggah bukti pelaporan." };
      if (!selectRegisteredInstitutions(state).some((item) => item.code === institutionCode))
        return { ok: false, error: "Pilih pesantren terdaftar sebelum mengunggah bukti." };
      const error = validateEvidenceFile(file);
      if (error) return { ok: false, error };
      const bitmap = await createImageBitmap(file);
      const pixels = bitmap.width * bitmap.height;
      bitmap.close();
      if (pixels > 20_000_000)
        return {
          ok: false,
          error: "Resolusi gambar terlalu besar. Gunakan gambar maksimal 20 megapiksel.",
        };
      if (resettingAssets || epoch !== assetEpoch)
        return { ok: false, error: "Demo telah direset. Pilih gambar kembali." };
      const id = `evidence-asset-${crypto.randomUUID()}`;
      await putEvidenceAsset(id, { institutionCode, name: file.name.trim(), blob: file });
      if (resettingAssets || epoch !== assetEpoch) {
        await deleteEvidenceAsset(id);
        return { ok: false, error: "Demo telah direset. Pilih gambar kembali." };
      }
      return { ok: true, id };
    } catch {
      return {
        ok: false,
        error:
          "Gambar gagal dibaca atau disimpan. Pilih gambar yang valid dan periksa penyimpanan browser.",
      };
    }
  },
  // D-26.e: bukti foto jawaban SAM-iSAFE — pola sama /lapor
  // (PNG/JPEG/WebP, 5 MB/20 MP, blob privat IndexedDB). Hanya Validator aktif.
  async uploadSamEvidence(
    actor: ReportActor,
    institutionCode: string,
    file: File,
  ): Promise<ActionResult> {
    const epoch = assetEpoch;
    try {
      if (resettingAssets)
        return { ok: false, error: "Reset demo sedang berlangsung. Coba lagi setelah selesai." };
      const state = getState();
      const account = actor.id ? state.users.find((item) => item.id === actor.id) : undefined;
      if (!account || account.status !== "Aktif" || account.roleId !== "validator")
        return { ok: false, error: "Hanya Validator aktif yang dapat mengunggah bukti." };
      if (!selectRegisteredInstitutions(state).some((item) => item.code === institutionCode))
        return { ok: false, error: "Pilih pesantren terdaftar sebelum mengunggah bukti." };
      const error = validateEvidenceFile(file);
      if (error) return { ok: false, error };
      const bitmap = await createImageBitmap(file);
      const pixels = bitmap.width * bitmap.height;
      bitmap.close();
      if (pixels > 20_000_000)
        return {
          ok: false,
          error: "Resolusi gambar terlalu besar. Gunakan gambar maksimal 20 megapiksel.",
        };
      if (resettingAssets || epoch !== assetEpoch)
        return { ok: false, error: "Demo telah direset. Pilih gambar kembali." };
      const id = `evidence-asset-${crypto.randomUUID()}`;
      await putEvidenceAsset(id, { institutionCode, name: file.name.trim(), blob: file });
      if (resettingAssets || epoch !== assetEpoch) {
        await deleteEvidenceAsset(id);
        return { ok: false, error: "Demo telah direset. Pilih gambar kembali." };
      }
      return { ok: true, id };
    } catch {
      return {
        ok: false,
        error:
          "Gambar gagal dibaca atau disimpan. Pilih gambar yang valid dan periksa penyimpanan browser.",
      };
    }
  },
  // D-21: bukti penyelesaian tindak lanjut — pola sama /lapor
  // (PNG/JPEG/WebP, 5 MB/20 MP, blob privat IndexedDB). Hanya Pesantren aktif.
  async uploadCompletionEvidence(
    actor: ReportActor,
    institutionCode: string,
    file: File,
  ): Promise<ActionResult> {
    const epoch = assetEpoch;
    try {
      if (resettingAssets)
        return { ok: false, error: "Reset demo sedang berlangsung. Coba lagi setelah selesai." };
      const state = getState();
      const account = actor.id ? state.users.find((item) => item.id === actor.id) : undefined;
      if (!account || account.status !== "Aktif" || account.roleId !== "pesantren")
        return { ok: false, error: "Hanya Pesantren aktif yang dapat mengunggah bukti." };
      if (!account.institutionCodes.includes(institutionCode))
        return { ok: false, error: "Anda tidak berwenang mengunggah bukti pesantren ini." };
      if (!selectRegisteredInstitutions(state).some((item) => item.code === institutionCode))
        return { ok: false, error: "Pilih pesantren terdaftar sebelum mengunggah bukti." };
      const error = validateEvidenceFile(file);
      if (error) return { ok: false, error };
      const bitmap = await createImageBitmap(file);
      const pixels = bitmap.width * bitmap.height;
      bitmap.close();
      if (pixels > 20_000_000)
        return {
          ok: false,
          error: "Resolusi gambar terlalu besar. Gunakan gambar maksimal 20 megapiksel.",
        };
      if (resettingAssets || epoch !== assetEpoch)
        return { ok: false, error: "Demo telah direset. Pilih gambar kembali." };
      const id = `evidence-asset-${crypto.randomUUID()}`;
      await putEvidenceAsset(id, { institutionCode, name: file.name.trim(), blob: file });
      if (resettingAssets || epoch !== assetEpoch) {
        await deleteEvidenceAsset(id);
        return { ok: false, error: "Demo telah direset. Pilih gambar kembali." };
      }
      return { ok: true, id };
    } catch {
      return {
        ok: false,
        error:
          "Gambar gagal dibaca atau disimpan. Pilih gambar yang valid dan periksa penyimpanan browser.",
      };
    }
  },
  // D-21: simpan tindak lanjut dengan validasi blob bukti (bukan nama bebas).
  async updateTindakLanjut(
    actor: ReportActor,
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
  ): Promise<ActionResult> {
    try {
      if (resettingAssets)
        return { ok: false, error: "Reset demo sedang berlangsung. Coba lagi setelah selesai." };
      if (input.evidenceAssetId) {
        if (!/^evidence-asset-[0-9a-f-]{36}$/.test(input.evidenceAssetId))
          return { ok: false, error: "Lampiran bukti tidak sah. Pilih gambar kembali." };
        if (!input.evidenceName?.trim())
          return { ok: false, error: "Nama bukti wajib mengikuti berkas yang diunggah." };
        const asset = await getEvidenceAsset(input.evidenceAssetId);
        const state = getState();
        const rec = state.recommendations.find((item) => item.id === recommendationId);
        const report = rec && state.reports.find((item) => item.id === rec.reportId);
        if (
          !asset ||
          !report ||
          asset.institutionCode !== report.institutionCode ||
          asset.name !== input.evidenceName.trim()
        )
          return {
            ok: false,
            error:
              "Gambar bukti tidak tersedia atau tidak sesuai. Pilih ulang atau lepas lampiran.",
          };
      }
      return storeActions.updateRecommendation(actor, recommendationId, input);
    } catch {
      return {
        ok: false,
        error: "Bukti tidak dapat diperiksa. Catatan tetap tersimpan; coba lagi.",
      };
    }
  },
  // D-16: pustaka detail indikator — hanya Validator aktif yang dapat mengunggah.
  async uploadInstrumentDoc(
    actor: ReportActor,
    indicatorId: string,
    file: File,
    visibility: "Public" | "Privat",
  ): Promise<ActionResult> {
    const epoch = assetEpoch;
    const assetId = `instrument-doc-${crypto.randomUUID()}`;
    try {
      if (resettingAssets)
        return { ok: false, error: "Reset demo sedang berlangsung. Coba lagi setelah selesai." };
      const state = getState();
      const account = actor.id ? state.users.find((item) => item.id === actor.id) : undefined;
      if (!account || account.status !== "Aktif" || account.roleId !== "validator") {
        return { ok: false, error: "Hanya akun Validator aktif yang dapat mengunggah berkas." };
      }
      const invalid = validateInstrumentDocFile(file);
      if (invalid) return { ok: false, error: invalid };
      if (!(await hasPdfHeader(file))) return { ok: false, error: "Berkas bukan PDF yang valid." };
      if (resettingAssets || epoch !== assetEpoch)
        return { ok: false, error: "Demo telah direset. Pilih berkas kembali." };
      await putInstrumentDocAsset(assetId, { indicatorId, name: file.name.trim(), blob: file });
      if (resettingAssets || epoch !== assetEpoch) {
        await deleteInstrumentDocAsset(assetId);
        return { ok: false, error: "Demo telah direset. Pilih berkas kembali." };
      }
      const result = storeActions.upsertInstrumentDoc(
        { id: account.id, name: account.name, role: account.role },
        { indicatorId, fileName: file.name.trim(), fileSize: file.size, assetId, visibility },
      );
      if (!result.ok) await deleteInstrumentDocAsset(assetId);
      return result;
    } catch {
      await deleteInstrumentDocAsset(assetId).catch(() => undefined);
      return {
        ok: false,
        error:
          "Berkas gagal dibaca atau disimpan. Pilih PDF yang valid dan periksa penyimpanan browser.",
      };
    }
  },

  // D-16.g: buat entri dokumen indikator baru (di luar katalog versi).
  async createInstrumentDoc(
    actor: ReportActor,
    input: {
      code: string;
      title: string;
      categoryId: string;
      aspectId?: string;
      visibility?: "Public" | "Privat";
    },
    file: File,
  ): Promise<ActionResult> {
    const epoch = assetEpoch;
    const assetId = `instrument-doc-${crypto.randomUUID()}`;
    try {
      if (resettingAssets)
        return { ok: false, error: "Reset demo sedang berlangsung. Coba lagi setelah selesai." };
      const state = getState();
      const account = actor.id ? state.users.find((item) => item.id === actor.id) : undefined;
      if (!account || account.status !== "Aktif" || account.roleId !== "validator") {
        return { ok: false, error: "Hanya akun Validator aktif yang dapat menambah dokumen." };
      }
      const invalid = validateInstrumentDocFile(file);
      if (invalid) return { ok: false, error: invalid };
      if (!(await hasPdfHeader(file))) return { ok: false, error: "Berkas bukan PDF yang valid." };
      if (resettingAssets || epoch !== assetEpoch)
        return { ok: false, error: "Demo telah direset. Pilih berkas kembali." };
      // indicatorId penampung; selector memakai metadata dokumen untuk entri manual.
      await putInstrumentDocAsset(assetId, {
        indicatorId: "manual",
        name: file.name.trim(),
        blob: file,
      });
      if (resettingAssets || epoch !== assetEpoch) {
        await deleteInstrumentDocAsset(assetId);
        return { ok: false, error: "Demo telah direset. Pilih berkas kembali." };
      }
      const result = storeActions.createInstrumentDocEntry(
        { id: account.id, name: account.name, role: account.role },
        { ...input, fileName: file.name.trim(), fileSize: file.size, assetId },
      );
      if (!result.ok) await deleteInstrumentDocAsset(assetId);
      return result;
    } catch {
      await deleteInstrumentDocAsset(assetId).catch(() => undefined);
      return {
        ok: false,
        error:
          "Berkas gagal dibaca atau disimpan. Pilih PDF yang valid dan periksa penyimpanan browser.",
      };
    }
  },

  // D-16/D-02: blob privat tidak pernah disajikan ke publik — diperiksa di sini,
  // bukan hanya dengan menyembunyikan tombol.
  async openInstrumentDoc(
    viewer: { id?: string },
    indicatorId: string,
  ): Promise<{ ok: true; blob: Blob; fileName: string } | { ok: false; error: string }> {
    const state = getState();
    const doc = state.instrumentDocs.find((item) => item.indicatorId === indicatorId);
    if (!doc || !doc.assetId)
      return { ok: false, error: "Berkas belum tersedia untuk indikator ini." };
    const account = viewer.id ? state.users.find((item) => item.id === viewer.id) : undefined;
    const canOpen =
      doc.visibility === "Public" ||
      (account?.status === "Aktif" && account?.roleId === "validator");
    if (!canOpen) return { ok: false, error: "Berkas Privat hanya dapat dibuka oleh Validator." };
    try {
      if (isSeedInstrumentDocAssetId(doc.assetId)) {
        const found =
          state.instrument.dimensions.flatMap((d) => d.indicators).find((i) => i.id === indicatorId) ??
          state.instrumentVersions
            .flatMap((v) => v.dimensions.flatMap((d) => d.indicators))
            .find((i) => i.id === indicatorId);
        return {
          ok: true,
          blob: buildSeedPdfBlob(found?.code ?? indicatorId, found?.title ?? "", doc.fileName),
          fileName: doc.fileName,
        };
      }
      const asset = await getInstrumentDocAsset(doc.assetId);
      if (!asset)
        return {
          ok: false,
            error: "Berkas tidak tersedia pada perangkat ini. Unggah ulang melalui ruang Validator.",
        };
      return { ok: true, blob: asset.blob, fileName: doc.fileName };
    } catch {
      return { ok: false, error: "Berkas tidak dapat dimuat. Periksa penyimpanan browser." };
    }
  },

  // Pratinjau bukti gambar dari IndexedDB (mock) — pola sama `EvidencePreview`.
  async openEvidenceAsset(
    assetId: string,
    institutionCode: string,
  ): Promise<{ ok: true; blob: Blob; name: string } | { ok: false; error: string }> {
    try {
      const asset = await getEvidenceAsset(assetId);
      if (!asset || asset.institutionCode !== institutionCode) {
        return {
          ok: false,
          error:
            "Gambar bukti tidak tersedia pada perangkat ini. Pilih ulang atau lepas lampiran sebelum mengirim.",
        };
      }
      return { ok: true, blob: asset.blob, name: asset.name };
    } catch {
      return { ok: false, error: "Gambar bukti gagal dimuat. Periksa penyimpanan browser atau coba lagi." };
    }
  },

  async removeInstrumentDoc(actor: ReportActor, indicatorId: string): Promise<ActionResult> {
    const state = getState();
    const doc = state.instrumentDocs.find((item) => item.indicatorId === indicatorId);
    if (!doc) return { ok: false, error: "Berkas indikator belum diunggah." };
    const result = storeActions.deleteInstrumentDoc(actor, indicatorId);
    if (result.ok) await deleteInstrumentDocAsset(doc.assetId).catch(() => undefined);
    return result;
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
    },
  ): Promise<ActionResult> {
    const epoch = assetEpoch;
    try {
      if (resettingAssets)
        return { ok: false, error: "Reset demo sedang berlangsung. Coba lagi setelah selesai." };
      if (input.evidenceAssetId) {
        const asset = await getEvidenceAsset(input.evidenceAssetId);
        if (
          !asset ||
          asset.institutionCode !== input.institutionCode ||
          asset.name !== input.evidenceName ||
          validateEvidenceFile({ name: asset.name, size: asset.blob.size, type: asset.blob.type })
        )
          return {
            ok: false,
            error:
              "Gambar bukti tidak tersedia atau tidak sesuai. Pilih ulang atau lepas lampiran.",
          };
      }
      if (resettingAssets || epoch !== assetEpoch)
        return { ok: false, error: "Demo telah direset. Periksa kembali isian dan gambar bukti." };
      return storeActions.submitPublicReport(actor, input);
    } catch {
      return {
        ok: false,
        error: "Gambar bukti tidak dapat diperiksa. Isian tetap tersimpan; coba lagi.",
      };
    }
  },
  saveSelfAssessmentDraft(input: {
    id: string;
    institutionCode: string;
    reporterName: string;
    contact?: string;
    instrumentVersionId: string;
    instrumentChecksum?: string;
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
