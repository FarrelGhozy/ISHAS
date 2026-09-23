// Pustaka detail indikator (D-16): blob PDF perangkat-lokal, bukan URL publik/server.
// Metadata di IshasState.instrumentDocs; blob di IndexedDB ini.

export const INSTRUMENT_DOC_MAX_BYTES = 10 * 1024 * 1024;
export const INSTRUMENT_DOC_MIME = "application/pdf";

export type InstrumentDocAsset = { indicatorId: string; name: string; blob: Blob };

const UPLOAD_ID = /^instrument-doc-[0-9a-f-]{36}$/;
const SEED_ID = /^seed-instrument-doc-[A-Z0-9-]+$/;

export function isInstrumentDocAssetId(id: unknown): id is string {
  return typeof id === "string" && (UPLOAD_ID.test(id) || SEED_ID.test(id));
}

export function isSeedInstrumentDocAssetId(id: unknown): boolean {
  return typeof id === "string" && SEED_ID.test(id);
}

export function validateInstrumentDocFile(
  file: Pick<File, "size" | "type" | "name">,
): string | null {
  if (file.type !== INSTRUMENT_DOC_MIME || !file.name.trim().toLowerCase().endsWith(".pdf")) {
    return "Hanya berkas PDF yang didukung.";
  }
  if (file.size <= 0 || file.size > INSTRUMENT_DOC_MAX_BYTES) {
    return "Ukuran PDF harus lebih dari 0 dan maksimal 10 MB.";
  }
  if (!file.name.trim() || file.name.length > 200) {
    return "Nama file harus terisi dan maksimal 200 karakter.";
  }
  return null;
}

/** Periksa header %PDF- pada 5 byte pertama (lapis kedua setelah cek MIME/ekstensi). */
export async function hasPdfHeader(blob: Blob): Promise<boolean> {
  try {
    const head = new Uint8Array(await blob.slice(0, 5).arrayBuffer());
    return (
      head.length === 5 &&
      head[0] === 0x25 && // %
      head[1] === 0x50 && // P
      head[2] === 0x44 && // D
      head[3] === 0x46 && // F
      head[4] === 0x2d // -
    );
  } catch {
    return false;
  }
}

function escapePdfText(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)").slice(0, 500);
}

/** PDF satu halaman untuk seed/demo agar Lihat/Unduh langsung berfungsi tanpa biner bawaan. */
export function buildSeedPdfBlob(code: string, title: string, fileName: string): Blob {
  const lines = [
    "ISHAS — Dokumen detail indikator (data ilustrasi, prototipe frontend).",
    "",
    `Indikator: ${code} — ${title}`,
    `Berkas: ${fileName}`,
    "",
    "Berkas contoh ini dibuat otomatis di browser untuk demo.",
    "Unggah PDF sebenarnya melalui ruang Peneliti untuk menggantinya.",
  ];
  const content = lines
    .map((line, i) => `50 ${780 - i * 22} Td (${escapePdfText(line)}) Tj`)
    .join(" ");
  const stream = `BT /F1 12 Tf ${content} ET`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((body, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n `).join("\n")}\n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new Blob([pdf], { type: INSTRUMENT_DOC_MIME });
}

async function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("Penyimpanan berkas tidak tersedia di browser ini."));
      return;
    }
    const request = indexedDB.open("ishas-instrument-docs-v1", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("assets");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error("Penyimpanan dokumen tidak dapat dibuka."));
    request.onblocked = () =>
      reject(new Error("Penyimpanan dokumen sedang digunakan. Tutup tab demo lain dan coba lagi."));
  });
}

export async function putInstrumentDocAsset(id: string, asset: InstrumentDocAsset): Promise<void> {
  const db = await database();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("assets", "readwrite");
    transaction.objectStore("assets").put(asset, id);
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = transaction.onabort = () => {
      db.close();
      reject(new Error("Berkas belum tersimpan. Periksa ruang dan izin penyimpanan browser."));
    };
  });
}

export async function getInstrumentDocAsset(id: string): Promise<InstrumentDocAsset | undefined> {
  if (!isInstrumentDocAssetId(id) || isSeedInstrumentDocAssetId(id)) return undefined;
  const db = await database();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("assets", "readonly");
    let result: InstrumentDocAsset | undefined;
    const request = transaction.objectStore("assets").get(id);
    request.onsuccess = () => {
      result = request.result;
    };
    transaction.oncomplete = () => {
      db.close();
      resolve(result);
    };
    transaction.onerror = transaction.onabort = () => {
      db.close();
      reject(new Error("Berkas tidak dapat dimuat."));
    };
  });
}

export async function deleteInstrumentDocAsset(id: string): Promise<void> {
  if (!isInstrumentDocAssetId(id) || isSeedInstrumentDocAssetId(id)) return;
  const db = await database();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("assets", "readwrite");
    transaction.objectStore("assets").delete(id);
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = transaction.onabort = () => {
      db.close();
      reject(new Error("Berkas sementara belum dapat dibersihkan."));
    };
  });
}

export async function clearInstrumentDocAssets(): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  const db = await database();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("assets", "readwrite");
    transaction.objectStore("assets").clear();
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = transaction.onabort = () => {
      db.close();
      reject(new Error("Dokumen demo belum dapat dibersihkan."));
    };
  });
}
