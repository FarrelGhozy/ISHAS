// Form tambah/ubah pertanyaan bank SAM-iSAFE (D-26.f).
// Teks + panduan observasi + contoh bukti + pindah kategori.

import { useState } from "react";
import { storeActions } from "~/mocks/store/mock-store";
import type { SamCategory, SamQuestion } from "~/mocks/types";

type Props = {
  categories: SamCategory[];
  awal?: SamQuestion;
  defaultCategoryId: string;
  accountId?: string;
  onDone: (message: string) => void;
};

const inputCls =
  "mt-1 min-h-11 w-full rounded border border-line-soft px-3 text-base font-normal text-heading";

export function SamBankQuestionForm(props: Props) {
  const { categories, awal, defaultCategoryId, accountId, onDone } = props;
  const [teks, setTeks] = useState(awal?.text ?? "");
  const [panduan, setPanduan] = useState(awal?.panduan ?? "");
  const [contohBukti, setContohBukti] = useState(awal?.contohBukti ?? "");
  const [kategori, setKategori] = useState(awal?.categoryId ?? defaultCategoryId);
  const [galat, setGalat] = useState("");

  const simpan = () => {
    const hasil = awal
      ? storeActions.updateSamQuestion(
        { id: accountId },
        awal.id,
        { text: teks, panduan, contohBukti, categoryId: kategori },
      )
      : storeActions.addSamQuestion(
        { id: accountId },
        { categoryId: kategori, text: teks, panduan, contohBukti },
      );
    if (!hasil.ok) {
      setGalat(hasil.error);
      return;
    }
    onDone(awal ? "Pertanyaan diubah." : "Pertanyaan ditambahkan.");
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-line-soft bg-strip p-3">
      <label className="flex flex-col text-xs font-bold text-secondary-text">
        Teks pertanyaan*
        <textarea
          className={`${inputCls} min-h-20 py-2`}
          value={teks}
          onChange={(event) => setTeks(event.target.value)}
          placeholder="Tulis teks pertanyaan minimal 10 karakter"
          rows={2}
        />
      </label>
      <label className="flex flex-col text-xs font-bold text-secondary-text">
        Kategori
        <select
          className={inputCls}
          value={kategori}
          onChange={(event) => setKategori(event.target.value)}
        >
          {categories.map((item) => (
            <option
              key={item.id}
              value={item.id}
            >
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col text-xs font-bold text-secondary-text">
        Panduan observasi (opsional)
        <textarea
          className={`${inputCls} min-h-16 py-2`}
          value={panduan}
          onChange={(event) => setPanduan(event.target.value)}
          placeholder="Contoh: periksa tiap lantai, foto panel listrik"
          rows={2}
        />
      </label>
      <label className="flex flex-col text-xs font-bold text-secondary-text">
        Contoh bukti (opsional)
        <input
          className={inputCls}
          value={contohBukti}
          onChange={(event) => setContohBukti(event.target.value)}
          placeholder="Contoh: foto APAR + label servis"
        />
      </label>
      {galat ? (
        <p
          role="alert"
          className="text-xs font-bold text-[#b91c1c]"
        >
          {galat}
        </p>
      ) : null}
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          className="primary-button w-full sm:w-auto"
          onClick={simpan}
        >
          {awal ? "Simpan perubahan" : "Tambah pertanyaan"}
        </button>
        <button
          type="button"
          className="secondary-button w-full sm:w-auto"
          onClick={() => onDone("")}
        >
          Batal
        </button>
      </div>
    </div>
  );
}
