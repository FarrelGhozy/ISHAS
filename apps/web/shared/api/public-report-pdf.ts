// Data PDF satu laporan penilaian-mandiri publik: dari `/public/reports/:id/pdf-data`
// saat `VITE_USE_BACKEND=true`, atau diturunkan dari state mock ketika flag mati.
// Menjaga bentuk data sama agar halaman cetak tidak berubah.

import { useEffect, useState } from "react";
import {
  selectFindingsByReports,
  selectPublicReports,
  selectRecommendationsByReports,
} from "~/mocks/store/selectors";
import { usePublicState } from "./public-state";
import { apiRequest, USE_BACKEND } from "./http-client";
import type {
  Institution,
  Recommendation,
  Report,
  RiskFinding,
  SelfAssessmentSnapshot,
} from "~/mocks/types";

export type PublicReportPdfData = {
  report: Report;
  snapshot: SelfAssessmentSnapshot | null;
  findings: RiskFinding[];
  recommendations: Recommendation[];
  institution: Pick<Institution, "code" | "name" | "location"> | null;
  instrumentLabel: string;
};

function deriveFromState(
  state: ReturnType<typeof usePublicState>,
  reportId: string,
): PublicReportPdfData | null {
  const report = selectPublicReports(state, null).find(
    (r) => r.id === reportId && r.channel === "penilaian-mandiri",
  );
  if (!report) return null;
  const institution = state.institutions.find((i) => i.code === report.institutionCode) ?? null;
  return {
    report,
    snapshot: state.selfAssessmentSnapshots.find((s) => s.reportId === report.id) ?? null,
    findings: selectFindingsByReports(state, [report]),
    recommendations: selectRecommendationsByReports(state, [report]),
    institution,
    instrumentLabel: state.instrument.label,
  };
}

export function usePublicReportPdf(reportId: string | undefined): PublicReportPdfData | null {
  const state = usePublicState();
  const [remote, setRemote] = useState<PublicReportPdfData | null>(null);
  useEffect(() => {
    if (!USE_BACKEND || !reportId) {
      setRemote(null);
      return;
    }
    let alive = true;
    apiRequest<PublicReportPdfData>(
      `/public/reports/${encodeURIComponent(reportId)}/pdf-data`,
    ).then((result) => {
      if (alive && result.ok) setRemote(result.data);
    });
    return () => {
      alive = false;
    };
  }, [reportId]);
  if (USE_BACKEND) return remote;
  return reportId ? deriveFromState(state, reportId) : null;
}
