// Daftar pertanyaan SAM-iSAFE per kategori (nilai 0/1/2 + catatan + foto).

import { useState } from "react";
import { CheckCircle2, ChevronDown, CircleAlert, Info } from "lucide-react";
import { repository } from "~/shared/api/repository";
import { refreshValidatorState } from "~/shared/api/validator-state";
import { SamEvidencePicker } from "./sam-evidence-picker";
import type { SamAssessment, SamCategory, SamQuestion } from "~/mocks/types";

type Props = {
  assessment: SamAssessment;
  categories: SamCategory[];
  questions: SamQuestion[];
  accountId?: string;
  pesan: string;
  setPesan: (value: string) => void;
};

const LABEL: Record<number, string> = {
  0: "0 — Tidak tersedia",
  1: "1 — Sebagian tersedia",
  2: "2 — Sepenuhnya tersedia",
};

const DESKRIPSI: Record<number, string> = {
  0: "Tidak ditemukan saat observasi",
  1: "Sudah ada, tetapi belum konsisten",
  2: "Tersedia dan berjalan dengan baik",
};

export function SamQuestionList(props: Props) {
  const { assessment, categories, questions, accountId, setPesan } = props;
  const [menyimpan, setMenyimpan] = useState(false);
  const aktif = questions.filter((item) => item.isActive);
  const terjawab = aktif.filter((item) => assessment.answers[item.id]).length;
  const urut = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);

  const simpan = async (
    questionId: string,
    patch: {
      score?: 0 | 1 | 2;
      note?: string;
      evidenceAssetId?: string;
      evidenceName?: string;
    },
  ) => {
    const lama = assessment.answers[questionId];
    setMenyimpan(true);
    try {
      const hasil = await repository.saveSamAnswer(
        { id: accountId, name: "Validator" },
        {
          assessmentId: assessment.id,
          questionId,
          score: patch.score ?? lama?.score ?? 0,
          note: patch.note ?? lama?.note ?? "",
          evidenceAssetId: patch.evidenceAssetId ?? lama?.evidenceAssetId ?? "",
          evidenceName: patch.evidenceName ?? lama?.evidenceName ?? "",
        },
      );
      if (hasil.ok) refreshValidatorState();
      setPesan(hasil.ok ? "" : hasil.error);
    } finally {
      setMenyimpan(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="surface overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-line bg-strip px-4 py-3">
          <div className="mr-auto">
            <p className="text-xs font-extrabold uppercase tracking-wide text-secondary-text">
              Progress pengamatan
            </p>
            <p className="mt-1 text-sm font-bold text-heading">
              {terjawab} dari {aktif.length} pertanyaan terjawab
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-secondary-text">
            {menyimpan ? <CircleAlert size={15} /> : <CheckCircle2 size={15} />}
            {menyimpan ? "Menyimpan..." : "Perubahan tersimpan"}
          </span>
        </div>
        <div className="px-4 pb-4 pt-3">
          <div className="h-2 overflow-hidden rounded-full bg-strip">
            <div
              className="h-2 rounded-full bg-primary transition-[width]"
              style={{ width: `${aktif.length ? (terjawab / aktif.length) * 100 : 0}%` }}
            />
          </div>
          <nav className="mt-3 hidden flex-wrap gap-2 sm:flex" aria-label="Navigasi kategori">
            {urut.map((category) => {
              const items = aktif.filter((item) => item.categoryId === category.id);
              if (items.length === 0) return null;
              const selesai = items.filter((item) => assessment.answers[item.id]).length;
              return (
                <a
                  key={category.id}
                  className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-line-soft bg-white px-3 text-xs font-bold text-body-text transition hover:border-primary hover:text-primary"
                  href={`#${category.id}`}
                >
                  {category.name}
                  <span className="rounded-full bg-strip px-2 py-0.5 text-faint">
                    {selesai}/{items.length}
                  </span>
                </a>
              );
            })}
          </nav>
          <label className="mt-3 flex flex-col gap-1 text-xs font-bold text-secondary-text sm:hidden">
            Lompat ke kategori
            <select
              className="min-h-11 rounded-lg border border-line-soft bg-white px-3 text-base font-normal text-heading"
              defaultValue=""
              onChange={(event) => {
                if (event.target.value) {
                  document.getElementById(event.target.value)?.scrollIntoView();
                }
              }}
            >
              <option value="">Pilih kategori</option>
              {urut.map((category) => {
                const items = aktif.filter((item) => item.categoryId === category.id);
                if (items.length === 0) return null;
                const selesai = items.filter((item) => assessment.answers[item.id]).length;
                return (
                  <option key={category.id} value={category.id}>
                    {category.name} · {selesai}/{items.length}
                  </option>
                );
              })}
            </select>
          </label>
        </div>
      </div>
      {urut.map((category, categoryIndex) => {
        const items = aktif
          .filter((item) => item.categoryId === category.id)
          .sort((a, b) => a.sortOrder - b.sortOrder);
        if (items.length === 0) return null;
        const selesai = items.filter((item) => assessment.answers[item.id]).length;
        return (
          <section
            className="surface scroll-mt-24 p-4 sm:p-5"
            id={category.id}
            key={category.id}
          >
            <div className="flex flex-wrap items-start gap-2">
              <div className="mr-auto">
                <p className="kicker">Bagian {categoryIndex + 1}</p>
                <h2 className="mt-1 font-bold text-heading">{category.name}</h2>
              </div>
              <span className="rounded-full bg-brand-bg px-2.5 py-1 text-xs font-bold text-primary">
                {selesai}/{items.length} selesai
              </span>
            </div>
            {items.map((item, index) => {
              const jawaban = assessment.answers[item.id];
              return (
                <article
                  className="mt-4 rounded-xl border border-line bg-slate-50/60 p-4 first:mt-5"
                  key={item.id}
                >
                  <div className="flex items-start gap-3">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-heading text-xs font-extrabold text-white">
                      {index + 1}
                    </span>
                    <p
                      className="pt-1 text-sm font-bold leading-6 text-heading"
                      id={`sam-soal-${item.id}`}
                    >
                      {item.text}
                    </p>
                  </div>
                  {item.panduan ? (
                    <details className="mt-3 rounded-lg border border-brand-border bg-brand-bg text-xs text-secondary-text">
                      <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 font-bold text-primary">
                        <Info size={14} />
                        Panduan observasi
                        <ChevronDown className="ml-auto" size={15} />
                      </summary>
                      <p className="border-t border-brand-border px-3 py-2 leading-5">
                        {item.panduan}
                      </p>
                    </details>
                  ) : null}
                  <fieldset className="mt-3">
                    <legend className="mb-2 text-xs font-extrabold uppercase tracking-wide text-secondary-text">
                      Pilih hasil observasi
                    </legend>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {[0, 1, 2].map((nilai) => (
                        <label
                          key={nilai}
                          className={`flex min-h-[72px] cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${jawaban?.score === nilai ? "border-primary bg-brand-bg text-primary ring-1 ring-primary" : "border-line-soft bg-white text-heading hover:border-primary"}`}
                        >
                          <input
                            type="radio"
                            className="mt-0.5 size-4 accent-primary"
                            name={`sam-nilai-${assessment.id}-${item.id}`}
                            value={nilai}
                            checked={jawaban?.score === nilai}
                            onChange={() => void simpan(item.id, { score: nilai as 0 | 1 | 2 })}
                          />
                          <span className="flex flex-col gap-1">
                            <strong>{LABEL[nilai]}</strong>
                            <small className="font-normal leading-4 text-secondary-text">
                              {DESKRIPSI[nilai]}
                            </small>
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  {jawaban && jawaban.score === 0 && !jawaban.evidenceAssetId ? (
                    <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                      Nilai 0 terdeteksi. Tambahkan catatan dan foto bukti agar temuan mudah ditindaklanjuti.
                    </p>
                  ) : null}
                  <label className="mt-3 flex flex-col gap-1 text-xs font-bold text-secondary-text">
                    Catatan observasi
                    <textarea
                      className="min-h-20 rounded-lg border border-line-soft bg-white px-3 py-2 text-base font-normal text-heading placeholder:text-faint"
                      defaultValue={jawaban?.note ?? ""}
                      key={`${item.id}-${jawaban?.score ?? "x"}-${jawaban?.note ?? ""}`}
                      onBlur={(event) => {
                        if ((event.target.value ?? "") !== (jawaban?.note ?? "")) {
                          void simpan(item.id, { note: event.target.value });
                        }
                      }}
                      placeholder="Tuliskan kondisi yang ditemukan di lapangan (opsional)"
                      rows={3}
                    />
                  </label>
                  {jawaban ? (
                    <SamEvidencePicker
                      institutionCode={assessment.institutionCode}
                      actorId={accountId}
                      assetId={jawaban.evidenceAssetId}
                      name={jawaban.evidenceName}
                      disabled={false}
                      onChange={(assetId, name) =>
                        void simpan(item.id, {
                          score: jawaban.score,
                          evidenceAssetId: assetId ?? "",
                          evidenceName: name ?? "",
                        })
                      }
                    />
                  ) : null}
                </article>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}
