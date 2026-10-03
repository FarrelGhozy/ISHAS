// Uji aturan kelengkapan form ganti kata sandi + render dialog (SSR).
import { expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { ChangePasswordDialog, validasiGantiSandi } from "./change-password-dialog";

test("sandi lama wajib diisi", () => {
  expect(validasiGantiSandi("", "baru12345", "baru12345")).toBe("Kata sandi lama wajib diisi.");
});

test("sandi baru minimal 8 karakter", () => {
  expect(validasiGantiSandi("lama1234", "baru", "baru")).toContain("minimal 8");
});

test("konfirmasi sandi baru harus cocok", () => {
  expect(validasiGantiSandi("lama1234", "baru12345", "beda1234")).toBe(
    "Konfirmasi kata sandi baru tidak cocok.",
  );
});

test("sandi baru harus berbeda dari sandi lama", () => {
  expect(validasiGantiSandi("sama12345", "sama12345", "sama12345")).toContain("berbeda");
});

test("nilai sah lolos validasi", () => {
  expect(validasiGantiSandi("lama1234", "baru12345", "baru12345")).toBeNull();
});

test("dialog menampilkan judul dan tiga kolom sandi", () => {
  const html = renderToString(
    <ChangePasswordDialog open onClose={() => {}} onSubmit={async () => ({ ok: true })} />,
  );
  expect(html).toContain("Ganti kata sandi");
  expect(html).toContain("Kata sandi lama");
  expect(html).toContain("Kata sandi baru");
  expect(html).toContain("Konfirmasi kata sandi baru");
});
