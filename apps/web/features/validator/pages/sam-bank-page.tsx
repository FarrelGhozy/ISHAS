// Bank data SAM-iSAFE: tambah kategori + pertanyaan + aktif/nonaktif (D-26).
// Perubahan langsung memengaruhi pengamatan baru; riwayat selesai tidak berubah.

import { useState } from "react";
import { Link } from "react-router";
import { storeActions, useMockState } from "~/mocks/store/mock-store";
import { samActiveQuestions } from "~/mocks/sam-isafe";
import { useCurrentUser } from "~/shared/auth/use-current-user";

export function Page() {
  const state = useMockState();
  const user = useCurrentUser();
  const [pesan, setPesan] = useState("");
  const [kategori, setKategori] = useState("");
  const [teks, setTeks] = useState("");
  const [target, setTarget] = useState(state.samCategories[0]?.id ?? "");
  const aktif = samActiveQuestions(state.samQuestions);

  const tambahKategori = () => {
    const hasil = storeActions.addSamCategory({ id: user?.id }, { name: kategori });
    setPesan(hasil.ok ? "Kategori ditambahkan." : hasil.error);
    if (hasil.ok) setKategori("");
  };

  const tambahSoal = () => {
    if (!target) {
      setPesan("Pilih kategori dulu.");
      return;
    }
    const hasil = storeActions.addSamQuestion(
      { id: user?.id },
      { categoryId: target, text: teks },
    );
    setPesan(hasil.ok ? "Pertanyaan ditambahkan." : hasil.error);
    if (hasil.ok) setTeks("");
  };

  const toggle = (id: string, nilai: boolean) => {
    const hasil = storeActions.setSamQuestionActive({ id: user?.id }, id, nilai);
    setPesan(hasil.ok ? "" : hasil.error);
  };

  return (
    <section className="flex flex-col gap-4">
      <header className="flex flex-wrap items-end gap-3">
        <div className="mr-auto">
          <p className="kicker">
            Bank data
          </p>
          <h1 className="text-2xl font-extrabold text-heading">
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
          ← Kembali ke riwayat
        </Link>
      </header>
      <div className="scope-banner text-sm">
        {state.samCategories.length} kategori · {aktif.length} pertanyaan aktif · maks{" "}
        {aktif.length * 2}. Menonaktifkan soal mengubah maks pengamatan baru.
      </div>
      {pesan ? (
        <p
          className="text-sm"
          role="status"
        >
          {pesan}
        </p>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="surface flex flex-col gap-3 p-4">
          <h2 className="font-bold text-heading">
            Tambah kategori
          </h2>
          <input
            className="secondary-button"
            value={kategori}
            onChange={(event) => setKategori(event.target.value)}
            placeholder="Contoh: Keselamatan Laboratorium"
          />
          <button
            className="primary-button"
            onClick={tambahKategori}
            type="button"
          >
            Tambah kategori
          </button>
        </div>
        <div className="surface flex flex-col gap-3 p-4">
          <h2 className="font-bold text-heading">
            Tambah pertanyaan
          </h2>
          <select
            className="secondary-button"
            value={target}
            onChange={(event) => setTarget(event.target.value)}
          >
            {state.samCategories.map((item) => (
              <option
                key={item.id}
                value={item.id}
              >
                {item.name}
              </option>
            ))}
          </select>
          <input
            className="secondary-button"
            value={teks}
            onChange={(event) => setTeks(event.target.value)}
            placeholder="Tulis teks pertanyaan minimal 10 karakter"
          />
          <button
            className="primary-button"
            onClick={tambahSoal}
            type="button"
          >
            Tambah pertanyaan
          </button>
        </div>
      </div>
      {[...state.samCategories]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((category) => (
          <section
            className="surface p-4"
            key={category.id}
          >
            <h2 className="font-bold text-heading">
              {category.name}
            </h2>
            <p className="text-xs text-faint">
              {category.id} · {category.description || "Tanpa deskripsi"}
            </p>
            {state.samQuestions
              .filter((item) => item.categoryId === category.id)
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((item, index) => (
                <div
                  className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3 text-sm"
                  key={item.id}
                >
                  <p className="mr-auto">
                    {index + 1}. {item.text}
                  </p>
                  <span className={`status ${item.isActive ? "status-green" : "status-neutral"}`}>
                    {item.isActive ? "Aktif" : "Nonaktif"}
                  </span>
                  <button
                    className="secondary-button"
                    onClick={() => toggle(item.id, !item.isActive)}
                    type="button"
                  >
                    {item.isActive ? "Nonaktifkan" : "Aktifkan"}
                  </button>
                </div>
              ))}
          </section>
        ))}
    </section>
  );
}
