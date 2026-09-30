// Kompresi gambar bukti di sisi klien sebelum unggah (D-33).
// Foto ponsel sering 3–8 MB; dikompres ke JPEG sisi terpanjang maks 1600 px
// (kualitas 0,8) agar hemat penyimpanan tanpa mengubah alur unggah.
// Aman di lingkungan tanpa `canvas`/`createImageBitmap` (SSR/uji): berkas asli
// dipakai apa adanya.

export const IMAGE_MAX_DIMENSION = 1600;
export const IMAGE_JPEG_QUALITY = 0.8;
export const IMAGE_COMPRESS_MIN_BYTES = 400 * 1024;
export const COMPRESSIBLE_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

// Skala proporsional; hanya menyusut bila sisi terpanjang melewati batas.
export function scaleDimensions(
  width: number,
  height: number,
  maxDimension = IMAGE_MAX_DIMENSION,
): { width: number; height: number } {
  if (width <= 0 || height <= 0) return { width: 0, height: 0 };
  const longest = Math.max(width, height);
  if (longest <= maxDimension) return { width, height };
  const ratio = maxDimension / longest;
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  };
}

// Kompres hanya bila gambar besar (dimensi atau byte); gambar kecil dilewati.
export function shouldCompress(fileSize: number, width: number, height: number): boolean {
  return (
    fileSize > IMAGE_COMPRESS_MIN_BYTES ||
    Math.max(width, height) > IMAGE_MAX_DIMENSION
  );
}

function renameToJpg(name: string): string {
  const base = name.trim() || "bukti";
  const dot = base.lastIndexOf(".");
  return `${dot > 0 ? base.slice(0, dot) : base}.jpg`;
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

async function decode(file: File): Promise<ImageBitmap | null> {
  if (typeof createImageBitmap !== "function") return null;
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    try {
      return await createImageBitmap(file);
    } catch {
      return null;
    }
  }
}

export async function compressImageFile(file: File): Promise<File> {
  try {
    if (!COMPRESSIBLE_IMAGE_TYPES.includes(file.type)) return file;
    if (typeof document === "undefined") return file;
    const bitmap = await decode(file);
    if (!bitmap) return file;
    if (!shouldCompress(file.size, bitmap.width, bitmap.height)) {
      bitmap.close();
      return file;
    }
    const { width, height } = scaleDimensions(bitmap.width, bitmap.height);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }
    // Ratakan transparansi ke putih agar JPEG tidak menghitam.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    const blob = await canvasToBlob(canvas, "image/jpeg", IMAGE_JPEG_QUALITY);
    // Gagal atau justru membengkak → pakai berkas asli.
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], renameToJpg(file.name), {
      type: "image/jpeg",
      lastModified: file.lastModified,
    });
  } catch {
    return file;
  }
}
