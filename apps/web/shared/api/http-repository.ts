// Repository HTTP — nama method + bentuk return sama `mock-repository.ts`
// untuk scope Fase 1 (lapor-cepat + penilaian-mandiri + unggah bukti).

import type { ActionResult, ReportActor } from "~/mocks/store/mock-store";
import type {
  HandlingStatus,
  LocationSnapshot,
  Priority,
  RiskLevel,
  SelfAssessmentDraft,
  Severity,
} from "~/mocks/types";
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
};
