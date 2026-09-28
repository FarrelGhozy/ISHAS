// Resolver repository: mock ↔ HTTP berdasarkan `VITE_USE_BACKEND`.
// UI memakai `repository` (bukan `mockRepository`) agar swap transparan per fase.

import { mockRepository } from "~/mocks/adapters/mock-repository";
import { getCampusAsset } from "~/mocks/adapters/campus-assets";
import {
  getState,
  storeActions,
  type ActionResult,
  type ReportActor,
} from "~/mocks/store/mock-store";
import type {
  HandlingStatus,
  InstrumentAnswerType,
  InstrumentOption,
  Priority,
  RiskLevel,
  SamFollowUpStatus,
  SelfAssessmentDraft,
  Severity,
  User,
} from "~/mocks/types";
import { refreshAdminState } from "./admin-state";
import { USE_BACKEND } from "./http-client";
import { refreshPublicState } from "./public-state";
import {
  httpRepository,
  type BankIndicatorInput,
  type LaporInput,
  type MigrateAssetItem,
  type SamAssessmentInput,
  type SamQuestionInput,
  type ValidImportRowInput,
} from "./http-repository";
import { refreshAllWorkspaceStates } from "./workspace-state";

export const repository = {
  // Catatan: selector baca (`registeredInstitutions`, `validatedReports`,
  // `findingsFor`, `recommendationsFor`) hanya valid di mode mock; alihkan baca
  // ke state hook (`usePublicState`/`usePesantrenState`/…) agar tidak terjebak.
  ...mockRepository,
  async submitLaporCepat(actor: ReportActor, input: LaporInput): Promise<ActionResult> {
    if (!USE_BACKEND) return mockRepository.submitLaporCepat(actor, input);
    const result = await httpRepository.submitLaporCepat(actor, input);
    if (result.ok) refreshPublicState();
    return result;
  },
  async uploadReportEvidence(
    actor: ReportActor,
    institutionCode: string,
    file: File,
  ): Promise<ActionResult> {
    return USE_BACKEND
      ? httpRepository.uploadReportEvidence(actor, institutionCode, file)
      : mockRepository.uploadReportEvidence(actor, institutionCode, file);
  },
  async uploadSelfEvidence(
    actor: ReportActor,
    institutionCode: string,
    file: File,
  ): Promise<ActionResult> {
    return USE_BACKEND
      ? httpRepository.uploadSelfEvidence(actor, institutionCode, file)
      : mockRepository.uploadReportEvidence(actor, institutionCode, file);
  },
  async saveSelfAssessmentDraft(input: SelfAssessmentDraft): Promise<ActionResult> {
    if (!USE_BACKEND) return mockRepository.saveSelfAssessmentDraft(input);
    const result = await httpRepository.saveSelfAssessmentDraft(input);
    if (result.ok) refreshPublicState();
    return result;
  },
  async submitSelfAssessment(actor: ReportActor, draftId: string): Promise<ActionResult> {
    if (!USE_BACKEND) return mockRepository.submitSelfAssessment(actor, draftId);
    const result = await httpRepository.submitSelfAssessment(actor, draftId);
    if (result.ok) refreshPublicState();
    return result;
  },
  async deleteSelfAssessmentDraft(draftId: string): Promise<ActionResult> {
    if (!USE_BACKEND) return mockRepository.deleteSelfAssessmentDraft(draftId);
    const result = await httpRepository.deleteSelfAssessmentDraft(draftId);
    if (result.ok) refreshPublicState();
    return result;
  },

  // --- Ruang kerja Pesantren (Fase 2) ---
  async acceptReport(
    actor: ReportActor,
    reportId: string,
    severity: Severity,
    priority: Priority,
    note?: string,
    rekomendasiFinal?: string,
  ): Promise<ActionResult> {
    return USE_BACKEND
      ? httpRepository.acceptReport(actor, reportId, severity, priority, note, rekomendasiFinal)
      : storeActions.acceptReport(actor, reportId, severity, priority, note, rekomendasiFinal);
  },
  async rejectReport(actor: ReportActor, reportId: string, reason: string): Promise<ActionResult> {
    return USE_BACKEND
      ? httpRepository.rejectReport(actor, reportId, reason)
      : storeActions.rejectReport(actor, reportId, reason);
  },
  async updateHandlingStatus(
    actor: ReportActor,
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
    return USE_BACKEND
      ? httpRepository.updateHandlingStatus(actor, reportId, next, details)
      : storeActions.updateHandlingStatus(actor, reportId, next, details);
  },
  async archiveCompletedReport(
    actor: ReportActor,
    reportId: string,
    reason: string,
  ): Promise<ActionResult> {
    return USE_BACKEND
      ? httpRepository.archiveCompletedReport(actor, reportId, reason)
      : storeActions.archiveCompletedReport(actor, reportId, reason);
  },
  async setFindingLevel(
    actor: ReportActor,
    findingId: string,
    level: RiskLevel,
  ): Promise<ActionResult> {
    return USE_BACKEND
      ? httpRepository.setFindingLevel(actor, findingId, level)
      : storeActions.setFindingLevel(actor, findingId, level);
  },
  async addBuilding(
    actor: ReportActor,
    input: { code: string; name: string },
  ): Promise<ActionResult> {
    return USE_BACKEND
      ? httpRepository.addBuilding(actor, input)
      : storeActions.addBuilding(actor, input);
  },
  async addFloor(actor: ReportActor, buildingId: string, name: string): Promise<ActionResult> {
    return USE_BACKEND
      ? httpRepository.addFloor(actor, buildingId, name)
      : storeActions.addFloor(actor, buildingId, name);
  },
  async addArea(
    actor: ReportActor,
    input: { buildingId: string; floor: string; name: string; zone: string },
  ): Promise<ActionResult> {
    return USE_BACKEND ? httpRepository.addArea(actor, input) : storeActions.addArea(actor, input);
  },
  async uploadCampusPlan(
    actor: ReportActor,
    input: {
      institutionCode: string;
      file: File;
      width: number;
      height: number;
      expectedActiveId?: string;
      acknowledged: boolean;
    },
  ): Promise<ActionResult> {
    return USE_BACKEND
      ? httpRepository.uploadCampusPlan(actor, input)
      : mockRepository.uploadCampusPlan(actor, input);
  },
  async uploadCompletionEvidence(
    actor: ReportActor,
    institutionCode: string,
    file: File,
  ): Promise<ActionResult> {
    return USE_BACKEND
      ? httpRepository.uploadCompletionEvidence(actor, institutionCode, file)
      : mockRepository.uploadCompletionEvidence(actor, institutionCode, file);
  },
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
    return USE_BACKEND
      ? httpRepository.updateTindakLanjut(actor, recommendationId, input)
      : mockRepository.updateTindakLanjut(actor, recommendationId, input);
  },
  async cancelRecommendation(
    actor: ReportActor,
    recommendationId: string,
    reason: string,
  ): Promise<ActionResult> {
    return USE_BACKEND
      ? httpRepository.cancelRecommendation(actor, recommendationId, reason)
      : storeActions.cancelRecommendation(actor, recommendationId, reason);
  },

  // --- Bank instrumen + dokumen + dataset Validator (Fase 3) ---
  async addBankDimension(name: string, categoryId?: string): Promise<ActionResult> {
    return USE_BACKEND
      ? httpRepository.addBankDimension(name, categoryId)
      : storeActions.addBankDimension(name, categoryId);
  },
  async updateBankDimension(
    id: string,
    patch: { name?: string; categoryId?: string },
  ): Promise<ActionResult> {
    return USE_BACKEND
      ? httpRepository.updateBankDimension(id, patch)
      : storeActions.updateBankDimension(id, patch);
  },
  async deleteBankDimension(id: string): Promise<ActionResult> {
    return USE_BACKEND
      ? httpRepository.deleteBankDimension(id)
      : storeActions.deleteBankDimension(id);
  },
  async addBankIndicator(
    dimensionId: string,
    input: BankIndicatorInput & { answerType: InstrumentAnswerType },
  ): Promise<ActionResult> {
    return USE_BACKEND
      ? httpRepository.addBankIndicator(dimensionId, input)
      : storeActions.addBankIndicator(dimensionId, input);
  },
  async updateBankIndicator(
    id: string,
    patch: Partial<BankIndicatorInput>,
  ): Promise<ActionResult> {
    return USE_BACKEND
      ? httpRepository.updateBankIndicator(id, patch)
      : storeActions.updateBankIndicator(id, patch);
  },
  async deleteBankIndicator(id: string): Promise<ActionResult> {
    return USE_BACKEND
      ? httpRepository.deleteBankIndicator(id)
      : storeActions.deleteBankIndicator(id);
  },
  async setBankIndicatorOptions(
    id: string,
    options: InstrumentOption[],
    weight?: number,
  ): Promise<ActionResult> {
    return USE_BACKEND
      ? httpRepository.setBankIndicatorOptions(id, options, weight)
      : storeActions.setBankIndicatorOptions(id, options, weight);
  },
  async uploadInstrumentDoc(
    actor: ReportActor,
    indicatorId: string,
    file: File,
    visibility: "Public" | "Privat",
  ): Promise<ActionResult> {
    return USE_BACKEND
      ? httpRepository.uploadInstrumentDoc(actor, indicatorId, file, visibility)
      : mockRepository.uploadInstrumentDoc(actor, indicatorId, file, visibility);
  },
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
    return USE_BACKEND
      ? httpRepository.createInstrumentDoc(actor, input, file)
      : mockRepository.createInstrumentDoc(actor, input, file);
  },
  async openInstrumentDoc(
    viewer: { id?: string },
    indicatorId: string,
  ): Promise<{ ok: true; blob: Blob; fileName: string } | { ok: false; error: string }> {
    return USE_BACKEND
      ? httpRepository.openInstrumentDoc(viewer, indicatorId)
      : mockRepository.openInstrumentDoc(viewer, indicatorId);
  },
  async removeInstrumentDoc(actor: ReportActor, indicatorId: string): Promise<ActionResult> {
    return USE_BACKEND
      ? httpRepository.removeInstrumentDoc(actor, indicatorId)
      : mockRepository.removeInstrumentDoc(actor, indicatorId);
  },
  async setInstrumentDocVisibility(
    actor: ReportActor,
    indicatorId: string,
    visibility: "Public" | "Privat",
  ): Promise<ActionResult> {
    return USE_BACKEND
      ? httpRepository.setInstrumentDocVisibility(actor, indicatorId, visibility)
      : storeActions.setInstrumentDocVisibility(actor, indicatorId, visibility);
  },
  async importResearchDataset(
    actor: ReportActor,
    rows: ValidImportRowInput[],
  ): Promise<ActionResult> {
    return USE_BACKEND
      ? httpRepository.importResearchDataset(actor, rows)
      : storeActions.importResearchDataset(actor, rows);
  },

  // --- SAM-iSAFE Validator (Fase 4) ---
  async addSamCategory(
    actor: ReportActor,
    input: { name: string; description?: string },
  ): Promise<ActionResult> {
    return USE_BACKEND
      ? httpRepository.addSamCategory(actor, input)
      : storeActions.addSamCategory({ id: actor.id }, input);
  },
  async updateSamCategory(
    actor: ReportActor,
    categoryId: string,
    patch: { name?: string; description?: string },
  ): Promise<ActionResult> {
    return USE_BACKEND
      ? httpRepository.updateSamCategory(actor, categoryId, patch)
      : storeActions.updateSamCategory({ id: actor.id }, categoryId, patch);
  },
  async deleteSamCategory(actor: ReportActor, categoryId: string): Promise<ActionResult> {
    return USE_BACKEND
      ? httpRepository.deleteSamCategory(actor, categoryId)
      : storeActions.deleteSamCategory({ id: actor.id }, categoryId);
  },
  async addSamQuestion(actor: ReportActor, input: SamQuestionInput): Promise<ActionResult> {
    return USE_BACKEND
      ? httpRepository.addSamQuestion(actor, input)
      : storeActions.addSamQuestion({ id: actor.id }, input);
  },
  async updateSamQuestion(
    actor: ReportActor,
    questionId: string,
    patch: Partial<SamQuestionInput>,
  ): Promise<ActionResult> {
    return USE_BACKEND
      ? httpRepository.updateSamQuestion(actor, questionId, patch)
      : storeActions.updateSamQuestion({ id: actor.id }, questionId, patch);
  },
  async deleteSamQuestion(actor: ReportActor, questionId: string): Promise<ActionResult> {
    return USE_BACKEND
      ? httpRepository.deleteSamQuestion(actor, questionId)
      : storeActions.deleteSamQuestion({ id: actor.id }, questionId);
  },
  async moveSamQuestion(
    actor: ReportActor,
    questionId: string,
    direction: "naik" | "turun",
  ): Promise<ActionResult> {
    return USE_BACKEND
      ? httpRepository.moveSamQuestion(actor, questionId, direction)
      : storeActions.moveSamQuestion({ id: actor.id }, questionId, direction);
  },
  async setSamQuestionActive(
    actor: ReportActor,
    questionId: string,
    isActive: boolean,
  ): Promise<ActionResult> {
    return USE_BACKEND
      ? httpRepository.setSamQuestionActive(actor, questionId, isActive)
      : storeActions.setSamQuestionActive({ id: actor.id }, questionId, isActive);
  },
  async createSamAssessment(actor: ReportActor, input: SamAssessmentInput): Promise<ActionResult> {
    return USE_BACKEND
      ? httpRepository.createSamAssessment(actor, input)
      : storeActions.createSamAssessment({ id: actor.id }, input);
  },
  async saveSamAnswer(
    actor: ReportActor,
    input: {
      assessmentId: string;
      questionId: string;
      score: number;
      note?: string;
      evidenceName?: string;
      evidenceAssetId?: string;
    },
  ): Promise<ActionResult> {
    return USE_BACKEND
      ? httpRepository.saveSamAnswer(actor, input)
      : storeActions.saveSamAnswer({ id: actor.id }, input);
  },
  async deleteSamDraft(actor: ReportActor, assessmentId: string): Promise<ActionResult> {
    return USE_BACKEND
      ? httpRepository.deleteSamDraft(actor, assessmentId)
      : storeActions.deleteSamDraft({ id: actor.id }, assessmentId);
  },
  async completeSamAssessment(actor: ReportActor, assessmentId: string): Promise<ActionResult> {
    return USE_BACKEND
      ? httpRepository.completeSamAssessment(actor, assessmentId)
      : storeActions.completeSamAssessment({ id: actor.id }, assessmentId);
  },
  async reviewSamAssessment(
    actor: ReportActor,
    assessmentId: string,
    note?: string,
  ): Promise<ActionResult> {
    return USE_BACKEND
      ? httpRepository.reviewSamAssessment(actor, assessmentId, note)
      : storeActions.reviewSamAssessment({ id: actor.id }, assessmentId, note);
  },
  async createSamFollowUp(
    actor: ReportActor,
    input: { assessmentId: string; questionId: string; pic: string; dueDate: string; note?: string },
  ): Promise<ActionResult> {
    return USE_BACKEND
      ? httpRepository.createSamFollowUp(actor, input)
      : storeActions.createSamFollowUp({ id: actor.id }, input);
  },
  async updateSamFollowUp(
    actor: ReportActor,
    followUpId: string,
    input: { status?: SamFollowUpStatus; pic?: string; dueDate?: string; note?: string },
  ): Promise<ActionResult> {
    return USE_BACKEND
      ? httpRepository.updateSamFollowUp(actor, followUpId, input)
      : storeActions.updateSamFollowUp({ id: actor.id }, followUpId, input);
  },
  async cancelSamFollowUp(
    actor: ReportActor,
    followUpId: string,
    reason: string,
  ): Promise<ActionResult> {
    return USE_BACKEND
      ? httpRepository.cancelSamFollowUp(actor, followUpId, reason)
      : storeActions.cancelSamFollowUp({ id: actor.id }, followUpId, reason);
  },
  async uploadSamEvidence(
    actor: ReportActor,
    institutionCode: string,
    file: File,
  ): Promise<ActionResult> {
    return USE_BACKEND
      ? httpRepository.uploadSamEvidence(actor, institutionCode, file)
      : mockRepository.uploadSamEvidence(actor, institutionCode, file);
  },
  async openEvidenceAsset(
    assetId: string,
    institutionCode: string,
  ): Promise<{ ok: true; blob: Blob; name: string } | { ok: false; error: string }> {
    return USE_BACKEND
      ? httpRepository.openEvidenceAsset(assetId)
      : mockRepository.openEvidenceAsset(assetId, institutionCode);
  },
  // Denah: baca blob dari server saat flag aktif, selain itu IndexedDB perangkat.
  async openCampusPlanAsset(assetId: string): Promise<Blob | null> {
    if (USE_BACKEND) return httpRepository.openCampusPlanAsset(assetId);
    return (await getCampusAsset(assetId)) ?? null;
  },

  // --- Super Admin + notifikasi + migrasi aset (Fase 5) ---
  async addInstitution(
    actor: ReportActor,
    input: { name: string; location: string; address?: string; manager?: string; status?: string },
  ): Promise<ActionResult> {
    if (!USE_BACKEND) {
      const state = getState();
      const max = state.institutions.reduce((value, item) => {
        const parsed = Number.parseInt(item.code.replace(/\D+/g, ""), 10);
        return Number.isFinite(parsed) ? Math.max(value, parsed) : value;
      }, 0);
      const code = `PSN-${String(max + 1).padStart(4, "0")}`;
      const r = storeActions.addInstitution({
        code,
        name: input.name,
        location: input.location,
        address: input.address,
        manager: input.manager ?? "",
        assessment: "Belum dimulai",
        status: "Persiapan",
      });
      return r.ok ? { ok: true, id: code } : r;
    }
    const result = await httpRepository.addInstitution(actor, input);
    if (result.ok) refreshAdminState();
    return result;
  },
  async setInstitutionStatus(
    actor: ReportActor,
    code: string,
    status: "Persiapan" | "Aktif" | "Nonaktif",
  ): Promise<ActionResult> {
    if (!USE_BACKEND) return storeActions.setInstitutionStatus(code, status);
    const result = await httpRepository.setInstitutionStatus(actor, code, status);
    if (result.ok) refreshAdminState();
    return result;
  },
  async addUser(
    actor: ReportActor,
    input: { name: string; email: string; roleId: User["roleId"]; institutionCode?: string },
  ): Promise<ActionResult> {
    if (!USE_BACKEND) {
      const state = getState();
      const n = Math.max(0, ...state.users.map((x) => Number(x.id.replace(/\D/g, "")))) + 1;
      const id = `USR-${String(n).padStart(3, "0")}`;
      const lembaga = state.institutions.find((x) => x.code === input.institutionCode);
      const label: User["role"] =
        input.roleId === "admin" ? "Super Admin" : input.roleId === "validator" ? "Validator" : "Pesantren";
      const r = storeActions.addUser({
        id,
        name: input.name,
        email: input.email,
        initials: input.name
          .split(" ")
          .filter(Boolean)
          .map((x) => x[0])
          .join("")
          .slice(0, 2)
          .toUpperCase(),
        role: label,
        roleId: input.roleId,
        institution: input.roleId === "pesantren" ? (lembaga?.name ?? "") : "Seluruh sistem",
        institutionCodes:
          input.roleId === "pesantren" && input.institutionCode ? [input.institutionCode] : [],
        status: "Menunggu",
        lastActive: new Date().toISOString(),
      });
      return r.ok ? { ok: true, id } : r;
    }
    const result = await httpRepository.addUser(actor, input);
    if (result.ok) refreshAdminState();
    return result;
  },
  async updateUser(
    actor: ReportActor,
    userId: string,
    patch: { name: string; email: string; institutionCode?: string },
  ): Promise<ActionResult> {
    if (!USE_BACKEND) {
      return storeActions.updateUser(userId, {
        name: patch.name,
        email: patch.email,
        institutionCode: patch.institutionCode ?? "",
      });
    }
    const result = await httpRepository.updateUser(actor, userId, patch);
    if (result.ok) refreshAdminState();
    return result;
  },
  async setUserStatus(
    actor: ReportActor,
    userId: string,
    status: User["status"],
  ): Promise<ActionResult> {
    if (!USE_BACKEND) return storeActions.setUserStatus(userId, status);
    const result = await httpRepository.setUserStatus(actor, userId, status);
    if (result.ok) refreshAdminState();
    return result;
  },
  async deleteUser(actor: ReportActor, userId: string): Promise<ActionResult> {
    if (!USE_BACKEND) return storeActions.deleteUser(userId);
    const result = await httpRepository.deleteUser(actor, userId);
    if (result.ok) refreshAdminState();
    return result;
  },
  async resetUserPassword(actor: ReportActor, userId: string): Promise<ActionResult> {
    if (!USE_BACKEND) return storeActions.resetUserPassword(userId);
    const result = await httpRepository.resetUserPassword(actor, userId);
    if (result.ok) refreshAdminState();
    return result;
  },
  async markNotificationsRead(actor: ReportActor, ids?: string[]): Promise<ActionResult> {
    if (!USE_BACKEND) {
      return actor.id ? storeActions.markNotificationsRead(actor.id, ids) : { ok: true };
    }
    const result = await httpRepository.markNotificationsRead(ids);
    if (result.ok) refreshAllWorkspaceStates();
    return result;
  },
  async migrateDeviceAssets(
    items: MigrateAssetItem[],
  ): Promise<{ ok: true; imported: number } | { ok: false; error: string }> {
    if (!USE_BACKEND) return { ok: true, imported: 0 };
    const result = await httpRepository.migrateDeviceAssets(items);
    if (result.ok) refreshAllWorkspaceStates();
    return result;
  },
  async migrationStatus(): Promise<{ migrated: boolean; at: string | null }> {
    if (!USE_BACKEND) return { migrated: true, at: null };
    return httpRepository.migrationStatus();
  },
  async reset(): Promise<void> {
    if (!USE_BACKEND) return mockRepository.reset();
    const result = await httpRepository.resetDemo();
    if (!result.ok) throw new Error(result.error);
    refreshAllWorkspaceStates();
    refreshPublicState();
  },
};

export { USE_BACKEND };
