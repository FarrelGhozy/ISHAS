// Bank instrumen live — editor penuh Validator (D-24).
// Tanpa versioning: tambah/edit/hapus dimensi + indikator langsung aktif.

import { useMemo, useState } from "react";
import { Layers3, ListChecks, Search, SlidersHorizontal } from "lucide-react";
import { K3_CATEGORIES } from "~/mocks/kategori-k3";
import type { InstrumentIndicator } from "~/mocks/types";
import { repository } from "~/shared/api/repository";
import { refreshValidatorState, useValidatorState } from "~/shared/api/validator-state";
import { BankBobotModal } from "../components/bank-bobot-modal";
import { BankIndikatorForm } from "../components/bank-indikator-form";

export function Page() {
  const state = useValidatorState();
  const bank = state.instrument;
  const dimensions = Array.isArray(bank?.dimensions) ? bank.dimensions : [];
  const indicatorCount = dimensions.reduce((n, d) => n + d.indicators.length, 0);
  const [note, setNote] = useState("");
  const [dimName, setDimName] = useState("");
  const [dimKategori, setDimKategori] = useState("");
  const [editDim, setEditDim] = useState("");
  const [editDimName, setEditDimName] = useState("");
  const [tambahInd, setTambahInd] = useState("");
  const [editInd, setEditInd] = useState("");
  const [bobotInd, setBobotInd] = useState<InstrumentIndicator | null>(null);
  const [cari, setCari] = useState("");
  const [filter, setFilter] = useState("Semua");
  const keyword = cari.trim().toLocaleLowerCase("id");
  const visibleDimensions = useMemo(
    () =>
      dimensions
        .map((dimension) => ({
          ...dimension,
          indicators: dimension.indicators.filter((indicator) => {
            const statusMatch =
              filter === "Semua" ||
              (filter === "Wajib" && indicator.required) ||
              (filter === "Bukti wajib" && indicator.evidenceRequired) ||
              (filter === "Lokasi wajib" && indicator.locationRequired);
            const textMatch =
              !keyword ||
              `${indicator.code} ${indicator.title} ${indicator.prompt}`
                .toLocaleLowerCase("id")
                .includes(keyword);
            return statusMatch && textMatch;
          }),
        }))
        .filter(
          (dimension) =>
            dimension.indicators.length > 0 ||
            (!keyword && filter === "Semua") ||
            dimension.name.toLocaleLowerCase("id").includes(keyword),
        ),
    [dimensions, filter, keyword],
  );
  const visibleCount = visibleDimensions.reduce(
    (count, dimension) => count + dimension.indicators.length,
    0,
  );

  const done = (message: string) => {
    if (message) setNote(message);
    setTambahInd("");
    setEditInd("");
    setEditDim("");
    setBobotInd(null);
  };

  const addDim = async () => {
    const r = await repository.addBankDimension(dimName, dimKategori || undefined);
    setNote(r.ok ? "Dimensi ditambahkan ke bank live." : r.error);
    if (r.ok) {
      setDimName("");
      setDimKategori("");
      refreshValidatorState();
    }
  };

  const saveDim = async (id: string) => {
    const r = await repository.updateBankDimension(id, { name: editDimName });
    setNote(r.ok ? "Dimensi diubah." : r.error);
    if (r.ok) {
      refreshValidatorState();
      done("");
    }
  };

  const hapus = async (kind: "dimensi" | "indikator", id: string, label: string) => {
    if (!window.confirm(`Hapus ${kind} ${label}? Laporan terkirim tetap beku.`)) return;
    const r =
      kind === "dimensi"
        ? await repository.deleteBankDimension(id)
        : await repository.deleteBankIndicator(id);
    setNote(r.ok ? `${kind} dihapus.` : r.error);
    if (r.ok) refreshValidatorState();
  };

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-5 pb-8">
      <header className="surface relative overflow-hidden p-5 sm:p-7">
        <div className="pointer-events-none absolute -right-10 -top-16 size-56 rounded-full bg-brand-bg" />
        <div className="relative">
          <p className="kicker">Metodologi · Validator</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-heading">
            Bank instrumen
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-secondary-text">
            Satu bank live sumber penilaian mandiri. Perubahan langsung aktif;
            draft yang sedang diisi harus mengulang. Laporan terkirim dibekukan
            dan tidak berubah.
          </p>
        </div>
      </header>
      {note ? (
        <p role="status" className="text-sm">
          {note}
        </p>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-3">
        <article className="surface flex items-center gap-3 p-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-bg text-primary">
            <Layers3 size={20} />
          </span>
          <span>
            <strong className="block text-2xl leading-none text-heading">
              {dimensions.length}
            </strong>
            <span className="mt-1 block text-xs text-secondary-text">Dimensi</span>
          </span>
        </article>
        <article className="surface flex items-center gap-3 p-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-bg text-primary">
            <ListChecks size={20} />
          </span>
          <span>
            <strong className="block text-2xl leading-none text-heading">
              {indicatorCount}
            </strong>
            <span className="mt-1 block text-xs text-secondary-text">Indikator</span>
          </span>
        </article>
        <article className="surface flex min-w-0 items-center gap-3 p-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-bg text-primary">
            <SlidersHorizontal size={20} />
          </span>
          <span className="min-w-0">
            <strong className="block truncate text-sm text-heading">
              {bank?.label ?? "Bank Instrumen Live"}
            </strong>
            <span className="mt-1 block truncate text-xs text-secondary-text">
              Checksum · {bank?.checksum ?? "—"}
            </span>
          </span>
        </article>
      </div>
      <section className="surface overflow-hidden" aria-label="Acuan bobot jawaban">
        <div className="border-b border-line bg-strip px-4 py-3">
          <h2 className="font-bold text-heading">Acuan bobot jawaban</h2>
          <p className="text-xs text-secondary-text">
            Bobot 0–100 tiap opsi + pengali indikator. Berlaku untuk pengisian baru;
            laporan terkirim tetap beku.
          </p>
        </div>
        <details className="group">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-4 text-sm font-semibold text-primary sm:px-5">
            <span>Lihat acuan opsi dan bobot per indikator</span>
            <span className="transition-transform group-open:rotate-180" aria-hidden="true">⌄</span>
        </summary>
          <div className="divide-y divide-line border-t border-line">
          {dimensions.flatMap((d) =>
            d.indicators.map((i) => (
              <div className="flex flex-wrap items-center gap-2 px-4 py-3" key={i.id}>
                <strong className="mr-auto text-sm text-heading">
                  {i.code}
                  <span className="ml-2 text-xs font-normal text-secondary-text">
                    {i.answerType} · pengali ×{i.weight ?? 1}
                  </span>
                </strong>
                <span className="w-full text-xs leading-5 text-faint sm:w-auto sm:flex-1">
                  {i.options
                    .map((o) => `${o.label} (${o.weight}${o.isFinding ? " · temuan" : ""})`)
                    .join(" · ")}
                </span>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    setBobotInd(i);
                    setNote("");
                  }}
                >
                  Atur
                </button>
              </div>
            )),
          )}
          </div>
        </details>
      </section>
      <section className="surface p-4 sm:p-5">
        <div className="mb-3">
          <h2 className="font-bold text-heading">Bangun struktur instrumen</h2>
          <p className="mt-1 text-xs text-secondary-text">
            Mulai dengan dimensi, lalu tambahkan indikator dan aturan jawabannya.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
        <label className="min-w-60 flex-1 text-xs font-bold">
          Dimensi baru
          <input
            className="mt-1 min-h-11 w-full rounded border border-line-soft bg-white px-3 font-normal"
            value={dimName}
            onChange={(e) => setDimName(e.target.value)}
            placeholder="Contoh: Keselamatan listrik"
          />
        </label>
        <label className="min-w-48 text-xs font-bold">
          Kategori
          <select
            className="mt-1 min-h-11 w-full rounded border border-line-soft bg-white px-3 font-normal"
            value={dimKategori}
            onChange={(e) => setDimKategori(e.target.value)}
          >
            <option value="">Tanpa kategori</option>
            {K3_CATEGORIES.map((c) => (
              <option value={c.id} key={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="primary-button" onClick={() => void addDim()}>
          Tambah dimensi
        </button>
        </div>
      </section>
      <section className="surface flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-1 text-xs font-bold text-secondary-text">
          Cari indikator
          <span className="relative">
            <Search className="absolute left-3 top-3.5 text-faint" size={16} aria-hidden="true" />
            <input
              className="min-h-11 w-full rounded-lg border border-line-soft bg-white pl-9 pr-3 text-base font-normal text-heading"
              value={cari}
              onChange={(event) => setCari(event.target.value)}
              placeholder="Kode, judul, atau pertanyaan"
            />
          </span>
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-secondary-text sm:w-48">
          Kebutuhan
          <select
            className="min-h-11 rounded-lg border border-line-soft bg-white px-3 text-base font-normal text-heading"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          >
            <option>Semua</option>
            <option>Wajib</option>
            <option>Bukti wajib</option>
            <option>Lokasi wajib</option>
          </select>
        </label>
        <p className="text-xs text-secondary-text sm:pb-3" aria-live="polite">
          {visibleCount} indikator ditampilkan
        </p>
      </section>
      {visibleDimensions.length === 0 ? (
        <div className="surface p-8 text-center">
          <Search className="mx-auto text-faint" size={24} />
          <h2 className="mt-3 font-bold text-heading">Tidak ada indikator yang cocok</h2>
          <p className="mt-1 text-sm text-secondary-text">
            Coba kata kunci atau filter yang berbeda.
          </p>
        </div>
      ) : null}
      {visibleDimensions.map((d) => {
        const editing = editDim === d.id;
        return (
          <article className="surface overflow-hidden" key={d.id}>
            <div className="border-b border-line bg-strip px-4 py-4 sm:px-5">
              {editing ? (
                <div className="flex flex-wrap items-end gap-2">
                  <label className="min-w-48 flex-1 text-xs font-bold">
                    Nama dimensi
                    <input
                      className="mt-1 min-h-10 w-full rounded border border-line-soft bg-white px-2 font-normal"
                      value={editDimName}
                      onChange={(e) => setEditDimName(e.target.value)}
                    />
                  </label>
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => void saveDim(d.id)}
                  >
                    Simpan
                  </button>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setEditDim("")}
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <div className="mr-auto">
                    <h2 className="font-bold text-heading">{d.name}</h2>
                    <p className="text-xs text-faint">
                      {d.id}
                      {d.categoryId ? ` · ${d.categoryId}` : ""} · {d.indicators.length} indikator
                    </p>
                  </div>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => {
                      setEditDim(d.id);
                      setEditDimName(d.name);
                    }}
                  >
                    Edit dimensi
                  </button>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => void hapus("dimensi", d.id, d.name)}
                  >
                    Hapus
                  </button>
                </div>
              )}
            </div>
            {d.indicators.length === 0 ? (
              <p className="px-5 py-4 text-sm text-secondary-text">Tidak ada indikator yang cocok di dimensi ini.</p>
            ) : null}
            <div className="divide-y divide-line">
              {d.indicators.map((i) => (
                <div className="p-4 sm:p-5" key={i.id}>
                  <div className="flex flex-wrap gap-2">
                    <strong className="mr-auto text-sm text-heading">
                      {i.code} · {i.title}
                    </strong>
                    <span className="status status-neutral">{i.answerType}</span>
                    {i.required ? <span className="status status-neutral">Wajib</span> : null}
                    {i.evidenceRequired ? (
                      <span className="status status-amber">Bukti wajib</span>
                    ) : null}
                    {i.locationRequired ? (
                      <span className="status status-blue">Lokasi wajib</span>
                    ) : null}
                    <span className="status status-neutral">Bobot ×{i.weight ?? 1}</span>
                  </div>
                  <p className="mt-2 max-w-4xl text-sm leading-6 text-secondary-text">
                    {i.prompt}
                  </p>
                  <p className="mt-2 text-xs text-faint">
                    {i.options
                      .map((o) => `${o.label} (${o.weight}${o.isFinding ? " · temuan" : ""})`)
                      .join(" · ")}
                    {i.aspectId ? ` · ${i.aspectId}` : ""}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => {
                        setEditInd(i.id);
                        setTambahInd("");
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => setBobotInd(i)}
                    >
                      Atur bobot
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => void hapus("indikator", i.id, i.code)}
                    >
                      Hapus
                    </button>
                  </div>
                  {editInd === i.id ? (
                    <div className="mt-2">
                      <BankIndikatorForm
                        dimensionId={d.id}
                        kategoriDimensi={d.categoryId}
                        awal={i}
                        onDone={done}
                      />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
            {tambahInd === d.id ? (
              <BankIndikatorForm
                dimensionId={d.id}
                kategoriDimensi={d.categoryId}
                onDone={done}
              />
            ) : (
              <div className="border-t border-line bg-strip p-4">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    setTambahInd(d.id);
                    setEditInd("");
                  }}
                >
                  Tambah indikator
                </button>
              </div>
            )}
          </article>
        );
      })}
      {bobotInd ? (
        <BankBobotModal indicator={bobotInd} onClose={done} />
      ) : null}
    </section>
  );
}
