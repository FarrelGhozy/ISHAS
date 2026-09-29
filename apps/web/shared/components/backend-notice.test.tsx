import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { BackendNotice } from "./backend-notice";

test("BackendNotice tanpa error tidak dirender", () => {
  const html = renderToStaticMarkup(<BackendNotice error={null} onRetry={() => {}} />);
  expect(html).toBe("");
});

test("BackendNotice menampilkan pesan + tombol coba lagi (D-31)", () => {
  const html = renderToStaticMarkup(<BackendNotice error="Server mati." onRetry={() => {}} />);
  expect(html).toContain("Gagal memuat data dari server.");
  expect(html).toContain("Server mati.");
  expect(html).toContain("Coba lagi");
});
