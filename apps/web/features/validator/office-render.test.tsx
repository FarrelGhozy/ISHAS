import { expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { Page as OfficeListPage } from "./pages/office-list-page";
import { Page as OfficeBankPage } from "./pages/office-bank-page";
import { ROLE_NAVIGATION } from "~/shared/navigation/workspace-config";
import { SESSION_STORAGE_KEY } from "~/shared/auth/session";

// Sesi validator dummy (USR-002) sebelum render pertama — pola sama
// validator-d25-render.test.tsx.
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
  JSON.stringify({ accountId: "USR-002", loginAt: "2026-10-13T00:00:00.000Z" }),
);

test("Navigasi Validator memuat Inspeksi Kantor di bawah SAM-iSAFE", () => {
  const labels = ROLE_NAVIGATION.validator.map((item) => item.label);
  expect(labels).toContain("Inspeksi Kantor");
  expect(labels.indexOf("Inspeksi Kantor")).toBeGreaterThan(labels.indexOf("SAM-iSAFE"));
  expect(
    ROLE_NAVIGATION.validator.find((item) => item.label === "Inspeksi Kantor")?.path,
  ).toBe("/validator/inspeksi-kantor");
});

test("Riwayat inspeksi kantor menampilkan konteks dan filter", () => {
  const html = renderToString(
    <MemoryRouter initialEntries={["/validator/inspeksi-kantor"]}>
      <OfficeListPage />
    </MemoryRouter>,
  );
  expect(html).toContain("Inspeksi Kantor");
  expect(html).toContain("Riwayat inspeksi");
  expect(html).toContain("Inspeksi baru");
  expect(html).toContain("Kode, pesantren, unit kerja");
});

test("Dashboard inspeksi kantor menampilkan ringkasan profesional", () => {
  const html = renderToString(
    <MemoryRouter initialEntries={["/validator/inspeksi-kantor"]}>
      <OfficeListPage />
    </MemoryRouter>,
  );
  expect(html).toContain("Ringkasan inspeksi kantor");
  expect(html).toContain("Pantau kondisi ruang kerja secara terukur");
  expect(html).toContain("Perkembangan skor");
  expect(html).toContain("Rata-rata per kategori");
  // Regresi overflow ponsel: grafik tren ber-min-width 28rem harus di dalam
  // item grid ber-min-w-0 agar `overflow-x-auto` menggeser chart, bukan halaman.
  expect(html).toContain("surface min-w-0 p-5 sm:p-6");
});

test("Bank inspeksi kantor menampilkan editor kategori dan pencarian", () => {
  const html = renderToString(
    <MemoryRouter initialEntries={["/validator/inspeksi-kantor/bank"]}>
      <OfficeBankPage />
    </MemoryRouter>,
  );
  expect(html).toContain("Kelola checklist inspeksi kantor");
  expect(html).toContain("Tambah kategori");
  expect(html).toContain("Cari soal");
});
