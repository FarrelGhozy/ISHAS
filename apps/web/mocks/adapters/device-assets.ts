// Fase 5: ekspor seluruh aset blob perangkat (IndexedDB) untuk migrasi ke server.
// Dipakai halaman /admin/pengaturan saat `VITE_USE_BACKEND` aktif.

import type { IshasState } from "../types";
import { getCampusAsset } from "./campus-assets";
import { getInstrumentDocAsset } from "./instrument-docs";
import { getAllEvidenceAssets } from "./report-evidence";

export type DeviceAssetItem = {
  kind: string;
  assetId: string;
  institutionCode?: string;
  ownerRef?: string;
  indicatorId?: string;
  fileName: string;
  mime: string;
  base64: string;
  width?: number;
  height?: number;
  visibility?: "Public" | "Privat";
};

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      resolve(result.includes(",") ? result.slice(result.indexOf(",") + 1) : result);
    };
    reader.onerror = () => reject(new Error("Berkas tidak dapat dibaca."));
    reader.readAsDataURL(blob);
  });
}

function inferMime(name: string, fallback: string): string {
  if (fallback) return fallback;
  const lower = name.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

export async function exportDeviceAssets(state: IshasState): Promise<DeviceAssetItem[]> {
  const items: DeviceAssetItem[] = [];

  for (const plan of state.campusPlans) {
    if (!plan.assetId.startsWith("campus-asset-")) continue;
    const blob = await getCampusAsset(plan.assetId).catch(() => undefined);
    if (!blob) continue;
    items.push({
      kind: "campus-plan",
      assetId: plan.assetId,
      institutionCode: plan.institutionCode,
      fileName: `denah-${plan.institutionCode}.png`,
      mime: inferMime("", blob.type),
      width: plan.width,
      height: plan.height,
      base64: await blobToBase64(blob),
    });
  }

  for (const doc of state.instrumentDocs) {
    if (!doc.assetId.startsWith("instrument-doc-")) continue;
    const asset = await getInstrumentDocAsset(doc.assetId).catch(() => undefined);
    if (!asset) continue;
    items.push({
      kind: "instrument-doc",
      assetId: doc.assetId,
      indicatorId: doc.indicatorId,
      fileName: doc.fileName,
      mime: "application/pdf",
      visibility: doc.visibility,
      base64: await blobToBase64(asset.blob),
    });
  }

  for (const { id, asset } of await getAllEvidenceAssets().catch(() => [])) {
    items.push({
      kind: "report-evidence",
      assetId: id,
      institutionCode: asset.institutionCode,
      fileName: asset.name,
      mime: inferMime(asset.name, asset.blob.type),
      base64: await blobToBase64(asset.blob),
    });
  }

  return items;
}
