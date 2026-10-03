// Cache pratinjau bukti per perangkat (D-27: foto hanya tersedia di perangkat
// pengunggah). Setelah unggah, file lokal dipetakan ke `assetId` agar
// `EvidencePreview` menampilkan gambar dari blob lokal tanpa meminta ulang ke
// server — server memang menolak baca anonim sebelum laporan terbit.

const previews = new Map<string, string>();

export function setEvidencePreview(assetId: string, url: string): void {
  if (!assetId || !url) return;
  const previous = previews.get(assetId);
  if (previous && previous !== url) URL.revokeObjectURL(previous);
  previews.set(assetId, url);
}

export function rememberEvidencePreview(assetId: string, file: File): void {
  setEvidencePreview(assetId, URL.createObjectURL(file));
}

export function getEvidencePreview(assetId?: string): string | undefined {
  if (!assetId) return undefined;
  return previews.get(assetId);
}

export function forgetEvidencePreview(assetId?: string): void {
  if (!assetId) return;
  const url = previews.get(assetId);
  if (url) URL.revokeObjectURL(url);
  previews.delete(assetId);
}
