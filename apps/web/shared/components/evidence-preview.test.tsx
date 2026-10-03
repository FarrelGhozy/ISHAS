// Test pratinjau bukti (D-27): setelah unggah, gambar ditampilkan dari cache
// lokal perangkat tanpa meminta ulang ke server (server 401 untuk baca anonim
// sebelum laporan terbit).

import { expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { EvidencePreview } from "./evidence-preview";
import { setEvidencePreview } from "./evidence-preview-cache";

test("EvidencePreview memakai pratinjau lokal yang di-cache", () => {
  setEvidencePreview("asset-preview-test", "blob:pratinjau-lokal");
  const html = renderToString(
    <EvidencePreview assetId="asset-preview-test" institutionCode="PSN-0018" name="foto.png" />,
  );
  expect(html).toContain("blob:pratinjau-lokal");
  expect(html).toContain("foto.png");
  expect(html).not.toContain("Coba muat bukti lagi");
});

test("EvidencePreview tanpa aset dan tanpa nama tidak merender apa pun", () => {
  const html = renderToString(<EvidencePreview institutionCode="PSN-0018" />);
  expect(html).toBe("");
});
