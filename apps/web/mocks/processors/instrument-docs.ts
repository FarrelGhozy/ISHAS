// Processor pustaka detail indikator (D-16): gabungan katalog indikator aktif +
// metadata dokumen. Murni, tanpa akses storage/browser.

import { K3_ASPECT_MAP, K3_CATEGORY_MAP } from "../kategori-k3";
import type { InstrumentDoc, InstrumentDocVisibility, IshasState } from "../types";

export type IndicatorDocRow = {
  indicatorId: string;
  code: string;
  title: string;
  categoryId: string;
  categoryName: string;
  aspectId: string;
  aspectName: string;
  doc: InstrumentDoc | null;
};

export type DocFilter = {
  q: string;
  categoryId: string; // 'Semua' atau KAT-*
  visibility: "Semua" | InstrumentDocVisibility;
};

/** Baris per indikator dari versi aktif (fallback Published pertama). */
export function selectIndicatorDocRows(state: {
  instrumentVersions: IshasState["instrumentVersions"];
  activeInstrumentVersionId: IshasState["activeInstrumentVersionId"];
  instrumentDocs: IshasState["instrumentDocs"];
}): IndicatorDocRow[] {
  const version =
    state.instrumentVersions.find((v) => v.id === state.activeInstrumentVersionId) ??
    state.instrumentVersions.find((v) => v.status === "Published") ??
    state.instrumentVersions[0];
  if (!version) return [];
  const docs = new Map((state.instrumentDocs ?? []).map((d) => [d.indicatorId, d]));
  return version.dimensions.flatMap((dim) =>
    dim.indicators.map((ind) => {
      const categoryId = ind.categoryId ?? dim.categoryId ?? "";
      const aspectId = ind.aspectId ?? "";
      return {
        indicatorId: ind.id,
        code: ind.code,
        title: ind.title,
        categoryId,
        categoryName: (categoryId && K3_CATEGORY_MAP[categoryId as keyof typeof K3_CATEGORY_MAP]?.name) || dim.name,
        aspectId,
        aspectName: (aspectId && K3_ASPECT_MAP[aspectId]?.name) || "",
        doc: docs.get(ind.id) ?? null,
      } satisfies IndicatorDocRow;
    }),
  );
}

/** Bacaan publik: hanya indikator yang sudah mempunyai berkas. */
export function selectPublicDocRows(rows: IndicatorDocRow[]): IndicatorDocRow[] {
  return rows.filter((row) => row.doc);
}

/**
 * Sembunyikan assetId privat dari pembaca yang tidak berhak (D-02/D-16):
 * baris privat tetap tampil (nama + status) tetapi tanpa rujukan blob.
 */
export function stripPrivateAsset(row: IndicatorDocRow, canOpenPrivate: boolean): IndicatorDocRow {
  if (row.doc && row.doc.visibility === "Privat" && !canOpenPrivate) {
    return { ...row, doc: { ...row.doc, assetId: "" } };
  }
  return row;
}

export function filterDocRows(rows: IndicatorDocRow[], filter: DocFilter): IndicatorDocRow[] {
  const q = filter.q.trim().toLowerCase();
  return rows.filter((row) => {
    if (filter.categoryId !== "Semua" && row.categoryId !== filter.categoryId) return false;
    if (filter.visibility !== "Semua" && row.doc?.visibility !== filter.visibility) return false;
    if (!q) return true;
    return (
      row.code.toLowerCase().includes(q) ||
      row.title.toLowerCase().includes(q) ||
      (row.doc?.fileName.toLowerCase().includes(q) ?? false)
    );
  });
}

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
