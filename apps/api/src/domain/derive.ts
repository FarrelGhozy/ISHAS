// Port 1:1 `ensureDerivedWork` (mock-store.ts:3020) — kandidat temuan/rekomendasi
// turunan saat laporan diterima (aturan ilustratif D-04). D-32: hanya `lapor-cepat`;
// penilaian-mandiri tidak menurunkan temuan.

import { isJawabanTemuan } from "../../../web/mocks/instrument-bank";
import { snapshotLocation } from "../../../web/mocks/processors/campus-map";
import type {
  IshasState,
  Priority,
  Recommendation,
  Report,
  RiskFinding,
  Severity,
} from "../../../web/mocks/types";

export function deriveWork(
  state: IshasState,
  report: Report,
  severity: Severity,
  priority: Priority,
  finalAction?: string,
): { findings: RiskFinding[]; recommendations: Recommendation[] } {
  if (report.channel !== "lapor-cepat") return { findings: [], recommendations: [] };
  const snapshot = state.selfAssessmentSnapshots.find((s) => s.reportId === report.id);
  const frozenById = new Map((snapshot?.frozenIndicators ?? []).map((f) => [f.id, f]));
  const liveById = new Map(
    state.instrument.dimensions.flatMap((d) => d.indicators.map((i) => [i.id, i] as const)),
  );
  const legacyById = new Map(
    (state.instrumentVersions
      .find((version) => version.id === report.instrumentVersionId)
      ?.dimensions.flatMap((dimension) => dimension.indicators) ?? []
    ).map((i) => [i.id, i] as const),
  );
  const candidates = snapshot
    ? Object.entries(snapshot.answers).filter(([id, answer]) => {
        const frozen = frozenById.get(id);
        if (frozen) return isJawabanTemuan(frozen, answer.value);
        const live = liveById.get(id);
        if (live) return isJawabanTemuan(live, answer.value);
        const legacy = legacyById.get(id);
        const type = legacy?.answerType;
        return type === "likert-1-5"
          ? ["1", "2"].includes(answer.value)
          : type === "likert-1-2-tidak"
            ? ["1", "Tidak"].includes(answer.value)
            : type === "boolean-ya-tidak" && answer.value === "Tidak";
      })
    : [];
  if (snapshot && !candidates.length) return { findings: [], recommendations: [] };

  const findings: RiskFinding[] = [];
  const recommendations: Recommendation[] = [];
  const sources = candidates.length ? candidates : ([["", undefined]] as const);
  for (const [sourceAnswerId, sourceAnswer] of sources) {
    const area = state.areas.find(
      (a) =>
        a.id === (sourceAnswer?.areaId ?? report.areaId ?? "") &&
        a.institutionCode === report.institutionCode,
    );
    const manualLocation = sourceAnswer?.manualLocation?.trim() ?? report.manualLocation ?? "";
    const locationSnapshot =
      sourceAnswer?.locationSnapshot ??
      (report.channel === "lapor-cepat" ? report.locationSnapshot : undefined) ??
      snapshotLocation(state, report.institutionCode, area?.id, manualLocation);
    const building = state.buildings.find((b) => b.id === area?.buildingId);
    const location = `${locationSnapshot.locationText}${
      locationSnapshot.floorNote ? ` · ${locationSnapshot.floorNote}` : ""
    }`;
    const indicator =
      frozenById.get(sourceAnswerId) ?? liveById.get(sourceAnswerId) ?? legacyById.get(sourceAnswerId);
    const issue = indicator ? indicator.title : report.title;
    const n = findings.length + 1;
    const recommendationId = `REC-${report.id}-${n}`;
    const level = severity === "Belum ditentukan" ? "Sedang" : severity;
    const liveDims = state.instrument.dimensions;
    const versionDims =
      state.instrumentVersions.find((v) => v.id === report.instrumentVersionId)?.dimensions ?? [];
    const dimOfIndicator = indicator
      ? (liveDims.find((d) => d.indicators.some((i) => i.id === indicator.id)) ??
        versionDims.find((d) => d.indicators.some((i) => i.id === indicator.id)))
      : undefined;
    findings.push({
      id: `RSK-${report.id}-${n}`,
      reportId: report.id,
      sourceAnswerId: sourceAnswerId || undefined,
      locationSnapshot: structuredClone(locationSnapshot),
      areaId: area?.id ?? "",
      buildingId: building?.id ?? "",
      instrumentVersion: report.instrumentVersionId ?? "Tidak menggunakan instrumen",
      categoryId: (indicator?.categoryId ??
        dimOfIndicator?.categoryId ??
        report.categoryId) as RiskFinding["categoryId"],
      aspectId: indicator?.aspectId ?? report.aspectId,
      recommendationId,
      location,
      building: building?.name ?? "—",
      zone: area?.zone ?? "—",
      floor: area?.floor ?? "—",
      x: locationSnapshot.point?.x ?? 0,
      y: locationSnapshot.point?.y ?? 0,
      level,
      issue,
      indicator: report.indicatorId ?? "Tidak menggunakan instrumen",
      recommendation:
        finalAction ?? `Kaji hasil validasi ${report.id} dan susun rencana tindak lanjut.`,
      status: "Belum ditindaklanjuti",
      hazard: "Menunggu kajian Pesantren",
      impact: "Menunggu kajian Pesantren",
      likelihood: "Belum dinilai",
      severityText: level,
      exposedPeople: "Menunggu kajian Pesantren",
      existingControl: "—",
      evidence: sourceAnswer?.evidenceName ?? report.evidenceName ?? "",
      observedAt: report.createdAt,
      planVersion: locationSnapshot.campusPlanVersionId ?? "—",
      residualRisk: "Belum dinilai",
    });
    recommendations.push({
      id: recommendationId,
      reportId: report.id,
      priority: priority === "Belum ditentukan" ? "Sedang" : priority,
      title: `Tindak lanjut: ${issue}`,
      location,
      source: `${report.indicatorId ?? "IND-LAPOR-CEPAT"} · ${report.id}`,
      action:
        finalAction ??
        "Susun rencana tindakan (PIC + tenggat + catatan), laksanakan, lalu ajukan verifikasi.",
      status: "Belum ditindaklanjuti",
      owner: "",
      dueDate: "",
      progress: 0,
    });
  }
  return { findings, recommendations };
}
