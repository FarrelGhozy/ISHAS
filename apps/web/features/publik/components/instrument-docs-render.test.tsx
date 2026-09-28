import { expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { DokumenPage } from "~/features/publik/pages/dokumen-page";
import { Page as DokumenInstrumenPage } from "~/features/validator/pages/dokumen-instrumen-page";
import { Page as InstrumenPage } from "~/features/validator/pages/instrumen-page";
import { DashboardDocPanel } from "~/features/publik/components/public-instrument-docs";
import { SESSION_STORAGE_KEY } from "~/shared/auth/session";

// Sesi dibaca sekali lalu di-cache modul session (by design); pasang sebelum render pertama.
const sessionStore = new Map<string, string>();
Object.defineProperty(globalThis, "sessionStorage", {
  configurable: true,
  value: {
    getItem: (key: string) => sessionStore.get(key) ?? null,
    setItem: (key: string, value: string) => void sessionStore.set(key, value),
    removeItem: (key: string) => void sessionStore.delete(key),
  },
});
(globalThis.sessionStorage as Storage).setItem(
  SESSION_STORAGE_KEY,
  JSON.stringify({ accountId: "USR-002", loginAt: "2026-09-23T00:00:00.000Z" }),
);

test("halaman /dokumen ter-render tanpa crash", () => {
  const html = renderToString(
    <MemoryRouter initialEntries={["/dokumen"]}>
      <DokumenPage />
    </MemoryRouter>,
  );
  expect(html).toContain("Dokumen detail indikator");
  expect(html).toContain("IND-K3L-001");
  expect(html).toContain("Terkunci"); // privat tanpa tombol
});

test("halaman /validator/dokumen-instrumen ter-render saat login validator", () => {
  const html = renderToString(
    <MemoryRouter initialEntries={["/validator/dokumen-instrumen"]}>
      <DokumenInstrumenPage />
    </MemoryRouter>,
  ).replace(/<!-- -->/g, "");
  expect(html).toContain("Dokumen instrumen");
  expect(html).toContain("Berkas detail indikator");
  expect(html).toContain("detail-instalasi-listrik.pdf");
  expect(html).toContain("Jadikan Public"); // toggle visibilitas ada
  expect(html).toContain("Tambah dokumen"); // D-16.g: buat entri baru
  expect(html).toContain("Tambah dokumen indikator"); // modal
});

test("panel dashboard ter-render tanpa crash", () => {
  const html = renderToString(
    <MemoryRouter initialEntries={["/"]}>
      <DashboardDocPanel />
    </MemoryRouter>,
  );
  expect(html).toContain("Buka semua dokumen");
});

test("halaman /validator/instrumen ter-render sebagai bank live (D-24)", () => {
  const html = renderToString(
    <MemoryRouter initialEntries={["/validator/instrumen"]}>
      <InstrumenPage />
    </MemoryRouter>,
  ).replace(/<!-- -->/g, "");
  expect(html).toContain("Bank instrumen");
  expect(html).toContain("IND-K3L-001");
  expect(html).toContain("Atur bobot");
  expect(html).toContain("Acuan bobot jawaban");
});
