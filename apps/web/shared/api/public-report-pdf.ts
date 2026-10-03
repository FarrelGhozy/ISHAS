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

// Status terpisah agar halaman tidak menampilkan "tidak tersedia" saat masih
// memuat atau saat gagal koneksi.
export type PublicReportPdfState =
  | { status: "loading" }
  | { status: "ready"; data: PublicReportPdfData }
  | { status: "missing" }
  | { status: "error"; message: string };

export function usePublicReportPdf(reportId: string | undefined): PublicReportPdfState {
  const state = usePublicState();
  const [remote, setRemote] = useState<PublicReportPdfState>({ status: "loading" });
  useEffect(() => {
    if (!USE_BACKEND || !reportId) return;
    let alive = true;
    setRemote({ status: "loading" });
    apiRequest<PublicReportPdfData>(
      `/public/reports/${encodeURIComponent(reportId)}/pdf-data`,
    ).then((result) => {
      if (!alive) return;
      if (result.ok) setRemote({ status: "ready", data: result.data });
      else if (result.status === 404) setRemote({ status: "missing" });
      else setRemote({ status: "error", message: result.error });
    });
    return () => {
      alive = false;
    };
  }, [reportId]);
  if (!reportId) return { status: "missing" };
  if (!USE_BACKEND) {
    const data = deriveFromState(state, reportId);
    return data ? { status: "ready", data } : { status: "missing" };
  }
  return remote;
}
