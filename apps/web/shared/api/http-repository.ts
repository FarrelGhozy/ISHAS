// Repository HTTP — nama method + bentuk return sama `mock-repository.ts`
// untuk scope Fase 1 (lapor-cepat + penilaian-mandiri + unggah bukti).

import type { ActionResult, ReportActor } from "~/mocks/store/mock-store";
import type {
  HandlingStatus,
  InstrumentAnswerType,
  InstrumentOption,
  LocationSnapshot,
  Priority,
  RiskLevel,
  SamFollowUpStatus,
  SelfAssessmentDraft,
  Severity,
  User,
} from "~/mocks/types";

export type MigrateAssetItem = {
  kind: string;
  assetId: string;
  institutionCode?: string;
  ownerRef?: string;
  indicatorId?: string;
  fileName: string;
  mime: string;
  base64: string;
  width?: number;
  height?: number;
  visibility?: "Public" | "Privat";
};
import { apiBlob, apiRequest } from "./http-client";

export type BankIndicatorInput = {
  code: string;
  title: string;
  prompt: string;
  answerType: InstrumentAnswerType;
  required: boolean;
  evidenceRequired: boolean;
  locationRequired: boolean;
  categoryId?: string;
  aspectId?: string;
};

export type ValidImportRowInput = {
  institutionCode: string;
  reporterName: string;
  scorePercent: number | null;
  title: string;
};

export type SamQuestionInput = {
  categoryId: string;
  text: string;
  panduan?: string;
  contohBukti?: string;
};

export type SamAssessmentInput = {
  institutionCode: string;
  areaId?: string;
  manualLocation?: string;
  observedAt: string;
  observedTime?: string;
  kind: string;
  observerName: string;
  note?: string;
};

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

function toAction(result: { ok: true; data: { id?: string } } | { ok: false; error: string }): ActionResult {
  return result.ok ? { ok: true, id: result.data.id } : { ok: false, error: result.error };
}

export const httpRepository = {
  async submitLaporCepat(_actor: ReportActor, input: LaporInput): Promise<ActionResult> {
    const result = await apiRequest<{ id?: string }>("/reports/lapor-cepat", {
      method: "POST",
      json: input,
      headers: input.clientRequestId ? { "X-Request-Id": input.clientRequestId } : undefined,
    });
    return toAction(result);
  },

  async uploadReportEvidence(
    _actor: ReportActor,
    institutionCode: string,
    file: File,
  ): Promise<ActionResult> {
    const form = new FormData();
    form.append("file", file);
    form.append("institutionCode", institutionCode);
    const result = await apiRequest<{ id: string }>("/uploads/report-evidence", {
      method: "POST",
      form,
    });
    return result.ok ? { ok: true, id: result.data.id } : { ok: false, error: result.error };
  },

  // D-27: bukti foto jawaban penilaian-mandiri (kind `self-evidence`).
  async uploadSelfEvidence(
    _actor: ReportActor,
    institutionCode: string,
    file: File,
  ): Promise<ActionResult> {
    const form = new FormData();
    form.append("file", file);
    form.append("institutionCode", institutionCode);
    const result = await apiRequest<{ id: string }>("/uploads/self-evidence", {
      method: "POST",
      form,
    });
    return result.ok ? { ok: true, id: result.data.id } : { ok: false, error: result.error };
  },

  async saveSelfAssessmentDraft(input: SelfAssessmentDraft): Promise<ActionResult> {
    const result = await apiRequest<{ id?: string }>("/self-assessments/drafts", {
      method: "POST",
      json: input,
    });
    return toAction(result);
  },

  async submitSelfAssessment(_actor: ReportActor, draftId: string): Promise<ActionResult> {
    const result = await apiRequest<{ id?: string }>("/self-assessments/submit", {
      method: "POST",
      json: { draftId },
    });
    return toAction(result);
  },

  async deleteSelfAssessmentDraft(draftId: string): Promise<ActionResult> {
    const result = await apiRequest<{ id?: string }>(
      `/self-assessments/drafts/${encodeURIComponent(draftId)}`,
      { method: "DELETE" },
    );
    return toAction(result);
  },

  // --- Ruang kerja Pesantren (Fase 2) ---
  async acceptReport(
    _actor: ReportActor,
    reportId: string,
    severity: Severity,
    priority: Priority,
    note?: string,
    rekomendasiFinal?: string,
  ): Promise<ActionResult> {
    return toAction(
      await apiRequest(`/pesantren/reports/${encodeURIComponent(reportId)}/accept`, {
        method: "POST",
        json: { severity, priority, note, rekomendasiFinal },
      }),
    );
  },

  async rejectReport(_actor: ReportActor, reportId: string, reason: string): Promise<ActionResult> {
    return toAction(
      await apiRequest(`/pesantren/reports/${encodeURIComponent(reportId)}/reject`, {
        method: "POST",
        json: { reason },
      }),
    );
  },

  async updateHandlingStatus(
    _actor: ReportActor,
    reportId: string,
    next: HandlingStatus,
    details?: {
      owner?: string;
      dueDate?: string;
      progress?: number;
      evidenceName?: string;
      note?: string;
    },
  ): Promise<ActionResult> {
    return toAction(
      await apiRequest(`/pesantren/reports/${encodeURIComponent(reportId)}/status`, {
        method: "POST",
        json: { next, ...details },
      }),
    );
  },

  async archiveCompletedReport(
    _actor: ReportActor,
    reportId: string,
    reason: string,
  ): Promise<ActionResult> {
    return toAction(
      await apiRequest(`/pesantren/reports/${encodeURIComponent(reportId)}/archive`, {
        method: "POST",
        json: { reason },
      }),
    );
  },

  async setFindingLevel(
    _actor: ReportActor,
    findingId: string,
    level: RiskLevel,
  ): Promise<ActionResult> {
    return toAction(
      await apiRequest(`/pesantren/findings/${encodeURIComponent(findingId)}/level`, {
        method: "PATCH",
        json: { level },
      }),
    );
  },

  async addBuilding(
    _actor: ReportActor,
    input: { code: string; name: string },
  ): Promise<ActionResult> {
    return toAction(await apiRequest("/pesantren/buildings", { method: "POST", json: input }));
  },

  async addFloor(_actor: ReportActor, buildingId: string, name: string): Promise<ActionResult> {
    return toAction(
      await apiRequest(`/pesantren/buildings/${encodeURIComponent(buildingId)}/floors`, {
        method: "POST",
        json: { name },
      }),
    );
  },

  async addArea(
    _actor: ReportActor,
    input: { buildingId: string; floor: string; name: string; zone: string },
  ): Promise<ActionResult> {
    return toAction(await apiRequest("/pesantren/areas", { method: "POST", json: input }));
  },

  async uploadCampusPlan(
    _actor: ReportActor,
    input: {
      institutionCode: string;
      file: File;
      width: number;
      height: number;
      expectedActiveId?: string;
      acknowledged: boolean;
    },
  ): Promise<ActionResult> {
    const form = new FormData();
    form.append("file", input.file);
    form.append("institutionCode", input.institutionCode);
    const uploaded = await apiRequest<{ id: string }>("/uploads/campus-plan", {
      method: "POST",
      form,
    });
    if (!uploaded.ok) return { ok: false, error: uploaded.error };
    return toAction(
      await apiRequest("/pesantren/campus-plans/publish", {
        method: "POST",
        json: {
          institutionCode: input.institutionCode,
          assetId: uploaded.data.id,
          width: input.width,
          height: input.height,
          expectedActiveId: input.expectedActiveId,
          acknowledged: input.acknowledged,
        },
      }),
    );
  },

  async uploadCompletionEvidence(
    _actor: ReportActor,
    institutionCode: string,
    file: File,
  ): Promise<ActionResult> {
    const form = new FormData();
    form.append("file", file);
    form.append("institutionCode", institutionCode);
    return toAction(await apiRequest("/uploads/completion-evidence", { method: "POST", form }));
  },

  async updateTindakLanjut(
    _actor: ReportActor,
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
    const id = encodeURIComponent(recommendationId);
    if (input.verify) {
      return toAction(
        await apiRequest(`/pesantren/recommendations/${id}/verify`, {
          method: "POST",
          json: { verify: true, note: input.note },
        }),
      );
    }
    return toAction(
      await apiRequest(`/pesantren/recommendations/${id}/progress`, {
        method: "POST",
        json: {
          owner: input.owner,
          dueDate: input.dueDate,
          note: input.note,
          progress: input.progress,
          evidenceName: input.evidenceName,
          evidenceAssetId: input.evidenceAssetId,
        },
      }),
    );
  },

  async cancelRecommendation(
    _actor: ReportActor,
    recommendationId: string,
    reason: string,
  ): Promise<ActionResult> {
    return toAction(
      await apiRequest(`/pesantren/recommendations/${encodeURIComponent(recommendationId)}/cancel`, {
        method: "POST",
        json: { reason },
      }),
    );
  },

  // --- Bank instrumen + dokumen + dataset Validator (Fase 3) ---
  async addBankDimension(name: string, categoryId?: string): Promise<ActionResult> {
    return toAction(
      await apiRequest("/validator/bank/dimensions", { method: "POST", json: { name, categoryId } }),
    );
  },

  async updateBankDimension(
    id: string,
    patch: { name?: string; categoryId?: string },
  ): Promise<ActionResult> {
    return toAction(
      await apiRequest(`/validator/bank/dimensions/${encodeURIComponent(id)}`, {
        method: "PATCH",
        json: patch,
      }),
    );
  },

  async deleteBankDimension(id: string): Promise<ActionResult> {
    return toAction(
      await apiRequest(`/validator/bank/dimensions/${encodeURIComponent(id)}`, { method: "DELETE" }),
    );
  },

  async addBankIndicator(dimensionId: string, input: BankIndicatorInput): Promise<ActionResult> {
    return toAction(
      await apiRequest("/validator/bank/indicators", {
        method: "POST",
        json: { dimensionId, ...input },
      }),
    );
  },

  async updateBankIndicator(id: string, patch: Partial<BankIndicatorInput>): Promise<ActionResult> {
    return toAction(
      await apiRequest(`/validator/bank/indicators/${encodeURIComponent(id)}`, {
        method: "PATCH",
        json: patch,
      }),
    );
  },

  async deleteBankIndicator(id: string): Promise<ActionResult> {
    return toAction(
      await apiRequest(`/validator/bank/indicators/${encodeURIComponent(id)}`, { method: "DELETE" }),
    );
  },

  async setBankIndicatorOptions(
    id: string,
    options: InstrumentOption[],
    weight?: number,
  ): Promise<ActionResult> {
    return toAction(
      await apiRequest(`/validator/bank/indicators/${encodeURIComponent(id)}/options`, {
        method: "PUT",
        json: { options, weight },
      }),
    );
  },

  async uploadInstrumentDoc(
    _actor: ReportActor,
    indicatorId: string,
    file: File,
    visibility: "Public" | "Privat",
  ): Promise<ActionResult> {
    const uploaded = await httpRepository.uploadInstrumentDocAsset(file);
    if (!uploaded.ok) return { ok: false, error: uploaded.error };
    return toAction(
      await apiRequest(`/validator/docs/${encodeURIComponent(indicatorId)}`, {
        method: "PUT",
        json: {
          fileName: file.name.trim(),
          fileSize: file.size,
          assetId: uploaded.id,
          visibility,
        },
      }),
    );
  },

  async uploadInstrumentDocAsset(file: File): Promise<ActionResult> {
    const form = new FormData();
    form.append("file", file);
    const result = await apiRequest<{ id: string }>("/uploads/instrument-doc", {
      method: "POST",
      form,
    });
    return result.ok ? { ok: true, id: result.data.id } : { ok: false, error: result.error };
  },

  async createInstrumentDoc(
    _actor: ReportActor,
    input: {
      code: string;
      title: string;
      categoryId: string;
      aspectId?: string;
      visibility?: "Public" | "Privat";
    },
    file: File,
  ): Promise<ActionResult> {
    const uploaded = await httpRepository.uploadInstrumentDocAsset(file);
    if (!uploaded.ok) return { ok: false, error: uploaded.error };
    return toAction(
      await apiRequest("/validator/docs", {
        method: "POST",
        json: {
          ...input,
          fileName: file.name.trim(),
          fileSize: file.size,
          assetId: uploaded.id,
        },
      }),
    );
  },

  async openInstrumentDoc(
    _viewer: { id?: string },
    indicatorId: string,
  ): Promise<{ ok: true; blob: Blob; fileName: string } | { ok: false; error: string }> {
    const result = await apiBlob(`/docs/${encodeURIComponent(indicatorId)}/blob`);
    return result.ok
      ? { ok: true, blob: result.blob, fileName: result.fileName }
      : { ok: false, error: result.error };
  },

  async removeInstrumentDoc(_actor: ReportActor, indicatorId: string): Promise<ActionResult> {
    return toAction(
      await apiRequest(`/validator/docs/${encodeURIComponent(indicatorId)}`, { method: "DELETE" }),
    );
  },

  async setInstrumentDocVisibility(
    _actor: ReportActor,
    indicatorId: string,
    visibility: "Public" | "Privat",
  ): Promise<ActionResult> {
    return toAction(
      await apiRequest(`/validator/docs/${encodeURIComponent(indicatorId)}/visibility`, {
        method: "PATCH",
        json: { visibility },
      }),
    );
  },

  async importResearchDataset(
    _actor: ReportActor,
    rows: ValidImportRowInput[],
  ): Promise<ActionResult> {
    return toAction(
      await apiRequest("/validator/dataset/import", { method: "POST", json: { rows, apply: true } }),
    );
  },

  // --- SAM-iSAFE Validator (Fase 4) ---
  async addSamCategory(
    _actor: ReportActor,
    input: { name: string; description?: string },
  ): Promise<ActionResult> {
    return toAction(await apiRequest("/validator/sam/categories", { method: "POST", json: input }));
  },

  async updateSamCategory(
    _actor: ReportActor,
    categoryId: string,
    patch: { name?: string; description?: string },
  ): Promise<ActionResult> {
    return toAction(
      await apiRequest(`/validator/sam/categories/${encodeURIComponent(categoryId)}`, {
        method: "PATCH",
        json: patch,
      }),
    );
  },

  async deleteSamCategory(_actor: ReportActor, categoryId: string): Promise<ActionResult> {
    return toAction(
      await apiRequest(`/validator/sam/categories/${encodeURIComponent(categoryId)}`, {
        method: "DELETE",
      }),
    );
  },

  async addSamQuestion(_actor: ReportActor, input: SamQuestionInput): Promise<ActionResult> {
    return toAction(await apiRequest("/validator/sam/questions", { method: "POST", json: input }));
  },

  async updateSamQuestion(
    _actor: ReportActor,
    questionId: string,
    patch: Partial<SamQuestionInput>,
  ): Promise<ActionResult> {
    return toAction(
      await apiRequest(`/validator/sam/questions/${encodeURIComponent(questionId)}`, {
        method: "PATCH",
        json: patch,
      }),
    );
  },

  async deleteSamQuestion(_actor: ReportActor, questionId: string): Promise<ActionResult> {
    return toAction(
      await apiRequest(`/validator/sam/questions/${encodeURIComponent(questionId)}`, {
        method: "DELETE",
      }),
    );
  },

  async moveSamQuestion(
    _actor: ReportActor,
    questionId: string,
    direction: "naik" | "turun",
  ): Promise<ActionResult> {
    return toAction(
      await apiRequest(`/validator/sam/questions/${encodeURIComponent(questionId)}/move`, {
        method: "POST",
        json: { direction },
      }),
    );
  },

  async setSamQuestionActive(
    _actor: ReportActor,
    questionId: string,
    isActive: boolean,
  ): Promise<ActionResult> {
    return toAction(
      await apiRequest(`/validator/sam/questions/${encodeURIComponent(questionId)}/active`, {
        method: "POST",
        json: { active: isActive },
      }),
    );
  },

  async createSamAssessment(
    _actor: ReportActor,
    input: SamAssessmentInput,
  ): Promise<ActionResult> {
    return toAction(await apiRequest("/validator/sam/assessments", { method: "POST", json: input }));
  },

  async saveSamAnswer(
    _actor: ReportActor,
    input: {
      assessmentId: string;
      questionId: string;
      score: number;
      note?: string;
      evidenceName?: string;
      evidenceAssetId?: string;
    },
  ): Promise<ActionResult> {
    return toAction(
      await apiRequest(
        `/validator/sam/assessments/${encodeURIComponent(input.assessmentId)}/answers`,
        {
          method: "PUT",
          json: {
            questionId: input.questionId,
            score: input.score,
            note: input.note,
            evidenceName: input.evidenceName,
            evidenceAssetId: input.evidenceAssetId,
          },
        },
      ),
    );
  },

  async deleteSamDraft(_actor: ReportActor, assessmentId: string): Promise<ActionResult> {
    return toAction(
      await apiRequest(`/validator/sam/assessments/${encodeURIComponent(assessmentId)}`, {
        method: "DELETE",
      }),
    );
  },

  async completeSamAssessment(_actor: ReportActor, assessmentId: string): Promise<ActionResult> {
    return toAction(
      await apiRequest(`/validator/sam/assessments/${encodeURIComponent(assessmentId)}/complete`, {
        method: "POST",
      }),
    );
  },

  async reviewSamAssessment(
    _actor: ReportActor,
    assessmentId: string,
    note?: string,
  ): Promise<ActionResult> {
    return toAction(
      await apiRequest(`/validator/sam/assessments/${encodeURIComponent(assessmentId)}/review`, {
        method: "POST",
        json: { note },
      }),
    );
  },

  async createSamFollowUp(
    _actor: ReportActor,
    input: { assessmentId: string; questionId: string; pic: string; dueDate: string; note?: string },
  ): Promise<ActionResult> {
    return toAction(
      await apiRequest("/validator/sam/follow-ups", { method: "POST", json: input }),
    );
  },

  async updateSamFollowUp(
    _actor: ReportActor,
    followUpId: string,
    input: { status?: SamFollowUpStatus; pic?: string; dueDate?: string; note?: string },
  ): Promise<ActionResult> {
    return toAction(
      await apiRequest(`/validator/sam/follow-ups/${encodeURIComponent(followUpId)}`, {
        method: "PATCH",
        json: input,
      }),
    );
  },

  async cancelSamFollowUp(
    _actor: ReportActor,
    followUpId: string,
    reason: string,
  ): Promise<ActionResult> {
    return toAction(
      await apiRequest(`/validator/sam/follow-ups/${encodeURIComponent(followUpId)}/cancel`, {
        method: "POST",
        json: { reason },
      }),
    );
  },

  async uploadSamEvidence(
    _actor: ReportActor,
    institutionCode: string,
    file: File,
  ): Promise<ActionResult> {
    const form = new FormData();
    form.append("file", file);
    form.append("institutionCode", institutionCode);
    const result = await apiRequest<{ id: string }>("/uploads/sam-evidence", {
      method: "POST",
      form,
    });
    return result.ok ? { ok: true, id: result.data.id } : { ok: false, error: result.error };
  },

  // Bukti gambar (IndexedDB di mock, server saat backend) untuk pratinjau.
  async openEvidenceAsset(
    assetId: string,
  ): Promise<{ ok: true; blob: Blob; name: string } | { ok: false; error: string }> {
    const result = await apiBlob(`/files/${encodeURIComponent(assetId)}`);
    return result.ok
      ? { ok: true, blob: result.blob, name: result.fileName }
      : { ok: false, error: result.error };
  },

  // Denah publik aktif (D-14) — jalur kanonik `/files/:assetId`.
  async openCampusPlanAsset(assetId: string): Promise<Blob | null> {
    const result = await apiBlob(`/files/${encodeURIComponent(assetId)}`);
    return result.ok ? result.blob : null;
  },

  // --- Super Admin + notifikasi + migrasi aset (Fase 5) ---
  async addInstitution(
    _actor: ReportActor,
    input: { name: string; location: string; address?: string; manager?: string; status?: string },
  ): Promise<ActionResult> {
    return toAction(await apiRequest("/admin/institutions", { method: "POST", json: input }));
  },

  async setInstitutionStatus(
    _actor: ReportActor,
    code: string,
    status: "Persiapan" | "Aktif" | "Nonaktif",
  ): Promise<ActionResult> {
    return toAction(
      await apiRequest(`/admin/institutions/${encodeURIComponent(code)}/status`, {
        method: "POST",
        json: { status },
      }),
    );
  },

  async addUser(
    _actor: ReportActor,
    input: { name: string; email: string; roleId: User["roleId"]; institutionCode?: string },
  ): Promise<ActionResult> {
    return toAction(await apiRequest("/admin/users", { method: "POST", json: input }));
  },

  async updateUser(
    _actor: ReportActor,
    userId: string,
    patch: { name: string; email: string; institutionCode?: string },
  ): Promise<ActionResult> {
    return toAction(
      await apiRequest(`/admin/users/${encodeURIComponent(userId)}`, { method: "PATCH", json: patch }),
    );
  },

  async setUserStatus(
    _actor: ReportActor,
    userId: string,
    status: User["status"],
  ): Promise<ActionResult> {
    return toAction(
      await apiRequest(`/admin/users/${encodeURIComponent(userId)}/status`, {
        method: "POST",
        json: { status },
      }),
    );
  },

  async deleteUser(_actor: ReportActor, userId: string): Promise<ActionResult> {
    return toAction(
      await apiRequest(`/admin/users/${encodeURIComponent(userId)}/delete`, { method: "POST" }),
    );
  },

  async resetUserPassword(_actor: ReportActor, userId: string): Promise<ActionResult> {
    return toAction(
      await apiRequest(`/admin/users/${encodeURIComponent(userId)}/reset-password`, {
        method: "POST",
      }),
    );
  },

  async resetDemo(): Promise<ActionResult> {
    return toAction(await apiRequest("/admin/reset-demo", { method: "POST" }));
  },

  async markNotificationsRead(ids?: string[]): Promise<ActionResult> {
    return toAction(
      await apiRequest("/notifications/read", { method: "POST", json: { ids: ids ?? [] } }),
    );
  },

  async migrateDeviceAssets(
    items: MigrateAssetItem[],
  ): Promise<{ ok: true; imported: number } | { ok: false; error: string }> {
    const result = await apiRequest<{ imported: number }>("/admin/migrate/assets", {
      method: "POST",
      json: { items },
    });
    return result.ok
      ? { ok: true, imported: result.data.imported }
      : { ok: false, error: result.error };
  },

  async migrationStatus(): Promise<{ migrated: boolean; at: string | null }> {
    const result = await apiRequest<{ migrated: boolean; at: string | null }>(
      "/admin/migrate/status",
    );
    return result.ok ? result.data : { migrated: false, at: null };
  },
};
