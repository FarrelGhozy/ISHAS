// Form tambah/edit indikator bank (D-24). Opsi + bobot diatur via modal Atur Bobot.

import { useState } from "react";
import { storeActions } from "~/mocks/store/mock-store";
import { K3_CATEGORIES } from "~/mocks/kategori-k3";
import type { InstrumentAnswerType, InstrumentIndicator } from "~/mocks/types";

const TIPE_BARU: { value: InstrumentAnswerType; label: string }[] = [
  { value: "ya-tidak", label: "Ya / Tidak" },
  { value: "kualitas-1-5", label: "Kualitas 1–5" },
  { value: "frekuensi", label: "Frekuensi kejadian" },
  { value: "keparahan", label: "Tingkat keparahan" },
];

export type IndikatorFormState = {
  code: string;
  title: string;
  prompt: string;
  answerType: InstrumentAnswerType;
  categoryId: string;
  aspectId: string;
  required: boolean;
  evidenceRequired: boolean;
  locationRequired: boolean;
};

export function BankIndikatorForm({
  dimensionId,
  kategoriDimensi,
  awal,
  onDone,
}: {
  dimensionId: string;
  kategoriDimensi?: string;
  awal?: InstrumentIndicator;
  onDone: (note: string) => void;
}) {
  const [form, setForm] = useState<IndikatorFormState>({
    code: awal?.code ?? "",
    title: awal?.title ?? "",
    prompt: awal?.prompt ?? "",
    answerType: awal?.answerType ?? "kualitas-1-5",
    categoryId: awal?.categoryId ?? kategoriDimensi ?? "",
    aspectId: awal?.aspectId ?? "",
    required: awal?.required ?? true,
    evidenceRequired: awal?.evidenceRequired ?? false,
    locationRequired: awal?.locationRequired ?? false,
  });
  const patch = (next: Partial<IndikatorFormState>) =>
    setForm((old) => ({ ...old, ...next }));

  const tipeWarisan =
    awal && !TIPE_BARU.some((t) => t.value === awal.answerType) ? awal.answerType : null;
  const aspekPilihan =
    K3_CATEGORIES.find((c) => c.id === (form.categoryId || kategoriDimensi))?.aspects ?? [];

  const simpan = () => {
    const payload = {
      code: form.code,
      title: form.title,
      prompt: form.prompt,
      answerType: form.answerType,
      required: form.required,
      evidenceRequired: form.evidenceRequired,
      locationRequired: form.locationRequired,
      categoryId: form.categoryId || undefined,
      aspectId: form.aspectId || undefined,
    };
    const r = awal
      ? storeActions.updateBankIndicator(awal.id, payload)
      : storeActions.addBankIndicator(dimensionId, payload);
    onDone(r.ok ? (awal ? `Indikator ${form.code} diubah.` : `Indikator ${form.code} ditambahkan.`) : r.error);
  };

  return (
    <div className="grid gap-2 border-t border-line bg-strip p-4 md:grid-cols-3">
      <label className="text-xs font-bold">
        Kode
        <input
          className="mt-1 min-h-10 w-full rounded border border-line-soft bg-white px-2 font-normal"
          value={form.code}
          onChange={(e) => patch({ code: e.target.value })}
          placeholder="IND-K3L-011"
        />
      </label>
      <label className="text-xs font-bold">
        Judul
        <input
          className="mt-1 min-h-10 w-full rounded border border-line-soft bg-white px-2 font-normal"
          value={form.title}
          onChange={(e) => patch({ title: e.target.value })}
        />
      </label>
      <label className="text-xs font-bold">
        Tipe jawaban
        <select
          className="mt-1 min-h-10 w-full rounded border border-line-soft bg-white px-2 font-normal"
          value={form.answerType}
          onChange={(e) => patch({ answerType: e.target.value as InstrumentAnswerType })}
        >
          {tipeWarisan ? (
            <option value={tipeWarisan}>{tipeWarisan} (warisan)</option>
          ) : null}
          {TIPE_BARU.map((t) => (
            <option value={t.value} key={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </label>
      <label className="text-xs font-bold">
        Kategori
        <select
          className="mt-1 min-h-10 w-full rounded border border-line-soft bg-white px-2 font-normal"
          value={form.categoryId}
          onChange={(e) => patch({ categoryId: e.target.value, aspectId: "" })}
        >
          <option value="">Ikut dimensi</option>
          {K3_CATEGORIES.map((c) => (
            <option value={c.id} key={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <label className="text-xs font-bold">
        Aspek
        <select
          className="mt-1 min-h-10 w-full rounded border border-line-soft bg-white px-2 font-normal"
          value={form.aspectId}
          onChange={(e) => patch({ aspectId: e.target.value })}
        >
          <option value="">Tanpa aspek</option>
          {aspekPilihan.map((a) => (
            <option value={a.id} key={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </label>
      <div className="flex flex-wrap items-end gap-3 text-xs">
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={form.required}
            onChange={(e) => patch({ required: e.target.checked })}
          />
          Wajib
        </label>
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={form.evidenceRequired}
            onChange={(e) => patch({ evidenceRequired: e.target.checked })}
          />
          Bukti wajib
        </label>
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={form.locationRequired}
            onChange={(e) => patch({ locationRequired: e.target.checked })}
          />
          Lokasi wajib
        </label>
      </div>
      <label className="text-xs font-bold md:col-span-3">
        Prompt
        <textarea
          className="mt-1 min-h-16 w-full rounded border border-line-soft bg-white p-2 font-normal"
          value={form.prompt}
          onChange={(e) => patch({ prompt: e.target.value })}
          placeholder="Tulis pertanyaan observasi min 10 karakter"
        />
      </label>
      <div className="flex flex-wrap gap-2 md:col-span-3">
        <button type="button" className="primary-button" onClick={simpan}>
          {awal ? "Simpan perubahan" : "Tambah indikator"}
        </button>
        <button type="button" className="secondary-button" onClick={() => onDone("")}>
          Batal
        </button>
      </div>
      {awal && form.answerType !== awal.answerType ? (
        <p className="text-xs text-secondary-text md:col-span-3">
          Ganti tipe mengembalikan opsi ke bawaan tipe baru. Atur ulang bobot lewat Atur Bobot.
        </p>
      ) : null}
    </div>
  );
}
