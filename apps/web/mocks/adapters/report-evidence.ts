// Bukti privat prototipe: blob perangkat-lokal, bukan URL publik/server.
export const EVIDENCE_MAX_BYTES = 5 * 1024 * 1024;
export const EVIDENCE_TYPES = ["image/png", "image/jpeg", "image/webp"];
export type EvidenceAsset = { institutionCode: string; name: string; blob: Blob };
export function isEvidenceAssetId(id: unknown): id is string {
  return typeof id === "string" && /^evidence-asset-[0-9a-f-]{36}$/.test(id);
}
export function validateEvidenceFile(file: Pick<File, "size" | "type" | "name">): string | null {
  if (!EVIDENCE_TYPES.includes(file.type)) return "Pilih gambar PNG, JPEG atau WebP.";
  if (file.size <= 0 || file.size > EVIDENCE_MAX_BYTES) return "Ukuran gambar harus lebih dari 0 dan maksimal 5 MB.";
  if (!file.name.trim() || file.name.length > 200) return "Nama file harus terisi dan maksimal 200 karakter.";
  return null;
}
async function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") { reject(new Error("Penyimpanan gambar tidak tersedia di browser ini.")); return; }
    const request = indexedDB.open("ishas-report-evidence-v1", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("assets");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error("Penyimpanan bukti tidak dapat dibuka."));
    request.onblocked = () => reject(new Error("Penyimpanan bukti sedang digunakan. Tutup tab demo lain dan coba lagi."));
  });
}
export async function putEvidenceAsset(id: string, asset: EvidenceAsset): Promise<void> {
  const db = await database();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("assets", "readwrite");
    transaction.objectStore("assets").put(asset, id);
    transaction.oncomplete = () => { db.close(); resolve(); };
    transaction.onerror = transaction.onabort = () => { db.close(); reject(new Error("Bukti belum tersimpan. Periksa ruang dan izin penyimpanan browser.")); };
  });
}
export async function getEvidenceAsset(id: string): Promise<EvidenceAsset | undefined> {
  if (!isEvidenceAssetId(id)) return undefined;
  const db = await database();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("assets", "readonly");
    let result: EvidenceAsset | undefined;
    const request = transaction.objectStore("assets").get(id);
    request.onsuccess = () => { result = request.result; };
    transaction.oncomplete = () => { db.close(); resolve(result); };
    transaction.onerror = transaction.onabort = () => { db.close(); reject(new Error("Bukti tidak dapat dimuat.")); };
  });
}
export async function clearEvidenceAssets(): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  const db = await database();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("assets", "readwrite");
    transaction.objectStore("assets").clear();
    transaction.oncomplete = () => { db.close(); resolve(); };
    transaction.onerror = transaction.onabort = () => { db.close(); reject(new Error("Bukti demo belum dapat dibersihkan.")); };
  });
}
export async function deleteEvidenceAsset(id: string): Promise<void> {
  if (!isEvidenceAssetId(id)) return;
  const db = await database();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("assets", "readwrite");
    transaction.objectStore("assets").delete(id);
    transaction.oncomplete = () => { db.close(); resolve(); };
    transaction.onerror = transaction.onabort = () => { db.close(); reject(new Error("Bukti sementara belum dapat dibersihkan.")); };
  });
}
