// Bank instrumen live — editor penuh Validator (D-24).
// Tanpa versioning: tambah/edit/hapus dimensi + indikator langsung aktif.

import { useState } from "react";
import { storeActions, useMockState } from "~/mocks/store/mock-store";
import { K3_CATEGORIES } from "~/mocks/kategori-k3";
import type { InstrumentIndicator } from "~/mocks/types";
import { BankBobotModal } from "../components/bank-bobot-modal";
import { BankIndikatorForm } from "../components/bank-indikator-form";

export function Page() {
  const state = useMockState();
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

  const done = (message: string) => {
    if (message) setNote(message);
    setTambahInd("");
    setEditInd("");
    setEditDim("");
    setBobotInd(null);
  };

  const addDim = () => {
    const r = storeActions.addBankDimension(dimName, dimKategori || undefined);
    setNote(r.ok ? "Dimensi ditambahkan ke bank live." : r.error);
    if (r.ok) {
      setDimName("");
      setDimKategori("");
    }
  };

  const saveDim = (id: string) => {
    const r = storeActions.updateBankDimension(id, { name: editDimName });
    setNote(r.ok ? "Dimensi diubah." : r.error);
    if (r.ok) done("");
  };

  const hapus = (kind: "dimensi" | "indikator", id: string, label: string) => {
    if (!window.confirm(`Hapus ${kind} ${label}? Laporan terkirim tetap beku.`)) return;
    const r =
      kind === "dimensi"
        ? storeActions.deleteBankDimension(id)
        : storeActions.deleteBankIndicator(id);
    setNote(r.ok ? `${kind} dihapus.` : r.error);
  };

  return (
    <section className="flex flex-col gap-4">
      <header>
        <p className="kicker">Metodologi</p>
        <h1 className="text-2xl font-extrabold text-heading">Bank instrumen</h1>
        <p className="text-sm text-secondary-text">
          Satu bank live sumber penilaian mandiri. Perubahan langsung aktif;
          draft yang sedang diisi harus mengulang. Laporan terkirim dibekukan
          dan tidak berubah.
        </p>
      </header>
      {note ? (
        <p role="status" className="text-sm">
          {note}
        </p>
      ) : null}
      <div className="surface flex flex-wrap items-center gap-3 p-4">
        <div className="mr-auto">
          <strong className="text-heading">{bank?.label ?? "Bank Instrumen Live"}</strong>
          <p className="text-xs text-secondary-text">
            {dimensions.length} dimensi · {indicatorCount} indikator · checksum {bank?.checksum}
          </p>
        </div>
      </div>
      <section className="surface overflow-hidden" aria-label="Acuan bobot jawaban">
        <div className="border-b border-line bg-strip px-4 py-3">
          <h2 className="font-bold text-heading">Acuan bobot jawaban</h2>
          <p className="text-xs text-secondary-text">
            Bobot 0–100 tiap opsi + pengali indikator. Berlaku untuk pengisian baru;
            laporan terkirim tetap beku.
          </p>
        </div>
        <div className="divide-y divide-line">
          {dimensions.flatMap((d) =>
            d.indicators.map((i) => (
              <div className="flex flex-wrap items-center gap-2 px-4 py-2.5" key={i.id}>
                <strong className="mr-auto text-sm text-heading">
                  {i.code}
                  <span className="ml-2 text-xs font-normal text-secondary-text">
                    {i.answerType} · pengali ×{i.weight ?? 1}
                  </span>
                </strong>
                <span className="text-xs text-faint">
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
      </section>
      <div className="surface flex flex-wrap items-end gap-3 p-4">
        <label className="min-w-60 flex-1 text-xs font-bold">
          Dimensi baru
          <input
            className="mt-1 min-h-11 w-full rounded border border-line-soft px-3 font-normal"
            value={dimName}
            onChange={(e) => setDimName(e.target.value)}
            placeholder="Contoh: Keselamatan listrik"
          />
        </label>
        <label className="min-w-48 text-xs font-bold">
          Kategori
          <select
            className="mt-1 min-h-11 w-full rounded border border-line-soft px-3 font-normal"
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
        <button type="button" className="primary-button" onClick={addDim}>
          Tambah dimensi
        </button>
      </div>
      {dimensions.map((d) => {
        const editing = editDim === d.id;
        return (
          <article className="surface overflow-hidden" key={d.id}>
            <div className="border-b border-line bg-strip px-4 py-3">
              {editing ? (
                <div className="flex flex-wrap items-end gap-2">
                  <label className="min-w-48 flex-1 text-xs font-bold">
                    Nama dimensi
                    <input
                      className="mt-1 min-h-10 w-full rounded border border-line-soft px-2 font-normal"
                      value={editDimName}
                      onChange={(e) => setEditDimName(e.target.value)}
                    />
                  </label>
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => saveDim(d.id)}
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
                    onClick={() => hapus("dimensi", d.id, d.name)}
                  >
                    Hapus
                  </button>
                </div>
              )}
            </div>
            <div className="divide-y divide-line">
              {d.indicators.map((i) => (
                <div className="p-4" key={i.id}>
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
                  <p className="mt-1 text-sm text-secondary-text">{i.prompt}</p>
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
                      onClick={() => hapus("indikator", i.id, i.code)}
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
