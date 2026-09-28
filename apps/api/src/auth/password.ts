// Hash sandi Fase 6 (D-30, BACKEND_DATA_MODEL §1). Memakai `Bun.password`
// dengan bcrypt agar cocok kolom `users.password_hash CHAR(60)`.
// Tidak ada sandi yang disimpan plaintext maupun dikembalikan ke klien.

const BCRYPT = "bcrypt" as const;

export async function hashPassword(plain: string): Promise<string> {
  return Bun.password.hash(plain, BCRYPT);
}

// Hash kosong/NULL (akun belum punya sandi) selalu gagal — bukan error.
export async function verifyPassword(plain: string, hash: string | null): Promise<boolean> {
  if (!hash) return false;
  if (!plain) return false;
  try {
    return await Bun.password.verify(plain, hash);
  } catch {
    return false;
  }
}

// Syarat sandi baru (BACKEND_API_CONTRACT §16): minimal 8 karakter.
export function validateNewPassword(password: string | undefined): string | null {
  if (!password || password.length < 8) return "Sandi baru minimal 8 karakter.";
  return null;
}
