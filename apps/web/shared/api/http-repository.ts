// Repository HTTP — nama method + bentuk return sama `mock-repository.ts`
// untuk scope Fase 1 (lapor-cepat + penilaian-mandiri + unggah bukti).

import type { ActionResult, ReportActor } from "~/mocks/store/mock-store";
import type { LocationSnapshot, SelfAssessmentDraft } from "~/mocks/types";
import { apiRequest } from "./http-client";

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
};
