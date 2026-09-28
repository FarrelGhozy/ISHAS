// Resolver repository: mock ↔ HTTP berdasarkan `VITE_USE_BACKEND`.
// UI memakai `repository` (bukan `mockRepository`) agar swap transparan per fase.

import { mockRepository } from "~/mocks/adapters/mock-repository";
import type { ActionResult, ReportActor } from "~/mocks/store/mock-store";
import type { SelfAssessmentDraft } from "~/mocks/types";
import { USE_BACKEND } from "./http-client";
import { httpRepository, type LaporInput } from "./http-repository";

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
};

export { USE_BACKEND };
