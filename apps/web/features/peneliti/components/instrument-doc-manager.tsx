// D-16: kelola berkas PDF per indikator (ruang Peneliti).
// Independen dari versioning instrumen; default unggahan = Privat.

import { useMemo, useRef, useState } from "react";
import { Download, Eye, Lock, Trash2, Upload } from "lucide-react";
import { mockRepository } from "~/mocks/adapters/mock-repository";
import { K3_CATEGORIES } from "~/mocks/kategori-k3";
import {
  filterDocRows,
  formatFileSize,
  selectIndicatorDocRows,
  type DocFilter,
  type IndicatorDocRow,
} from "~/mocks/processors/instrument-docs";
import { storeActions, useMockState } from "~/mocks/store/mock-store";
import { useCurrentUser } from "~/shared/auth/use-current-user";
import { EmptyState } from "~/shared/components/empty-state";
import { Modal } from "~/shared/components/modal";
import { StatusChip } from "~/shared/components/status-chip";

function ActorOf(user: { id: string; name: string; role: string }) {
  return { id: user.id, name: user.name, role: user.role };
}

export function InstrumentDocManager() {
  const state = useMockState();
  const user = useCurrentUser();
  const [filter, setFilter] = useState<DocFilter>({ q: "", categoryId: "Semua", visibility: "Semua" });
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [pending, setPending] = useState<IndicatorDocRow | null>(null);
  const [deleting, setDeleting] = useState<IndicatorDocRow | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const rows = useMemo(() => selectIndicatorDocRows(state), [state]);
  const visible = useMemo(() => filterDocRows(rows, filter), [rows, filter]);
  const withDoc = rows.filter((r) => r.doc).length;
  const publicCount = rows.filter((r) => r.doc?.visibility === "Public").length;

  if (!user) return null;

  const startUpload = (row: IndicatorDocRow) => {
    setError("");
    setNote("");
    if (row.doc) {
      setPending(row); // ganti memakai konfirmasi
    } else {
      setPending(null);
      requestAnimationFrame(() => {
        (fileRef.current as HTMLInputElement & { dataset: { target: string } }).dataset.target = row.indicatorId;
        fileRef.current?.click();
      });
    }
  };

  const doUpload = async (indicatorId: string, file: File) => {
    setBusyId(indicatorId);
    setError("");
    setNote("");
    try {
      const result = await mockRepository.uploadInstrumentDoc(ActorOf(user), indicatorId, file, "Privat");
      if (result.ok) {
        setNote(`Berkas ${file.name.trim()} tersimpan sebagai Privat. Ubah ke Public bila siap tampil penuh di publik.`);
      } else {
        setError(result.error);
      }
    } finally {
      setBusyId("");
      setPending(null);
    }
  };

  const openDoc = async (row: IndicatorDocRow, mode: "view" | "download") => {
    setError("");
    const result = await mockRepository.openInstrumentDoc({ id: user.id }, row.indicatorId);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    const url = URL.createObjectURL(result.blob);
    try {
      if (mode === "view") {
        const tab = window.open(url, "_blank", "noopener");
        if (!tab) setError("Browser memblokir tab baru. Izinkan popup untuk situs ini lalu coba lagi.");
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
  };

  const toggleVisibility = (row: IndicatorDocRow) => {
    if (!row.doc) return;
    const next = row.doc.visibility === "Public" ? "Privat" : "Public";
    const result = storeActions.setInstrumentDocVisibility(ActorOf(user), row.indicatorId, next);
    if (result.ok) setNote(`Visibilitas ${row.code} diubah menjadi ${next}.`);
    else setError(result.error);
  };

  const doDelete = async (row: IndicatorDocRow) => {
    setBusyId(row.indicatorId);
    setError("");
    const result = await mockRepository.removeInstrumentDoc(ActorOf(user), row.indicatorId);
    setBusyId("");
    setDeleting(null);
    if (result.ok) setNote(`Berkas ${row.code} dihapus permanen beserta blob-nya.`);
    else setError(result.error);
  };

  return (
    <section aria-label="Berkas detail indikator" className="surface flex min-w-0 flex-col gap-3 p-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="mr-auto">
          <h2 className="font-bold text-heading">Berkas detail indikator</h2>
          <p className="text-xs text-secondary-text">
            Satu PDF per indikator · {withDoc} dari {rows.length} indikator mempunyai berkas · {publicCount} Public.
            Berkas baru default Privat; mengganti berkas tidak mengubah soal penilaian mandiri.
          </p>
        </div>
        <label className="min-w-44 flex-1 text-xs font-bold sm:max-w-56">
          Cari
          <input
            className="mt-1 min-h-11 w-full rounded border border-line-soft px-3 font-normal"
            value={filter.q}
            onChange={(e) => setFilter((f) => ({ ...f, q: e.target.value }))}
            placeholder="Kode, judul, nama file…"
          />
        </label>
        <label className="min-w-36 text-xs font-bold">
          Kategori
          <select
            className="mt-1 min-h-11 w-full rounded border border-line-soft bg-white px-2 font-normal"
            value={filter.categoryId}
            onChange={(e) => setFilter((f) => ({ ...f, categoryId: e.target.value }))}
          >
            <option value="Semua">Semua kategori</option>
            {K3_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
        <label className="min-w-32 text-xs font-bold">
          Status
          <select
            className="mt-1 min-h-11 w-full rounded border border-line-soft bg-white px-2 font-normal"
            value={filter.visibility}
            onChange={(e) => setFilter((f) => ({ ...f, visibility: e.target.value as DocFilter["visibility"] }))}
          >
            <option value="Semua">Semua</option>
            <option value="Public">Public</option>
            <option value="Privat">Privat</option>
          </select>
        </label>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        aria-hidden
        tabIndex={-1}
        onChange={(event) => {
          const file = event.target.files?.[0];
          const target = (event.target as HTMLInputElement & { dataset: { target?: string } }).dataset.target;
          event.target.value = "";
          if (file && target) void doUpload(target, file);
        }}
      />

      {note ? <p role="status" className="text-sm text-secondary-text">{note}</p> : null}
      {error ? <p role="alert" className="text-sm font-semibold text-primary">{error}</p> : null}

      {visible.length === 0 ? (
        <EmptyState
          title="Tidak ada indikator yang cocok"
          description="Ubah kata kunci atau filter kategori/status."
        />
      ) : (
        <div role="region" aria-label="Tabel berkas indikator" className="overflow-x-auto rounded-lg border border-line">
          <table className="min-w-[880px] w-full text-left text-sm">
            <thead className="sticky top-0 bg-strip">
              <tr>
                <th scope="col" className="px-3 py-2 text-xs font-bold text-secondary-text">Indikator</th>
                <th scope="col" className="px-3 py-2 text-xs font-bold text-secondary-text">Status</th>
                <th scope="col" className="px-3 py-2 text-xs font-bold text-secondary-text">Berkas</th>
                <th scope="col" className="px-3 py-2 text-xs font-bold text-secondary-text">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr key={row.indicatorId} className="border-t border-line align-top">
                  <td className="px-3 py-2">
                    <p className="font-bold text-heading">{row.code}</p>
                    <p className="text-secondary-text">{row.title}</p>
                    <p className="text-xs text-faint">{row.categoryName}{row.aspectName ? ` · ${row.aspectName}` : ""}</p>
                  </td>
                  <td className="px-3 py-2">
                    {row.doc ? <StatusChip value={row.doc.visibility} /> : <span className="text-xs text-faint">Belum ada berkas</span>}
                  </td>
                  <td className="px-3 py-2">
                    {row.doc ? (
                      <div className="break-words">
                        <p className="font-semibold text-heading">{row.doc.fileName}</p>
                        <p className="text-xs text-faint">{formatFileSize(row.doc.fileSize)} · {row.doc.updatedBy} · {new Date(row.doc.updatedAt).toLocaleDateString("id-ID")}</p>
                      </div>
                    ) : <span className="text-xs text-faint">—</span>}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex min-w-52 flex-wrap gap-2">
                      <button type="button" className="secondary-button px-3 py-2 text-xs" disabled={busyId === row.indicatorId} onClick={() => startUpload(row)}>
                        <Upload size={14} aria-hidden />{row.doc ? "Ganti" : "Unggah"}
                      </button>
                      {row.doc ? (
                        <>
                          <button type="button" className="secondary-button px-3 py-2 text-xs" onClick={() => void openDoc(row, "view")}>
                            <Eye size={14} aria-hidden />Lihat
                          </button>
                          <button type="button" className="secondary-button px-3 py-2 text-xs" onClick={() => void openDoc(row, "download")}>
                            <Download size={14} aria-hidden />Unduh
                          </button>
                          <button type="button" className="secondary-button px-3 py-2 text-xs" onClick={() => toggleVisibility(row)}>
                            <Lock size={14} aria-hidden />Jadikan {row.doc.visibility === "Public" ? "Privat" : "Public"}
                          </button>
                          <button type="button" className="secondary-button px-3 py-2 text-xs" disabled={busyId === row.indicatorId} onClick={() => setDeleting(row)}>
                            <Trash2 size={14} aria-hidden />Hapus
                          </button>
                        </>
                      ) : null}
                    </div>
                    {busyId === row.indicatorId ? <p role="status" className="mt-1 text-xs text-secondary-text">Memproses berkas…</p> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-faint">Hanya PDF · maksimal 10 MB · prototipe lokal tersimpan di browser perangkat ini.</p>

      <Modal open={pending !== null} onClose={() => setPending(null)} label="Konfirmasi ganti berkas">
        <h3 className="font-bold text-heading">Ganti berkas {pending?.code}?</h3>
        <p className="mt-1 text-sm text-secondary-text">
          Berkas lama ({pending?.doc?.fileName}) akan diganti permanen. Soal penilaian mandiri tidak berubah.
          Berkas baru tersimpan sebagai Privat.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className="secondary-button" onClick={() => setPending(null)}>Batal</button>
          <button
            type="button"
            className="primary-button"
            onClick={() => {
              const id = pending?.indicatorId;
              setPending(null);
              if (id && fileRef.current) {
                (fileRef.current as HTMLInputElement & { dataset: { target: string } }).dataset.target = id;
                fileRef.current.click();
              }
            }}
          >
            Pilih PDF pengganti
          </button>
        </div>
      </Modal>

      <Modal open={deleting !== null} onClose={() => setDeleting(null)} label="Konfirmasi hapus berkas">
        <h3 className="font-bold text-heading">Hapus berkas {deleting?.code}?</h3>
        <p className="mt-1 text-sm text-secondary-text">
          Metadata dan blob ({deleting?.doc?.fileName}) dihapus permanen dari demo ini. Tindakan tercatat di audit.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className="secondary-button" onClick={() => setDeleting(null)}>Batal</button>
          <button type="button" className="primary-button" disabled={busyId !== ""} onClick={() => deleting && void doDelete(deleting)}>
            Hapus permanen
          </button>
        </div>
      </Modal>
    </section>
  );
}
