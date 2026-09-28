// Test pratinjau denah (D-22): baca tampil kecil + tombol buka, bukan langsung penuh.

import { expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { storeActions } from "~/mocks/store/mock-store";
import { SEED } from "~/mocks/seed/seed";
import { SavedLocation } from "./denah-preview";
import { PublicCampusMap } from "~/features/publik/components/public-campus-map";

test("SavedLocation bertitik tampil pratinjau + tombol Lihat denah besar", () => {
  const html = renderToString(
    <SavedLocation
      plans={SEED.campusPlans}
      location={{
        areaId: "AREA-003",
        locationText: "Asrama Putra · Musala",
        floorNote: "Lantai 1",
        campusPlanVersionId: "CAMPUS-PSN-0018-v1",
        point: { x: 48, y: 42 },
      }}
    />,
  );
  expect(html).toContain("Lihat denah besar");
  expect(html).not.toContain("Tutup denah besar");
});

test("peta publik PSN-0018 tampil pratinjau sebelum dibuka", () => {
  storeActions.resetMockData();
  const html = renderToString(
    <MemoryRouter initialEntries={["/peta-risiko?pesantren=PSN-0018"]}>
      <PublicCampusMap institutionCode="PSN-0018" />
    </MemoryRouter>,
  );
  expect(html).toContain("Lihat denah besar");
  expect(html).not.toContain("Tutup denah besar");
});
