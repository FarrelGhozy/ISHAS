import type { IshasState, LocationSnapshot, PlanPoint } from "../types";
import { selectPublicReports, selectRegisteredInstitutions } from "../store/selectors";

export function isValidPoint(point: unknown): point is PlanPoint {
  if (!point || typeof point !== "object") return false;
  const { x, y } = point as PlanPoint;
  return Number.isFinite(x) && Number.isFinite(y) && x >= 0 && x <= 100 && y >= 0 && y <= 100;
}

export function validateMapLocation(state: IshasState, code: string, location?: LocationSnapshot): string | null {
  if (!location) return null; // Legacy / no point remains allowed.
  if (typeof location.locationText !== "string" || typeof location.floorNote !== "string" || location.locationText.length > 200 || location.floorNote.length > 80) return "Keterangan lokasi tidak sah.";
  if (location.areaId && !state.areas.some((area) => area.id === location.areaId && area.institutionCode === code)) return "Area titik tidak sah untuk pesantren ini.";
  if (location.point === null) return null;
  if (!isValidPoint(location.point)) return "Titik lokasi harus berada dalam denah (0–100).";
  const institution = state.institutions.find((item) => item.code === code);
  const plan = state.campusPlans.find((item) => item.id === location.campusPlanVersionId && item.institutionCode === code);
  if (!plan || institution?.activeCampusPlanVersionId !== plan.id) return "Denah telah berubah. Pilih ulang titik pada denah terbaru atau hapus titik.";
  return null;
}

export function snapshotLocation(state: IshasState, code: string, areaId?: string, manualLocation?: string, map?: LocationSnapshot): LocationSnapshot {
  const area = state.areas.find((item) => item.id === areaId && item.institutionCode === code);
  return {
    areaId: area?.id,
    locationText: area?.name ?? manualLocation?.trim() ?? map?.locationText ?? "Lokasi belum tersedia",
    floorNote: map?.floorNote.trim() || area?.floor || "",
    campusPlanVersionId: map?.point ? map.campusPlanVersionId : null,
    point: map?.point ? { ...map.point } : null,
  };
}

export type PublicMapItem = {
  key: string; issue: string; location: string; floor: string;
  level: "Tinggi" | "Sedang" | "Rendah"; status: string;
  point: PlanPoint | null; versionId: string | null; validator: string; pic: string;
};

// Public projection is explicit: never pass raw reports/findings to the map UI.
export function selectPublicCampusMap(state: IshasState, code?: string) {
  if (!code || !selectRegisteredInstitutions(state).some((item) => item.code === code)) return { plans: [], activeId: undefined, items: [] as PublicMapItem[] };
  const plans = state.campusPlans.filter((plan) => plan.institutionCode === code).sort((a, b) => b.revision - a.revision);
  const reports = selectPublicReports(state, code).filter((report) => report.handlingStatus !== "Completed");
  const reportById = new Map(reports.map((report) => [report.id, report]));
  const items: PublicMapItem[] = state.findings.filter((finding) => reportById.has(finding.reportId)).map((finding, index) => {
    const report = reportById.get(finding.reportId)!;
    const location = finding.locationSnapshot;
    const valid = location?.point && isValidPoint(location.point) && plans.some((plan) => plan.id === location.campusPlanVersionId);
    return {
      key: `temuan-${index + 1}`, issue: finding.issue,
      location: location?.locationText ?? finding.location, floor: location?.floorNote ?? finding.floor,
      level: finding.level, status: report.handlingStatus,
      point: valid ? { ...location!.point! } : null, versionId: valid ? location!.campusPlanVersionId : null,
      validator: report.validatedByName ?? state.users.find((user) => user.id === report.validatedBy)?.name ?? "",
      pic: state.recommendations.find((rec) => rec.id === finding.recommendationId)?.owner ?? "",
    };
  });
  return { plans, activeId: state.institutions.find((item) => item.code === code)?.activeCampusPlanVersionId, items };
}

export function clusterMapItems(items: PublicMapItem[], width = 1200, height = 800) {
  const groups: PublicMapItem[][] = [];
  for (const item of items.filter((entry) => entry.point)) {
    const group = groups.find((entries) => Math.hypot((entries[0].point!.x - item.point!.x) * width / 100, (entries[0].point!.y - item.point!.y) * height / 100) < 48);
    if (group) group.push(item); else groups.push([item]);
  }
  return groups;
}
