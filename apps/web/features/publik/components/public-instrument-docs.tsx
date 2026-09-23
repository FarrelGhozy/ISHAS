// D-16: pustaka PDF per indikator untuk publik.
// Public = Lihat (tab baru) + Unduh; Privat = nama + gembok tanpa tombol.

import { useMemo, useState } from "react";
import { Link } from "react-router";
import { Download, Eye, FileText, Lock } from "lucide-react";
import { mockRepository } from "~/mocks/adapters/mock-repository";
import { K3_CATEGORIES } from "~/mocks/kategori-k3";
import {
  filterDocRows,
  formatFileSize,
  selectIndicatorDocRows,
  selectPublicDocRows,
  stripPrivateAsset,
  type DocFilter,
} from "~/mocks/processors/instrument-docs";
import { useMockState } from "~/mocks/store/mock-store";
import { useCurrentUser } from "~/shared/auth/use-current-user";
import { EmptyState } from "~/shared/components/empty-state";
import { StatusChip } from "~/shared/components/status-chip";

function usePublicDocRows() {
  const state = useMockState();
  const user = useCurrentUser();
  const canOpenPrivate = user?.roleId === "peneliti" && user?.status === "Aktif";
  const rows = useMemo(
    () =>
      selectPublicDocRows(selectIndicatorDocRows(state)).map((row) =>
        stripPrivateAsset(row, canOpenPrivate),
      ),
    [state, canOpenPrivate],
  );
  return { rows, viewerId: user?.id };
}

async function openDoc(
  viewerId: string | undefined,
  indicatorId: string,
  mode: "view" | "download",
  onError: (message: string) => void,
) {
  const result = await mockRepository.openInstrumentDoc({ id: viewerId }, indicatorId);
  if (!result.ok) {
    onError(result.error);
    return;
  }
  const url = URL.createObjectURL(result.blob);
  try {
    if (mode === "view") {
      const tab = window.open(url, "_blank", "noopener");
      if (!tab)
        onError("Browser memblokir tab baru. Izinkan popup untuk situs ini lalu coba lagi.");
    } else {
      const a = document.createElement("a");
      a.href = url;
      a.download = result.fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  } finally {
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }
}

function DocTable({
  rows,
  viewerId,
  onError,
}: {
  rows: ReturnType<typeof usePublicDocRows>["rows"];
  viewerId: string | undefined;
  onError: (m: string) => void;
}) {
  if (rows.length === 0) {
    return (
      <EmptyState
        title="Belum ada dokumen yang cocok"
        description="Ubah kata kunci atau filter, atau hubungi Peneliti untuk penambahan berkas."
      />
    );
  }
  return (
    <div
      role="region"
      aria-label="Daftar dokumen indikator"
      className="overflow-x-auto rounded-lg border border-line"
    >
      <table className="min-w-[720px] w-full text-left text-sm">
        <thead className="sticky top-0 bg-strip">
          <tr>
            <th scope="col" className="px-3 py-2 text-xs font-bold text-secondary-text">
              Indikator
            </th>
            <th scope="col" className="px-3 py-2 text-xs font-bold text-secondary-text">
              Status
            </th>
            <th scope="col" className="px-3 py-2 text-xs font-bold text-secondary-text">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.indicatorId} className="border-t border-line align-top">
              <td className="px-3 py-2">
                <p className="font-bold text-heading">
                  {row.code} · {row.title}
                </p>
                <p className="text-xs text-faint">
                  {row.categoryName}
                  {row.aspectName ? ` · ${row.aspectName}` : ""}
                  {row.doc ? ` · ${row.doc.fileName} · ${formatFileSize(row.doc.fileSize)}` : ""}
                </p>
              </td>
              <td className="px-3 py-2">
                {row.doc ? <StatusChip value={row.doc.visibility} /> : null}
              </td>
              <td className="px-3 py-2">
                {row.doc?.visibility === "Public" && row.doc.assetId ? (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="secondary-button px-3 py-2 text-xs"
                      onClick={() => void openDoc(viewerId, row.indicatorId, "view", onError)}
                    >
                      <Eye size={14} aria-hidden />
                      Lihat
                    </button>
                    <button
                      type="button"
                      className="secondary-button px-3 py-2 text-xs"
                      onClick={() => void openDoc(viewerId, row.indicatorId, "download", onError)}
                    >
                      <Download size={14} aria-hidden />
                      Unduh
                    </button>
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-faint">
                    <Lock size={14} aria-hidden />
                    Terkunci
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FilterBar({ filter, onChange }: { filter: DocFilter; onChange: (f: DocFilter) => void }) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="min-w-44 flex-1 text-xs font-bold sm:max-w-64">
        Cari dokumen
        <input
          className="mt-1 min-h-11 w-full rounded border border-line-soft px-3 font-normal"
          value={filter.q}
          onChange={(e) => onChange({ ...filter, q: e.target.value })}
          placeholder="Kode, judul, nama file…"
        />
      </label>
      <label className="min-w-36 text-xs font-bold">
        Kategori
        <select
          className="mt-1 min-h-11 w-full rounded border border-line-soft bg-white px-2 font-normal"
          value={filter.categoryId}
          onChange={(e) => onChange({ ...filter, categoryId: e.target.value })}
        >
          <option value="Semua">Semua kategori</option>
          {K3_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <label className="min-w-32 text-xs font-bold">
        Status
        <select
          className="mt-1 min-h-11 w-full rounded border border-line-soft bg-white px-2 font-normal"
          value={filter.visibility}
          onChange={(e) =>
            onChange({ ...filter, visibility: e.target.value as DocFilter["visibility"] })
          }
        >
          <option value="Semua">Semua</option>
          <option value="Public">Public</option>
          <option value="Privat">Privat</option>
        </select>
      </label>
    </div>
  );
}

/** Halaman penuh /dokumen: search + filter + tabel. */
export function PublicInstrumentDocs() {
  const { rows, viewerId } = usePublicDocRows();
  const [filter, setFilter] = useState<DocFilter>({
    q: "",
    categoryId: "Semua",
    visibility: "Semua",
  });
  const [error, setError] = useState("");
  const visible = useMemo(() => filterDocRows(rows, filter), [rows, filter]);
  const publicCount = rows.filter((r) => r.doc?.visibility === "Public").length;

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <FilterBar filter={filter} onChange={setFilter} />
      <p className="text-xs text-faint">
        {rows.length} dokumen ({publicCount} Public) · Dokumen bersifat global; filter pesantren
        tidak memengaruhi daftar ini. Berkas Privat hanya tampil nama.
      </p>
      {error ? (
        <p role="alert" className="text-sm font-semibold text-primary">
          {error}
        </p>
      ) : null}
      <DocTable rows={visible} viewerId={viewerId} onError={setError} />
    </div>
  );
}

/** Panel ringkas di dashboard utama: 5 teratas + tautan ke /dokumen. */
export function DashboardDocPanel() {
  const { rows, viewerId } = usePublicDocRows();
  const [error, setError] = useState("");
  const top = rows.slice(0, 5);
  const publicCount = rows.filter((r) => r.doc?.visibility === "Public").length;

  return (
    <article aria-label="Dokumen detail instrumen" className="surface min-w-0 p-4">
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <h2 className="mr-auto flex items-center gap-2 font-bold text-heading">
          <FileText size={18} aria-hidden className="text-primary" />
          Dokumen detail instrumen
        </h2>
        <StatusChip value="Data publik · ilustrasi" />
      </div>
      <p className="mb-3 text-xs text-secondary-text">
        Penjelasan PDF per indikator ({publicCount} Public dari {rows.length} dokumen). Berkas
        Privat hanya tampil nama.
      </p>
      {error ? (
        <p role="alert" className="mb-2 text-sm font-semibold text-primary">
          {error}
        </p>
      ) : null}
      <DocTable rows={top} viewerId={viewerId} onError={setError} />
      <Link to="/dokumen" className="text-button mt-3 inline-block min-h-11 py-2 text-sm">
        Buka semua dokumen →
      </Link>
    </article>
  );
}
