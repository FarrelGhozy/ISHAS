// Resolver repository: mock ↔ HTTP berdasarkan `VITE_USE_BACKEND`.
// UI memakai `repository` (bukan `mockRepository`) agar swap transparan per fase.

import { mockRepository } from "~/mocks/adapters/mock-repository";
import { storeActions, type ActionResult, type ReportActor } from "~/mocks/store/mock-store";
import type {
  HandlingStatus,
  InstrumentAnswerType,
  InstrumentOption,
  Priority,
  RiskLevel,
  SelfAssessmentDraft,
  Severity,
} from "~/mocks/types";
import { USE_BACKEND } from "./http-client";
import {
  httpRepository,
  type BankIndicatorInput,
  type LaporInput,
  type ValidImportRowInput,
} from "./http-repository";

export const repository = {
  ...mockRepository,
  async submitLaporCepat(actor: ReportActor, input: LaporInput): Promise<ActionResult> {
    return USE_BACKEND
      ? httpRepository.submitLaporCepat(actor, input)
      : mockRepository.submitLaporCepat(actor, input);
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
  async saveSelfAssessmentDraft(input: SelfAssessmentDraft): Promise<ActionResult> {
    return USE_BACKEND
      ? httpRepository.saveSelfAssessmentDraft(input)
      : mockRepository.saveSelfAssessmentDraft(input);
  },
  async submitSelfAssessment(actor: ReportActor, draftId: string): Promise<ActionResult> {
    return USE_BACKEND
      ? httpRepository.submitSelfAssessment(actor, draftId)
      : mockRepository.submitSelfAssessment(actor, draftId);
  },
  async deleteSelfAssessmentDraft(draftId: string): Promise<ActionResult> {
    return USE_BACKEND
      ? httpRepository.deleteSelfAssessmentDraft(draftId)
      : mockRepository.deleteSelfAssessmentDraft(draftId);
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
};

export { USE_BACKEND };
