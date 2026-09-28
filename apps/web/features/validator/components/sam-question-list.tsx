// Daftar pertanyaan SAM-iSAFE per kategori (nilai 0/1/2 + catatan + foto).
// Komponen kecil agar halaman baru tetap mudah dibaca.

import { storeActions } from "~/mocks/store/mock-store";
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

export function SamQuestionList(props: Props) {
  const { assessment, categories, questions, accountId, setPesan } = props;
  const aktif = questions.filter((item) => item.isActive);
  const terjawab = aktif.filter((item) => assessment.answers[item.id]).length;
  const urut = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);

  const simpan = (
    questionId: string,
    patch: { score?: 0 | 1 | 2; note?: string; evidenceAssetId?: string; evidenceName?: string },
  ) => {
    const lama = assessment.answers[questionId];
    const hasil = storeActions.saveSamAnswer(
      { id: accountId },
      {
        assessmentId: assessment.id,
        questionId,
        score: patch.score ?? lama?.score ?? 0,
        note: patch.note ?? lama?.note ?? "",
        evidenceAssetId: patch.evidenceAssetId ?? lama?.evidenceAssetId ?? "",
        evidenceName: patch.evidenceName ?? lama?.evidenceName ?? "",
      },
    );
    setPesan(hasil.ok ? "" : hasil.error);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="surface p-4">
        <p className="text-sm text-secondary-text">
          Progress: {terjawab}/{aktif.length} pertanyaan selesai
        </p>
        <div className="mt-2 h-2 overflow-hidden rounded bg-strip">
          <div
            className="h-2 rounded bg-primary"
            style={{ width: `${aktif.length ? (terjawab / aktif.length) * 100 : 0}%` }}
          />
        </div>
        <nav
          className="mt-3 flex flex-wrap gap-2"
          aria-label="Navigasi kategori"
        >
          {urut.map((category) => {
            const items = aktif.filter((item) => item.categoryId === category.id);
            if (items.length === 0) return null;
            const selesai = items.filter((item) => assessment.answers[item.id]).length;
            return (
              <a
                key={category.id}
                className="secondary-button"
                href={`#${category.id}`}
              >
                {category.name} · {selesai}/{items.length}
              </a>
            );
          })}
        </nav>
      </div>
      {urut.map((category) => {
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
            <h2 className="font-bold text-heading">
              {category.name}
            </h2>
            <p className="text-xs text-faint">
              {selesai}/{items.length} selesai
            </p>
            {items.map((item, index) => {
              const jawaban = assessment.answers[item.id];
              return (
                <article
                  className="mt-4 border-t border-line pt-3"
                  key={item.id}
                >
                  <p
                    className="text-sm font-bold text-heading"
                    id={`sam-soal-${item.id}`}
                  >
                    {index + 1}. {item.text}
                  </p>
                  <fieldset className="mt-2">
                    <legend className="sr-only">
                      Nilai {index + 1}: {item.text}
                    </legend>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {[0, 1, 2].map((nilai) => (
                        <label
                          key={nilai}
                          className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm font-semibold transition ${jawaban?.score === nilai ? "border-primary bg-brand-bg text-primary ring-1 ring-primary" : "border-line-soft bg-white text-heading hover:border-primary"}`}
                        >
                          <input
                            type="radio"
                            className="size-4 accent-primary"
                            name={`sam-nilai-${assessment.id}-${item.id}`}
                            value={nilai}
                            checked={jawaban?.score === nilai}
                            onChange={() => simpan(item.id, { score: nilai as 0 | 1 | 2 })}
                          />
                          <span>
                            {LABEL[nilai]}
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  {jawaban && jawaban.score === 0 && !jawaban.evidenceAssetId ? (
                    <p className="mt-2 text-xs font-semibold text-amber-700">
                      Nilai 0 terdeteksi — disarankan menambah catatan dan foto bukti.
                    </p>
                  ) : null}
                  <label className="mt-2 flex flex-col gap-1 text-xs text-secondary-text">
                    Catatan
                    <input
                      className="secondary-button"
                      defaultValue={jawaban?.note ?? ""}
                      key={`${item.id}-${jawaban?.score ?? "x"}`}
                      onBlur={(event) => {
                        if ((event.target.value ?? "") !== (jawaban?.note ?? "")) {
                          simpan(item.id, { note: event.target.value });
                        }
                      }}
                      placeholder="Temuan lapangan (opsional)"
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
                        simpan(item.id, {
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
