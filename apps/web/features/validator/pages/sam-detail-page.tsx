// Detail pengamatan SAM-iSAFE (D-26, D-26.e):
// hero skor + jawaban per kategori + temuan/tindak lanjut + review + audit + cetak.

import { useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, ClipboardCheck, Printer } from "lucide-react";
import { samCategoryScores } from "~/mocks/sam-isafe";
import { useValidatorState } from "~/shared/api/validator-state";
import { useCurrentUser } from "~/shared/auth/use-current-user";
import { EmptyState } from "~/shared/components/empty-state";
import { EvidencePreview } from "~/shared/components/evidence-preview";
import { StatusChip } from "~/shared/components/status-chip";
import { SamAuditTrail } from "../components/sam-audit-trail";
import { SamFollowUpSection } from "../components/sam-followup-section";
import { SamReviewBox } from "../components/sam-review-box";
import { SamScoreRing } from "../components/sam-score-ring";

function chipSkor(skor: 0 | 1 | 2): string {
  if (skor === 0) return "Tinggi";
  if (skor === 1) return "Sedang";
  return "Rendah";
}

export function Page() {
  const params = useParams();
  const state = useValidatorState();
  const user = useCurrentUser();
  const [pesan, setPesan] = useState("");
  const item = state.samAssessments.find((entry) => entry.id === params.id);
  const pesantren = state.institutions.find((entry) => entry.code === item?.institutionCode);
  const area = state.areas.find((entry) => entry.id === item?.areaId);
  const perKategori = useMemo(() => {
    if (!item) return [];
    return samCategoryScores(item, state.samCategories, state.samQuestions);
  }, [item, state.samCategories, state.samQuestions]);
  const tindak = useMemo(() => {
    if (!item) return [];
    return state.samFollowUps.filter((entry) => entry.assessmentId === item.id);
  }, [item, state.samFollowUps]);

  if (!item) {
    return (
      <section className="flex flex-col gap-4">
        <Link
          className="text-button"
          to="/validator/sam-isafe"
        >
          <ArrowLeft size={15} />
          Kembali ke riwayat
        </Link>
        <EmptyState
          title="Pengamatan tidak ditemukan"
          description="Periksa kembali kode pengamatan."
        />
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2 print:hidden">
        <Link
          className="text-button"
          to="/validator/sam-isafe"
        >
          ← Kembali ke riwayat
        </Link>
        <button
          type="button"
          className="secondary-button ms-auto"
          onClick={() => window.print()}
        >
          <Printer size={15} />
          Cetak / simpan PDF
        </button>
      </div>
      {pesan ? (
        <p
          role="status"
          className="text-sm print:hidden"
        >
          {pesan}
        </p>
      ) : null}
      <header className="surface overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-line bg-brand-bg px-5 py-4">
          <span className="grid size-10 place-items-center rounded-xl bg-white text-primary shadow-sm">
            <ClipboardCheck size={20} />
          </span>
          <div className="mr-auto">
            <p className="kicker">Detail pengamatan</p>
            <p className="mt-1 text-sm font-bold text-heading">{item.id} · {item.kind}</p>
          </div>
          <span className="text-xs font-semibold text-secondary-text">Data internal Validator</span>
        </div>
        <div className="p-5 sm:p-6">
        <p className="kicker">
          {item.id} · {item.kind}
        </p>
        <h1 className="text-2xl font-extrabold text-heading">
          {item.percent.toFixed(1)}% · {item.riskLevel}
        </h1>
        <div className="mt-2 flex flex-wrap gap-2">
          <StatusChip value={item.status} />
          <StatusChip
            value={
              item.riskLevel === "Risiko Rendah"
                ? "Rendah"
                : item.riskLevel === "Risiko Sedang"
                  ? "Sedang"
                  : "Tinggi"
            }
          />
          {item.reviewedBy ? (
            <StatusChip value="Ditinjau" />
          ) : null}
        </div>
        </div>
      </header>
      <section className="surface p-5">
        <div className="grid gap-4 md:grid-cols-[auto_1fr] md:items-center">
          <SamScoreRing
            percent={item.percent}
            risk={item.riskLevel}
            total={item.totalScore}
            max={item.maxScore}
          />
          <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs font-bold text-secondary-text">
                Pesantren
              </dt>
              <dd className="text-heading">
                {pesantren?.name ?? item.institutionCode}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold text-secondary-text">
                Lokasi
              </dt>
              <dd className="text-heading">
                {item.manualLocation ?? area?.name ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold text-secondary-text">
                Waktu pengamatan
              </dt>
              <dd className="text-heading">
                {item.observedAt}
                {item.observedTime ? ` · ${item.observedTime}` : ""}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold text-secondary-text">
                Pengamat
              </dt>
              <dd className="text-heading">
                {item.observerName}
              </dd>
            </div>
          </dl>
        </div>
        {item.note ? (
          <p className="mt-3 border-t border-line pt-3 text-sm text-secondary-text">
            Keterangan: {item.note}
          </p>
        ) : null}
      </section>
      <section className="surface p-5">
        <h2 className="font-bold text-heading">
          Skor per kategori
        </h2>
        <div className="mt-3 flex flex-col gap-4">
          {perKategori.map((row) => {
            const soal = state.samQuestions
              .filter((entry) => entry.categoryId === row.category.id && entry.isActive)
              .sort((a, b) => a.sortOrder - b.sortOrder);
            return (
              <details
                key={row.category.id}
                className="rounded-lg border border-line"
              >
                <summary className="cursor-pointer list-none p-3">
                  <div className="flex items-baseline justify-between gap-2 text-sm">
                    <strong className="text-heading">
                      {row.category.name}
                    </strong>
                    <span className="text-secondary-text">
                      {row.total}/{row.max} · {row.percent.toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded bg-strip">
                    <div
                      className="h-2 rounded bg-primary"
                      style={{ width: `${row.percent}%` }}
                    />
                  </div>
                </summary>
                <div className="flex flex-col gap-3 border-t border-line p-3">
                  {soal.map((pertanyaan, index) => {
                    const jawaban = item.answers[pertanyaan.id];
                    const tindakSoal = tindak.find(
                      (entry) => entry.questionId === pertanyaan.id,
                    );
                    return (
                      <div key={pertanyaan.id}>
                        <p className="text-sm text-heading">
                          {index + 1}. {pertanyaan.text}
                        </p>
                        <p className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                          {jawaban ? (
                            <StatusChip value={chipSkor(jawaban.score)} />
                          ) : (
                            <StatusChip value="Belum ditentukan" />
                          )}
                          <span className="text-secondary-text">
                            Skor {jawaban?.score ?? "—"}
                          </span>
                          {tindakSoal ? (
                            <StatusChip value={tindakSoal.status} />
                          ) : null}
                        </p>
                        {jawaban?.note ? (
                          <p className="mt-1 text-sm text-secondary-text">
                            Catatan: {jawaban.note}
                          </p>
                        ) : null}
                        <EvidencePreview
                          assetId={jawaban?.evidenceAssetId}
                          institutionCode={item.institutionCode}
                          name={jawaban?.evidenceName}
                        />
                      </div>
                    );
                  })}
                </div>
              </details>
            );
          })}
        </div>
      </section>
      <section className="surface p-5 print:hidden">
        <h2 className="font-bold text-heading">
          Temuan & tindak lanjut
        </h2>
        <p className="mb-3 text-xs text-faint">
          Temuan otomatis dari jawaban skor 0/1. Kelola tindak lanjut per temuan.
        </p>
        <SamFollowUpSection
          assessment={item}
          questions={state.samQuestions}
          followUps={tindak}
          accountId={user?.id}
          onPesan={setPesan}
        />
      </section>
      <section className="surface p-5 print:hidden">
        <h2 className="font-bold text-heading">
          Review supervisor
        </h2>
        <div className="mt-2">
          <SamReviewBox
            assessment={item}
            accountId={user?.id}
            onPesan={setPesan}
          />
        </div>
      </section>
      <section className="surface p-5 print:hidden">
        <h2 className="font-bold text-heading">
          Jejak audit
        </h2>
        <div className="mt-2">
          <SamAuditTrail
            assessmentId={item.id}
            followUps={tindak}
            events={state.auditEvents}
          />
        </div>
      </section>
    </section>
  );
}
