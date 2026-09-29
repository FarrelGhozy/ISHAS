import { afterAll, beforeEach, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { Page } from "./hasil-mandiri-page";
import { HasilMandiriDetail } from "../components/hasil-mandiri-detail";
import { getState, storeActions } from "~/mocks/store/mock-store";
import { selectReportsForManager } from "~/mocks/store/selectors";
import { ROLE_NAVIGATION } from "~/shared/navigation/workspace-config";
import {
  resolveWorkspaceAccess,
  workspaceRoleFor,
} from "~/shared/auth/access-policy";
import appRoutes from "~/app/routes";
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
    <MemoryRouter initialEntries={["/pesantren/hasil-penilaian-mandiri"]}>
      <Page />
    </MemoryRouter>,
  );
}

test("menu Hasil mandiri mengarah ke route baru (D-36)", () => {
  const item = ROLE_NAVIGATION.pesantren.find(
    (entry) => entry.path === "/pesantren/hasil-penilaian-mandiri",
  );
  expect(item?.label).toBe("Hasil mandiri");
});

test("route terdaftar di workspace Pesantren + guard mengizinkan (D-36)", () => {
  const pesantren = (appRoutes as unknown as { path?: string; children?: { path?: string; file?: string }[] }[]).find(
    (entry) => entry.path === "pesantren",
  );
  const child = pesantren?.children?.find(
    (entry) => entry.path === "hasil-penilaian-mandiri",
  );
  expect(child?.file).toBe("routes/pesantren.hasil-penilaian-mandiri.tsx");
  expect(workspaceRoleFor("/pesantren/hasil-penilaian-mandiri")).toBe("pesantren");
  expect(
    resolveWorkspaceAccess(
      "/pesantren/hasil-penilaian-mandiri",
      { accountId: "USR-003", loginAt: "2026-09-29T00:00:00.000Z" },
      "pesantren",
    ),
  ).toBe("allowed");
});

test("hanya menampilkan Terbit milik scope sendiri (D-36)", () => {
  const html = renderPage().replace(/<!-- -->/g, "");
  expect(html).toContain("PP Al-Hikmah Malang");
  expect(html).toContain("RPT-0004");
  expect(html).toContain("RPT-0010");
  // Milik PSN-0019 tidak boleh bocor ke scope PSN-0018.
  expect(html).not.toContain("RPT-0002");
  expect(html).not.toContain("RPT-0007");
  expect(html).not.toContain("RPT-0014");
  // Kanal lapor-cepat tidak masuk halaman ini.
  expect(html).not.toContain("RPT-0001");
});

test("angka daftar cocok dengan selector scope sendiri (D-36)", () => {
  const expected = selectReportsForManager(getState(), "PSN-0018").filter(
    (item) =>
      item.channel === "penilaian-mandiri" &&
      item.validationStatus === "Terbit",
  );
  expect(expected.length).toBeGreaterThan(0);
  const html = renderPage();
  for (const item of expected) {
    expect(html).toContain(item.id);
  }
});

test("detail memuat data internal penilai dan jawaban (D-36)", () => {
  const state = getState();
  const report = state.reports.find((item) => item.id === "RPT-0010");
  expect(report).toBeDefined();
  const snapshot = state.selfAssessmentSnapshots.find(
    (item) => item.reportId === "RPT-0010",
  );
  const html = renderToString(
    <MemoryRouter initialEntries={["/pesantren/hasil-penilaian-mandiri"]}>
      <HasilMandiriDetail
        report={report!}
        snapshot={snapshot}
        bank={state.instrument}
        areaLabel={new Map()}
        plans={[]}
        institutionName="PP Al-Hikmah Malang"
      />
    </MemoryRouter>,
  ).replace(/<!-- -->/g, "");
  // Nama penilai internal tampil di ruang Pesantren (tidak publik).
  expect(html).toContain("Ust. K.H. Mustofa Kamal");
  expect(html).toContain("Jawaban per indikator");
  expect(html).toContain("IND-K3L-002");
});
