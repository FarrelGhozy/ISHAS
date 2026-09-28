import { expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { Page as ScoringPage } from "./pages/scoring-page";
import { Page as AuditPage } from "./pages/validasi-publikasi-page";
import { Page as DatasetPage } from "./pages/data-penelitian-page";
import { Page as DashboardPage } from "./pages/dashboard-page";
import { SESSION_STORAGE_KEY } from "~/shared/auth/session";

// Sesi validator dummy (USR-002) sebelum render pertama — pola sama
// instrument-docs-render.test.tsx.
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
  JSON.stringify({ accountId: "USR-002", loginAt: "2026-09-28T00:00:00.000Z" }),
);

test("Scoring D-25 ter-render dengan filter + link PDF", () => {
  const html = renderToString(
    <MemoryRouter initialEntries={["/validator/scoring"]}>
      <ScoringPage />
    </MemoryRouter>,
  );
  expect(html).toContain("Scoring");
  expect(html).toContain("Cari skor");
  expect(html).toContain("Semua terdaftar");
  expect(html).toContain("Lihat PDF");
});

test("Audit publikasi D-25 ter-render dengan checklist 5 kriteria", () => {
  const html = renderToString(
    <MemoryRouter initialEntries={["/validator/validasi-publikasi"]}>
      <AuditPage />
    </MemoryRouter>,
  );
  expect(html).toContain("Audit publikasi");
  expect(html).toContain("Checksum bank");
  expect(html).toContain("Diterima Pesantren");
  expect(html).toContain("Validator mengaudit");
});

test("Data penelitian D-25 ter-render dengan ekspor + impor", () => {
  const html = renderToString(
    <MemoryRouter initialEntries={["/validator/data-penelitian"]}>
      <DatasetPage />
    </MemoryRouter>,
  );
  expect(html).toContain("Data penelitian");
  expect(html).toContain("Unduh CSV");
  expect(html).toContain("Unduh JSON");
  expect(html).toContain("Impor dataset");
  expect(html).toContain("Validator Pesantren");
});

test("Dashboard validator menautkan 3 halaman D-25", () => {
  const html = renderToString(
    <MemoryRouter initialEntries={["/validator/dashboard"]}>
      <DashboardPage />
    </MemoryRouter>,
  );
  expect(html).toContain("Buka Scoring");
  expect(html).toContain("Buka Audit publikasi");
  expect(html).toContain("Buka Data penelitian");
});
