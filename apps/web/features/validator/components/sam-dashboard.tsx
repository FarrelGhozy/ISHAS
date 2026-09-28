// Dashboard SAM-iSAFE: ringkasan + tren + rata-rata kategori (D-26.e).
// Murni baca pengamatan Selesai; angka berlabel ilustrasi.

import { useMemo } from "react";
import { Link } from "react-router";
import {
  samCategoryAverages,
  samCompleted,
} from "~/mocks/sam-isafe";
import { StatusChip } from "~/shared/components/status-chip";
import { SamScoreRing } from "./sam-score-ring";
import { SamTrendChart } from "./sam-trend-chart";
import type {
  Institution,
  SamAssessment,
  SamCategory,
  SamFollowUp,
  SamQuestion,
} from "~/mocks/types";

type Props = {
  assessments: SamAssessment[];
  followUps: SamFollowUp[];
  categories: SamCategory[];
  questions: SamQuestion[];
  institutions: Institution[];
  registeredCount: number;
};

export function SamDashboard(props: Props) {
  const { assessments, followUps, categories, questions, institutions, registeredCount } = props;
  const selesai = useMemo(() => samCompleted(assessments), [assessments]);
  const terakhir = selesai[selesai.length - 1];
  const namaPesantren = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of institutions) map.set(item.code, item.name);
    return map;
  }, [institutions]);
  const rataKategori = useMemo(
    () => samCategoryAverages(assessments, categories, questions),
    [assessments, categories, questions],
  );
  const tinggi = selesai.filter((item) => item.riskLevel === "Risiko Tinggi").length;
  const terbuka = followUps.filter((item) => item.status !== "Selesai" && item.status !== "Dibatalkan").length;
  const tren = useMemo(() => selesai.slice(-8), [selesai]);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 lg:grid-cols-5">
        <article className="surface p-5 lg:col-span-3">
          <p className="text-xs font-bold text-secondary-text">
            Pengamatan terakhir
          </p>
          {terakhir ? (
            <div className="mt-3">
              <SamScoreRing
                percent={terakhir.percent}
                risk={terakhir.riskLevel}
                total={terakhir.totalScore}
                max={terakhir.maxScore}
              />
              <p className="mt-3 text-sm text-secondary-text">
                {namaPesantren.get(terakhir.institutionCode) ?? terakhir.institutionCode} ·{" "}
                {terakhir.observedAt} · {terakhir.observerName}
              </p>
              <Link
                className="text-button mt-2 inline-block"
                to={`/validator/sam-isafe/${terakhir.id}`}
              >
                Buka detail {terakhir.id} →
              </Link>
            </div>
          ) : (
            <p className="mt-3 text-sm text-secondary-text">
              Belum ada pengamatan Selesai. Buat pengamatan baru untuk mulai menilai.
            </p>
          )}
        </article>
        <div className="grid grid-cols-2 gap-3 lg:col-span-2">
          <article className="stat-card">
            <p className="text-xs font-bold text-secondary-text">
              Pengamatan
            </p>
            <p className="mt-2 text-3xl font-extrabold text-heading">
              {assessments.length}
            </p>
            <p className="text-xs text-faint">
              {selesai.length} selesai
            </p>
          </article>
          <article className="stat-card stat-red">
            <p className="text-xs font-bold text-secondary-text">
              Risiko tinggi
            </p>
            <p className="mt-2 text-3xl font-extrabold text-heading">
              {tinggi}
            </p>
            <p className="text-xs text-faint">
              Tindakan segera
            </p>
          </article>
          <article className="stat-card stat-amber">
            <p className="text-xs font-bold text-secondary-text">
              Tindak lanjut terbuka
            </p>
            <p className="mt-2 text-3xl font-extrabold text-heading">
              {terbuka}
            </p>
            <p className="text-xs text-faint">
              Belum/berjalan
            </p>
          </article>
          <article className="stat-card">
            <p className="text-xs font-bold text-secondary-text">
              Pesantren terdaftar
            </p>
            <p className="mt-2 text-3xl font-extrabold text-heading">
              {registeredCount}
            </p>
            <p className="text-xs text-faint">
              Dapat dinilai
            </p>
          </article>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="surface p-5">
          <h2 className="font-bold text-heading">
            Perkembangan skor
          </h2>
          <p className="text-xs text-faint">
            Persen tiap pengamatan Selesai, dari terlama ke terbaru.
          </p>
          <div className="mt-3">
            {tren.length > 0 ? (
              <SamTrendChart items={tren} />
            ) : (
              <p className="text-sm text-secondary-text">
                Grafik muncul setelah ada pengamatan Selesai.
              </p>
            )}
          </div>
        </section>
        <section className="surface p-5">
          <h2 className="font-bold text-heading">
            Rata-rata per kategori
          </h2>
          <p className="text-xs text-faint">
            Lintas seluruh pengamatan Selesai. Data ilustrasi.
          </p>
          <div className="mt-3 flex flex-col gap-3">
            {rataKategori.map((row) => (
              <div key={row.category.id}>
                <div className="flex items-baseline justify-between gap-2 text-sm">
                  <span className="text-heading">
                    {row.category.name}
                  </span>
                  <strong className="text-heading">
                    {row.average === null ? "—" : `${row.average.toFixed(1)}%`}
                  </strong>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded bg-strip">
                  <div
                    className="h-2 rounded bg-primary"
                    style={{ width: `${row.average ?? 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      {terakhir?.reviewedBy ? (
        <div className="scope-banner">
          <StatusChip value="Ditinjau" />
          <span className="ml-2 text-sm">
            {terakhir.id} ditinjau {terakhir.reviewedBy}.
          </span>
        </div>
      ) : null}
    </div>
  );
}
