// Kartu accordion satu kategori bank SAM-iSAFE (D-26.f).
// Edit/hapus kategori + daftar soal + tambah soal inline.
// Dibuat terpisah agar halaman bank tetap mudah dibaca.

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { storeActions } from "~/mocks/store/mock-store";
import { StatusChip } from "~/shared/components/status-chip";
import type { SamCategory, SamQuestion } from "~/mocks/types";
import { SamBankQuestionForm } from "./sam-bank-question-form";

type Props = {
  category: SamCategory;
  categories: SamCategory[];
  questions: SamQuestion[];
  expanded: boolean;
  onToggle: () => void;
  duplikat: Map<string, string[]>;
  usage: Map<string, number>;
  accountId?: string;
  onPesan: (message: string) => void;
};

export function SamBankCategoryCard(props: Props) {
  const { category, categories, questions, expanded, onToggle } = props;
  const { duplikat, usage, accountId, onPesan } = props;
  const [editCat, setEditCat] = useState(false);
  const [nama, setNama] = useState(category.name);
  const [deskripsi, setDeskripsi] = useState(category.description);
  const [galatCat, setGalatCat] = useState("");
  const [tambah, setTambah] = useState(false);
  const [editSoal, setEditSoal] = useState("");

  const aktif = questions.filter((item) => item.isActive).length;

  const simpanKategori = () => {
    const hasil = storeActions.updateSamCategory(
      { id: accountId },
      category.id,
      { name: nama, description: deskripsi },
    );
    if (!hasil.ok) {
      setGalatCat(hasil.error);
      return;
    }
    setEditCat(false);
    setGalatCat("");
    onPesan("Kategori diubah.");
  };

  const hapusKategori = () => {
    if (!window.confirm(`Hapus kategori ${category.name}? Bank sisa tetap aktif.`)) return;
    const hasil = storeActions.deleteSamCategory({ id: accountId }, category.id);
    onPesan(hasil.ok ? "Kategori dihapus." : hasil.error);
  };

  const toggleSoal = (id: string, nilai: boolean) => {
    const hasil = storeActions.setSamQuestionActive({ id: accountId }, id, nilai);
    onPesan(hasil.ok ? "" : hasil.error);
  };

  const hapusSoal = (item: SamQuestion) => {
    if (!window.confirm(`Hapus soal ${item.id}? Riwayat Selesai tidak boleh berubah.`)) return;
    const hasil = storeActions.deleteSamQuestion({ id: accountId }, item.id);
    onPesan(hasil.ok ? "Pertanyaan dihapus." : hasil.error);
  };

  const geser = (id: string, arah: "naik" | "turun") => {
    const hasil = storeActions.moveSamQuestion({ id: accountId }, id, arah);
    onPesan(hasil.ok ? "" : hasil.error);
  };

  return (
    <article className="surface overflow-hidden">
      <button
        type="button"
        className="flex w-full min-h-16 items-center gap-3 px-4 py-3 text-left"
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <span className="mr-auto min-w-0">
          <strong className="block truncate text-heading">
            {category.name}
          </strong>
          <span className="block text-xs text-faint">
            {category.id} · {aktif}/{questions.length} aktif · maks +{aktif * 2}
          </span>
        </span>
        <ChevronDown
          size={18}
          aria-hidden
          className={`shrink-0 text-secondary-text transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>
      {expanded ? (
        <div className="border-t border-line p-4">
          {editCat ? (
            <div className="flex flex-col gap-3 rounded-lg border border-line-soft bg-strip p-3">
              <label className="flex flex-col text-xs font-bold text-secondary-text">
                Nama kategori*
                <input
                  className="mt-1 min-h-11 w-full rounded border border-line-soft px-3 text-base font-normal text-heading"
                  value={nama}
                  onChange={(event) => setNama(event.target.value)}
                />
              </label>
              <label className="flex flex-col text-xs font-bold text-secondary-text">
                Deskripsi
                <input
                  className="mt-1 min-h-11 w-full rounded border border-line-soft px-3 text-base font-normal text-heading"
                  value={deskripsi}
                  onChange={(event) => setDeskripsi(event.target.value)}
                  placeholder="Contoh: struktur, listrik, jalur evakuasi"
                />
              </label>
              {galatCat ? (
                <p
                  role="alert"
                  className="text-xs font-bold text-[#b91c1c]"
                >
                  {galatCat}
                </p>
              ) : null}
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  className="primary-button w-full sm:w-auto"
                  onClick={simpanKategori}
                >
                  Simpan kategori
                </button>
                <button
                  type="button"
                  className="secondary-button w-full sm:w-auto"
                  onClick={() => setEditCat(false)}
                >
                  Batal
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-faint">
                {category.description || "Tanpa deskripsi."}
              </p>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    setNama(category.name);
                    setDeskripsi(category.description);
                    setGalatCat("");
                    setEditCat(true);
                  }}
                >
                  Edit kategori
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={hapusKategori}
                >
                  Hapus
                </button>
              </div>
            </div>
          )}
          <div className="mt-2 flex flex-col gap-3">
            {questions.map((item, index) => (
              <article
                key={item.id}
                className="rounded-lg border border-line p-3"
              >
                <p className="text-sm font-bold text-heading">
                  {index + 1}. {item.text}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <StatusChip value={item.isActive ? "Aktif" : "Nonaktif"} />
                  <span className="text-xs text-faint">
                    {item.id} · dipakai {usage.get(item.id) ?? 0} pengamatan
                  </span>
                  {(duplikat.get(item.id) ?? []).map((lain) => (
                    <span
                      key={lain}
                      className="status status-amber"
                    >
                      Teks sama dengan {lain}
                    </span>
                  ))}
                </div>
                {item.panduan ? (
                  <p className="mt-2 text-xs text-secondary-text">
                    <strong>
                      Panduan:
                    </strong>
                    {` ${item.panduan}`}
                  </p>
                ) : null}
                {item.contohBukti ? (
                  <p className="mt-1 text-xs text-secondary-text">
                    <strong>
                      Contoh bukti:
                    </strong>
                    {` ${item.contohBukti}`}
                  </p>
                ) : null}
                {editSoal === item.id ? (
                  <div className="mt-3">
                    <SamBankQuestionForm
                      categories={categories}
                      awal={item}
                      defaultCategoryId={category.id}
                      accountId={accountId}
                      onDone={(message) => {
                        setEditSoal("");
                        onPesan(message);
                      }}
                    />
                  </div>
                ) : (
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => toggleSoal(item.id, !item.isActive)}
                    >
                      {item.isActive ? "Nonaktifkan" : "Aktifkan"}
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => setEditSoal(item.id)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => geser(item.id, "naik")}
                    >
                      Naik
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => geser(item.id, "turun")}
                    >
                      Turun
                    </button>
                    <button
                      type="button"
                      className="secondary-button col-span-2 sm:col-span-1"
                      onClick={() => hapusSoal(item)}
                    >
                      Hapus
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
          {tambah ? (
            <div className="mt-3">
              <SamBankQuestionForm
                categories={categories}
                defaultCategoryId={category.id}
                accountId={accountId}
                onDone={(message) => {
                  setTambah(false);
                  onPesan(message);
                }}
              />
            </div>
          ) : (
            <button
              type="button"
              className="secondary-button mt-3 w-full sm:w-auto"
              onClick={() => {
                setEditSoal("");
                setTambah(true);
              }}
            >
              + Tambah pertanyaan di kategori ini
            </button>
          )}
        </div>
      ) : null}
    </article>
  );
}
