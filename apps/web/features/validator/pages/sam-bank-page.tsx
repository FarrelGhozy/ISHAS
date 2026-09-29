// Bank data SAM-iSAFE: CRUD lengkap kategori + pertanyaan (D-26, D-26.f).
// Perubahan langsung memengaruhi pengamatan baru; riwayat Selesai tidak berubah.
// Bank SAM-KAT-* terpisah dari kategori K3 (KAT-*) sistem laporan.

import { useMemo, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Database, Plus, Search } from "lucide-react";
import { samActiveQuestions, samDuplicateQuestions } from "~/mocks/sam-isafe";
import { repository } from "~/shared/api/repository";
import { refreshValidatorState, useValidatorState } from "~/shared/api/validator-state";
import { useCurrentUser } from "~/shared/auth/use-current-user";
import { EmptyState } from "~/shared/components/empty-state";
import { SamBankCategoryCard } from "../components/sam-bank-category-card";

export function Page() {
  const state = useValidatorState();
  const user = useCurrentUser();
  const [pesan, setPesan] = useState("");
  const [nama, setNama] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [cari, setCari] = useState("");
  const [filter, setFilter] = useState("Semua");
  const [tutup, setTutup] = useState<string[]>([]);

  const aktif = samActiveQuestions(state.samQuestions);
  const duplikat = useMemo(
    () => samDuplicateQuestions(state.samQuestions),
    [state.samQuestions],
  );
  const usage = useMemo(() => {
    const map = new Map<string, number>();
    for (const assessment of state.samAssessments) {
      for (const id of Object.keys(assessment.answers)) {
        map.set(id, (map.get(id) ?? 0) + 1);
      }
    }
    return map;
  }, [state.samAssessments]);

  const urut = useMemo(
    () => [...state.samCategories].sort((a, b) => a.sortOrder - b.sortOrder),
    [state.samCategories],
  );
  const keyword = cari.trim().toLowerCase();
  const mencari = keyword.length > 0;
  const tampil = useMemo(
    () =>
      urut
        .map((category) => ({
          category,
          questions: state.samQuestions
            .filter((item) => item.categoryId === category.id)
            .filter((item) => (filter === "Semua" ? true : filter === "Aktif" ? item.isActive : !item.isActive))
            .filter((item) =>
              keyword
                ? `${item.id} ${item.text} ${item.panduan ?? ""}`.toLowerCase().includes(keyword)
                : true,
            )
            .sort((a, b) => a.sortOrder - b.sortOrder),
        }))
        .filter((row) =>
          mencari
            ? row.questions.length > 0 || row.category.name.toLowerCase().includes(keyword)
            : true,
        ),
    [urut, state.samQuestions, filter, keyword, mencari],
  );

  const riwayat = useMemo(
    () =>
      state.auditEvents
        .filter((event) => event.objectType === "SamCategory" || event.objectType === "SamQuestion")
        .sort((a, b) => b.at.localeCompare(a.at))
        .slice(0, 10),
    [state.auditEvents],
  );

  const tambahKategori = async () => {
    const hasil = await repository.addSamCategory(
      { id: user?.id, name: user?.name ?? "Validator" },
      { name: nama, description: deskripsi },
    );
    setPesan(hasil.ok ? "Kategori ditambahkan." : hasil.error);
    if (hasil.ok) {
      refreshValidatorState();
      setNama("");
      setDeskripsi("");
    }
  };

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-4">
      <header className="surface flex flex-wrap items-end gap-4 p-5 sm:p-6">
        <div className="mr-auto min-w-0">
          <p className="kicker">
            Bank data
          </p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-extrabold text-heading">
            <Database className="text-primary" size={25} />
            Kelola checklist SAM-iSAFE
          </h1>
          <p className="mt-1 text-sm text-secondary-text">
            Perubahan langsung memengaruhi pengamatan baru; riwayat Selesai tidak berubah.
          </p>
        </div>
        <Link
          className="text-button"
          to="/validator/sam-isafe"
        >
          <ArrowLeft size={15} />
          Kembali ke riwayat
        </Link>
      </header>
      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        <button
          type="button"
          className="secondary-button w-full sm:w-auto"
          onClick={() => setTutup([])}
        >
          Buka semua
        </button>
        <button
          type="button"
          className="secondary-button w-full sm:w-auto"
          onClick={() => setTutup(urut.map((item) => item.id))}
        >
          Tutup semua
        </button>
      </div>
      <div className="scope-banner text-sm">
        {state.samCategories.length} kategori · {aktif.length} pertanyaan aktif · maks{" "}
        {aktif.length * 2}. Bank SAM-KAT-* khusus Validator; terpisah dari kategori K3 (KAT-*)
        sistem laporan.
      </div>
      {pesan ? (
        <p
          className="text-sm"
          role="status"
        >
          {pesan}
        </p>
      ) : null}
      <div className="surface flex flex-col gap-3 p-4">
        <h2 className="flex items-center gap-2 font-bold text-heading">
          <Plus size={17} className="text-primary" />
          Tambah kategori
        </h2>
        <label className="flex flex-col gap-1 text-xs font-bold text-secondary-text">
          Nama kategori*
           <input
             className="min-h-11 w-full rounded-lg border border-line-soft bg-white px-3 text-base font-normal text-heading"
            value={nama}
            onChange={(event) => setNama(event.target.value)}
            placeholder="Contoh: Keselamatan Laboratorium"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-secondary-text">
          Deskripsi (opsional)
           <input
             className="min-h-11 w-full rounded-lg border border-line-soft bg-white px-3 text-base font-normal text-heading"
            value={deskripsi}
            onChange={(event) => setDeskripsi(event.target.value)}
            placeholder="Contoh: bahan kimia, APD, ventilasi lab"
          />
        </label>
        <button
          className="primary-button w-full sm:w-auto"
          onClick={() => void tambahKategori()}
          type="button"
        >
          Tambah kategori
        </button>
      </div>
      <div className="surface flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-1 text-xs font-bold text-secondary-text">
          Cari soal
           <div className="relative">
           <Search className="absolute left-3 top-3.5 text-faint" size={16} />
           <input
             className="min-h-11 w-full rounded-lg border border-line-soft bg-white pl-9 pr-3 text-base font-normal text-heading"
            value={cari}
            onChange={(event) => setCari(event.target.value)}
            placeholder="Kata kunci atau kode SAM-Q-xxx"
           />
           </div>
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-secondary-text sm:w-44">
          Status
          <select
             className="min-h-11 w-full rounded-lg border border-line-soft bg-white px-3 text-base font-normal text-heading"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          >
            <option value="Semua">
              Semua
            </option>
            <option value="Aktif">
              Aktif
            </option>
            <option value="Nonaktif">
              Nonaktif
            </option>
          </select>
        </label>
      </div>
      {tampil.length === 0 ? (
        <EmptyState
          title="Tidak ada yang cocok"
          description="Ubah kata kunci atau filter status."
        />
      ) : (
        tampil.map((row) => (
          <SamBankCategoryCard
            key={row.category.id}
            category={row.category}
            categories={urut}
            questions={row.questions}
            expanded={mencari ? true : !tutup.includes(row.category.id)}
            onToggle={() =>
              setTutup((sebelum) =>
                sebelum.includes(row.category.id)
                  ? sebelum.filter((id) => id !== row.category.id)
                  : [...sebelum, row.category.id],
              )
            }
            duplikat={duplikat}
            usage={usage}
            accountId={user?.id}
            onPesan={setPesan}
          />
        ))
      )}
      <section className="surface p-4">
        <h2 className="font-bold text-heading">
          Riwayat perubahan bank
        </h2>
        {riwayat.length === 0 ? (
          <p className="mt-1 text-sm text-secondary-text">
            Belum ada perubahan bank pada sesi demo ini.
          </p>
        ) : (
          <ol className="mt-2 flex flex-col gap-2">
            {riwayat.map((event) => (
              <li
                key={event.id}
                className="flex flex-wrap items-baseline gap-2 border-b border-line pb-2 text-sm last:border-0"
              >
                <strong className="text-heading">
                  {event.action}
                </strong>
                <span className="text-xs text-secondary-text">
                  {event.actorName} · {event.at.slice(0, 10)}
                </span>
                {event.note ? (
                  <span className="w-full text-xs text-faint">
                    {event.note}
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
        )}
      </section>
    </section>
  );
}
