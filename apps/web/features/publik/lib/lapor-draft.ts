// Draft lokal form lapor-cepat — bertahan saat refresh (localStorage, per pesantren).
// Key terpisah dari domain (`ishas-mock-v4`) mengikuti usulan SUGGESTIONS §7.
// Kebijakan interim V2-03 (menunggu D-10 final): satu draft per pesantren di perangkat
// ini, tetap ada setelah logout/ganti akun; dibersihkan setelah laporan terkirim.

import { EMPTY_LAPOR_VALUES, type LaporValues } from "./lapor-validation";

const DRAFT_KEY_PREFIX = "ishas-draft-v2:lapor:";

export function laporDraftKey(institutionCode: string | null): string {
  return `${DRAFT_KEY_PREFIX}${institutionCode || "umum"}`;
}

function isStorageAvailable(): boolean {
  return typeof localStorage !== "undefined";
}

export function loadLaporDraft(institutionCode: string | null): LaporValues | null {
  if (!isStorageAvailable()) return null;
  try {
    const raw = localStorage.getItem(laporDraftKey(institutionCode));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<LaporValues>;
    return {
      reporterName: typeof parsed.reporterName === "string" ? parsed.reporterName : "",
      institutionCode:
        typeof parsed.institutionCode === "string" ? parsed.institutionCode : institutionCode ?? "",
      areaId: typeof parsed.areaId === "string" ? parsed.areaId : "",
      manualLocation: typeof parsed.manualLocation === "string" ? parsed.manualLocation : "",
      title: typeof parsed.title === "string" ? parsed.title : "",
      description: typeof parsed.description === "string" ? parsed.description : "",
      evidenceName: typeof parsed.evidenceName === "string" ? parsed.evidenceName : "",
      contact: typeof parsed.contact === "string" ? parsed.contact : "",
    };
  } catch {
    return null;
  }
}

export function saveLaporDraft(institutionCode: string | null, values: LaporValues): boolean {
  if (!isStorageAvailable()) return false;
  try {
    localStorage.setItem(
      laporDraftKey(institutionCode),
      JSON.stringify({ ...values, updatedAt: new Date().toISOString() }),
    );
    return true;
  } catch {
    return false;
  }
}

export function clearLaporDraft(institutionCode: string | null): boolean {
  if (!isStorageAvailable()) return false;
  try {
    localStorage.removeItem(laporDraftKey(institutionCode));
    return true;
  } catch {
    return false;
  }
}

export function isLaporEmpty(values: LaporValues): boolean {
  return (
    values.reporterName.trim() === "" &&
    values.title.trim() === "" &&
    values.description.trim() === "" &&
    values.evidenceName.trim() === "" &&
    values.contact.trim() === "" &&
    values.areaId === ""
    && values.manualLocation.trim() === ""
  );
}

export { EMPTY_LAPOR_VALUES };
