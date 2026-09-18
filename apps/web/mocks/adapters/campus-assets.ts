// Device-local prototype assets, separate from small JSON metadata in localStorage.
const DB = "ishas-campus-assets-v1";
async function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") { reject(new Error("Penyimpanan gambar tidak tersedia di browser ini.")); return; }
    const request = indexedDB.open(DB, 1);
    request.onupgradeneeded = () => request.result.createObjectStore("assets");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error("Penyimpanan gambar tidak dapat dibuka."));
    request.onblocked = () => reject(new Error("Penyimpanan gambar sedang digunakan. Tutup tab demo lain dan coba lagi."));
  });
}
export async function putCampusAsset(id: string, blob: Blob): Promise<void> {
  const db = await database();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("assets", "readwrite");
    transaction.objectStore("assets").put(blob, id);
    transaction.oncomplete = () => { db.close(); resolve(); };
    transaction.onerror = transaction.onabort = () => { db.close(); reject(new Error("Gambar belum tersimpan. Periksa ruang penyimpanan browser.")); };
  });
}
export async function getCampusAsset(id: string): Promise<Blob | undefined> {
  const db = await database();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("assets", "readonly");
    const request = transaction.objectStore("assets").get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error("Gambar tidak dapat dimuat."));
    transaction.oncomplete = () => db.close();
  });
}
export async function deleteCampusAsset(id: string): Promise<void> {
  const db = await database();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("assets", "readwrite");
    transaction.objectStore("assets").delete(id);
    transaction.oncomplete = () => { db.close(); resolve(); };
    transaction.onerror = () => { db.close(); reject(new Error("Gambar sementara tidak dapat dibersihkan.")); };
  });
}
export async function clearCampusAssets(): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  const db = await database();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("assets", "readwrite");
    transaction.objectStore("assets").clear();
    transaction.oncomplete = () => { db.close(); resolve(); };
    transaction.onerror = () => { db.close(); reject(new Error("Gambar demo tidak dapat dibersihkan.")); };
  });
}
