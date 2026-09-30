import { afterAll, beforeEach, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { Page } from "./dashboard-page";
import { getState, storeActions } from "~/mocks/store/mock-store";
import { selectReportsForManager } from "~/mocks/store/selectors";
import { workspaceHome } from "~/shared/auth/access-policy";
import { ROLE_NAVIGATION } from "~/shared/navigation/workspace-config";
import { SESSION_STORAGE_KEY, sessionStore as authSession } from "~/shared/auth/session";

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
  // Cache sesi modul session dipakai bersama antar file test dalam satu proses
  // bun; login() menimpa cache secara deterministik (setItem mentah diabaikan
  // bila cache sudah terisi file lain).
  authSession.login("USR-003");
});

afterAll(() => {
  // Kembalikan konvensi file render lain (USR-002) untuk file yang jalan sesudah.
  authSession.login("USR-002");
});

function renderDashboard(): string {
  return renderToString(
    <MemoryRouter initialEntries={["/pesantren/dashboard"]}>
      <Page />
    </MemoryRouter>,
  );
}

test("dashboard Pesantren menampilkan identitas pesantren (D-34)", () => {
  const html = renderDashboard().replace(/<!-- -->/g, "");
  expect(html).toContain("Pesantren saya");
  expect(html).toContain("PP Al-Hikmah Malang");
  expect(html).toContain("PSN-0018");
  expect(html).toContain("Kota Malang");
});

test("angka rangkuman cocok dengan selector scope sendiri (D-34)", () => {
  const html = renderDashboard();
  const laporCepat = selectReportsForManager(getState(), "PSN-0018").filter(
    (item) => item.channel === "lapor-cepat",
  );
  const menunggu = laporCepat.filter(
    (item) => item.validationStatus === "Menunggu validasi",
  ).length;
  expect(html).toContain("Menunggu validasi");
  expect(html).toContain(`>${menunggu}</p>`);
  expect(html).toContain("Progres tindak lanjut");
  expect(html).toContain("Antrean terbaru");
  expect(html).toContain("Buka Validasi");
});

test("dashboard terisolasi scope pesantren lain (D-34)", () => {
  const html = renderDashboard();
  // RPT-0005 milik PSN-0019; nama lembaga lain tidak tampil sebagai identitas.
  expect(html).not.toContain("PP Nurul Iman Batu");
  expect(html).not.toContain("RPT-0005");
});

test("landing Pesantren adalah dashboard (D-34)", () => {
  expect(workspaceHome("pesantren")).toBe("/pesantren/dashboard");
  expect(ROLE_NAVIGATION.pesantren[0]?.path).toBe("/pesantren/dashboard");
  expect(ROLE_NAVIGATION.pesantren[0]?.label).toBe("Dashboard");
});
