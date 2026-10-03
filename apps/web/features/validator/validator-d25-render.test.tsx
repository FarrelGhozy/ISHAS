import { expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { Page as ScoringPage } from "./pages/scoring-page";
import { Page as AuditPage } from "./pages/validasi-publikasi-page";
import { Page as DatasetPage } from "./pages/data-penelitian-page";
import { Page as DashboardPage } from "./pages/dashboard-page";
import { Page as SamListPage } from "./pages/sam-list-page";
import { Page as SamBankPage } from "./pages/sam-bank-page";
import { Page as InstrumentPage } from "./pages/instrumen-page";
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

test("Audit publikasi D-25/D-32 ter-render dengan checklist 5 kriteria", () => {
  const html = renderToString(
    <MemoryRouter initialEntries={["/validator/validasi-publikasi"]}>
      <AuditPage />
    </MemoryRouter>,
  );
  expect(html).toContain("Audit publikasi");
  expect(html).toContain("Checksum bank");
  expect(html).toContain("Terbit");
  expect(html).toContain("Validator mengaudit");
  expect(html).toContain("Checklist kesiapan");
  expect(html).toContain("Aksi");
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
  expect(html).toContain("akun Pesantren");
});

test("Dashboard validator menautkan 3 halaman D-25", () => {
  const html = renderToString(
    <MemoryRouter initialEntries={["/validator/dashboard"]}>
      <DashboardPage />
    </MemoryRouter>,
  );
  expect(html).toContain(">Scoring</span>");
  expect(html).toContain(">Audit publikasi</span>");
  expect(html).toContain(">Data penelitian</span>");
  expect(html).toContain("Akses cepat");
  expect(html).toContain("Alur data dan batas peran");
  expect(html).toContain("Kesiapan publikasi");
  expect(html).toContain("Snapshot terbaru");
  expect(html).toContain("Skor per dimensi");
});

test("SAM-iSAFE riwayat menampilkan konteks dan filter", () => {
  const html = renderToString(
    <MemoryRouter initialEntries={["/validator/sam-isafe"]}>
      <SamListPage />
    </MemoryRouter>,
  );
  expect(html).toContain("SAM-iSAFE");
  expect(html).toContain("Riwayat pengamatan");
  expect(html).toContain("Pengamatan baru");
  expect(html).toContain("Kode, pesantren, pengamat");
});

test("Dashboard SAM-iSAFE menampilkan ringkasan profesional", () => {
  const html = renderToString(
    <MemoryRouter initialEntries={["/validator/sam-isafe"]}>
      <SamListPage />
    </MemoryRouter>,
  );
  expect(html).toContain("Ringkasan keselamatan");
  expect(html).toContain("Pantau kesiapan keselamatan secara terukur");
  expect(html).toContain("Perkembangan skor");
  expect(html).toContain("Rata-rata per kategori");
  // Regresi overflow ponsel: grafik tren ber-min-width 28rem harus di dalam
  // item grid ber-min-w-0 agar `overflow-x-auto` menggeser chart, bukan halaman.
  expect(html).toContain("surface min-w-0 p-5 sm:p-6");
});

test("Bank SAM-iSAFE menampilkan editor kategori dan pencarian", () => {
  const html = renderToString(
    <MemoryRouter initialEntries={["/validator/sam-isafe/bank"]}>
      <SamBankPage />
    </MemoryRouter>,
  );
  expect(html).toContain("Kelola checklist SAM-iSAFE");
  expect(html).toContain("Tambah kategori");
  expect(html).toContain("Cari soal");
});

test("Bank instrumen live menampilkan ringkasan, acuan bobot, dan pencarian", () => {
  const html = renderToString(
    <MemoryRouter initialEntries={["/validator/instrumen"]}>
      <InstrumentPage />
    </MemoryRouter>,
  );
  expect(html).toContain("Bank instrumen");
  expect(html).toContain("Bangun struktur instrumen");
  expect(html).toContain("Cari indikator");
  expect(html).toContain("Acuan bobot jawaban");
  expect(html).toContain("59<!-- --> indikator ditampilkan");
});
