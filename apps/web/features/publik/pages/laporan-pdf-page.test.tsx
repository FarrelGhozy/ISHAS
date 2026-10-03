// Test halaman cetak PDF publik: id tak dikenal tidak menampilkan laporan.
// (Status loading/error backend diuji lewat tipe + verifikasi browser.)

import { expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router";
import { storeActions } from "~/mocks/store/mock-store";
import { LaporanPdfPage } from "./laporan-pdf-page";

test("laporan tak dikenal menampilkan pesan 'Laporan tidak tersedia'", () => {
  storeActions.resetMockData();
  const html = renderToString(
    <MemoryRouter initialEntries={["/laporan/TIDAK-ADA"]}>
      <Routes>
        <Route path="/laporan/:id" element={<LaporanPdfPage />} />
      </Routes>
    </MemoryRouter>,
  );
  expect(html).toContain("Laporan tidak tersedia");
});
