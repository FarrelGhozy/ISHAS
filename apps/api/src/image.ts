// Deteksi tipe + ukuran gambar tanpa dependensi eksternal (pengganti createImageBitmap).
// Mendukung PNG, JPEG, dan WebP — cukup untuk batas 20 megapiksel.

export type ImageKind = "png" | "jpeg" | "webp";

export type ImageInfo = { kind: ImageKind; width: number; height: number };

export function detectImageKind(bytes: Uint8Array): ImageKind | null {
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  )
    return "png";
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)
    return "jpeg";
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  )
    return "webp";
  return null;
}

function u16be(bytes: Uint8Array, offset: number): number {
  return (bytes[offset] << 8) | bytes[offset + 1];
}

function u32be(bytes: Uint8Array, offset: number): number {
  return (
    ((bytes[offset] << 24) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3]) >>>
    0
  );
}

function u24le(bytes: Uint8Array, offset: number): number {
  return bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16);
}

export function imageInfo(bytes: Uint8Array): ImageInfo | null {
  const kind = detectImageKind(bytes);
  if (!kind) return null;
  if (kind === "png") {
    if (bytes.length < 24) return null;
    return { kind, width: u32be(bytes, 16), height: u32be(bytes, 20) };
  }
  if (kind === "jpeg") {
    let offset = 2;
    while (offset + 9 < bytes.length) {
      if (bytes[offset] !== 0xff) {
        offset += 1;
        continue;
      }
      const marker = bytes[offset + 1];
      if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
        offset += 2;
        continue;
      }
      const length = u16be(bytes, offset + 2);
      if (length < 2) return null;
      const isSof =
        marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
      if (isSof) {
        if (offset + 9 >= bytes.length) return null;
        return { kind, height: u16be(bytes, offset + 5), width: u16be(bytes, offset + 7) };
      }
      offset += 2 + length;
    }
    return null;
  }
  // WebP
  const chunk = String.fromCharCode(bytes[12], bytes[13], bytes[14], bytes[15]);
  if (chunk === "VP8 ") {
    if (bytes.length < 30) return null;
    return { kind, width: u16be(bytes, 26) & 0x3fff, height: u16be(bytes, 28) & 0x3fff };
  }
  if (chunk === "VP8L") {
    if (bytes.length < 25) return null;
    const bits = u32be(bytes, 21);
    return { kind, width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (chunk === "VP8X") {
    if (bytes.length < 30) return null;
    return { kind, width: u24le(bytes, 24) + 1, height: u24le(bytes, 27) + 1 };
  }
  return null;
}
