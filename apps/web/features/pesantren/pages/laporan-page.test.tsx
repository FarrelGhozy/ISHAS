import { afterAll, beforeEach, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { Page } from "./laporan-page";
import { getState, storeActions } from "~/mocks/store/mock-store";
import { selectReportsForManager } from "~/mocks/store/selectors";
import {
  SESSION_STORAGE_KEY,
  sessionStore as authSession,
} from "~/shared/auth/session";

// Sesi akun Pesantren demo (USR-003, scope PSN-0018) sebelum render pertama.
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
  JSON.stringify({ accountId: "USR-003", loginAt: "2026-09-29T00:00:00.000Z" }),
);

beforeEach(() => {
  storeActions.resetMockData();
  authSession.login("USR-003");
});

afterAll(() => {
  authSession.login("USR-002");
});

function renderPage(): string {
  return renderToString(
    <MemoryRouter initialEntries={["/pesantren/laporan"]}>
      <Page />
    </MemoryRouter>,
  ).replace(/<!-- -->/g, "");
}

test("laporan hanya menampilkan kanal lapor-cepat Diterima scope sendiri (D-41)", () => {
  const html = renderPage();
  const laporCepat = selectReportsForManager(getState(), "PSN-0018").filter(
    (item) => item.channel === "lapor-cepat" && item.validationStatus === "Diterima",
  );
  expect(laporCepat.length).toBeGreaterThan(0);
  for (const item of laporCepat) {
    expect(html).toContain(item.id);
  }
  // RPT-0003 lapor-cepat Diterima milik PSN-0018 tampil.
  expect(html).toContain("RPT-0003");
});

test("hasil penilaian mandiri tidak lagi tampil di Laporan (D-41)", () => {
  const html = renderPage();
  // RPT-0004 dan RPT-0010 penilaian-mandiri Terbit milik PSN-0018.
  expect(html).not.toContain("RPT-0004");
  expect(html).not.toContain("RPT-0010");
  // Halaman hasil mandiri tetap dijangkau lewat tautan silang.
  expect(html).toContain("/pesantren/hasil-penilaian-mandiri");
});

test("laporan tidak menampilkan Menunggu validasi atau scope lain (D-41)", () => {
  const html = renderPage();
  // RPT-0001 masih Menunggu validasi; RPT-0005 milik PSN-0019.
  expect(html).not.toContain("RPT-0001");
  expect(html).not.toContain("RPT-0005");
});
