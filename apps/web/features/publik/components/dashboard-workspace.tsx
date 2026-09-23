import { Brain, Building2, HeartPulse, Leaf, Minus, ShieldCheck } from "lucide-react";
import { Link, useSearchParams } from "react-router";
import type {
  DashboardDistribution,
  IndexSummary,
  RekapKategori,
} from "~/mocks/processors/dashboard-aggregate";
import { hitungRekapKategori } from "~/mocks/processors/dashboard-aggregate";
import { K3_CATEGORIES } from "~/mocks/kategori-k3";
import type {
  Area,
  InstrumentVersion,
  Recommendation,
  Report,
  RiskFinding,
  SelfAssessmentSnapshot,
} from "~/mocks/types";
import { StatusChip } from "~/shared/components/status-chip";

const KATEGORI_ICONS = { ShieldCheck, HeartPulse, Leaf, Brain } as const;

export function ScoreSummary({
  summary,
  snapshots,
  versions,
}: {
  summary: IndexSummary;
  snapshots: SelfAssessmentSnapshot[];
  versions: InstrumentVersion[];
}) {
  const expected = new Map(
    versions.map((version) => [
      version.id,
      version.dimensions.flatMap((dimension) => dimension.indicators).length,
    ]),
  );
  const answers = snapshots.reduce(
    (total, snapshot) =>
      total + Object.values(snapshot.answers).filter((answer) => answer.value.trim()).length,
    0,
  );
  const indicators = snapshots.reduce(
    (total, snapshot) => total + (expected.get(snapshot.instrumentVersionId) ?? 0),
    0,
  );
  const percentage =
    summary.currentIndex === null
      ? 0
      : Math.max(0, Math.min(100, Math.round(summary.currentIndex)));
  return (
    <article className="surface flex min-w-0 items-center p-4" aria-labelledby="score-title">
      <div className="flex w-full flex-col items-center gap-4 sm:flex-row sm:items-center">
        <div
          className="relative grid size-36 shrink-0 place-items-center rounded-full"
          style={{
            background: `conic-gradient(#9f1239 ${percentage}%, #eef2f6 ${percentage}% 100%)`,
          }}
        >
          <span className="grid size-24 place-items-center rounded-full bg-white text-center">
            <span>
              <strong className="block text-3xl text-heading">
                {summary.currentIndex === null ? "—" : percentage}
              </strong>
              <span className="text-xs font-bold text-secondary-text">/100 · ilustrasi</span>
            </span>
          </span>
        </div>
        <div className="w-full min-w-0 flex-1">
          <p className="kicker">Ringkasan kondisi</p>
          <h2 id="score-title" className="text-lg font-extrabold text-heading">
            Indeks K3L Pesantren
          </h2>
          <p className="mt-1 text-xs text-secondary-text">
            Skor dari snapshot penilaian mandiri yang telah diterima.
          </p>
          <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Metric label="Jawaban diharapkan" value={indicators} />
            <Metric label="Jawaban terisi" value={answers} />
            <Metric label="Penilaian diterima" value={snapshots.length} />
          </dl>
        </div>
      </div>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-strip px-3 py-2">
      <dt className="text-xs font-bold text-secondary-text">{label}</dt>
      <dd className="mt-0.5 text-xl font-extrabold text-heading">{value}</dd>
    </div>
  );
}

export function AspectAndRecap({
  findings,
  versions,
  areas,
  distribution,
  reports,
}: {
  findings: RiskFinding[];
  versions: InstrumentVersion[];
  areas: Area[];
  distribution: DashboardDistribution;
  reports?: Report[];
}) {
  const rows = hitungRekapKategori({ reports: reports ?? [], findings, snapshots: [], versions });
  const aspectItems = rows.filter((row) => row.categoryId || row.jumlahTemuan > 0);
  const maxAspect = Math.max(...aspectItems.map((row) => row.jumlahTemuan), 1);
  const areaById = new Map(areas.map((area) => [area.id, area]));
  const multipleInstitutions = new Set(areas.map((area) => area.institutionCode)).size > 1;
  const byArea = new Map<
    string,
    { name: string; code?: string; total: number; risks: Record<string, number> }
  >();
  for (const finding of findings) {
    const area = areaById.get(finding.areaId);
    const key = area?.id ?? `${finding.reportId}:${finding.location}`;
    const entry = byArea.get(key) ?? {
      name: area?.name ?? finding.location,
      code: area?.institutionCode,
      total: 0,
      risks: {},
    };
    entry.total += 1;
    entry.risks[finding.level] = (entry.risks[finding.level] ?? 0) + 1;
    byArea.set(key, entry);
  }
  return (
    <section className="grid items-start gap-3 xl:grid-cols-2" aria-label="Rekapitulasi dashboard">
      <article className="surface flex flex-col p-4 xl:h-[22rem]">
        <h2 className="text-sm font-extrabold text-heading">Temuan per kategori</h2>
        <p className="mt-1 text-xs text-secondary-text">
          Jumlah temuan tervalidasi · skala 0–{maxAspect} temuan
        </p>
        <div className="mt-4 space-y-3 sm:hidden" aria-label="Jumlah temuan per kategori">
          {aspectItems.map((row) => (
            <div key={row.name}>
              <div className="flex justify-between gap-3 text-sm">
                <span className="font-semibold text-heading">{row.name}</span>
                <strong>{row.jumlahTemuan}</strong>
              </div>
              <div className="mt-1 h-2 rounded-full bg-strip">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${(row.jumlahTemuan / maxAspect) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 hidden sm:block xl:mt-auto">
          <svg
            viewBox={`0 0 ${aspectItems.length * 100} 220`}
            className="block h-56 w-full"
            role="img"
            aria-label={aspectItems
              .map((row) => `${row.name}: ${row.jumlahTemuan} temuan`)
              .join(", ")}
          >
            {[0, 0.5, 1].map((ratio) => (
              <line
                key={ratio}
                x1="0"
                x2={aspectItems.length * 100}
                y1={170 - ratio * 140}
                y2={170 - ratio * 140}
                stroke="#e2e8f0"
                strokeDasharray={ratio ? "4 4" : undefined}
              />
            ))}
            {aspectItems.map((row, index) => {
              const height = (row.jumlahTemuan / maxAspect) * 140;
              return (
                <g key={row.name}>
                  <title>
                    {row.name}: {row.jumlahTemuan} temuan
                  </title>
                  <rect
                    x={index * 100 + 25}
                    y={170 - height}
                    width="50"
                    height={height}
                    rx="3"
                    fill={row.categoryId ? "#9f1239" : "#94a3b8"}
                  />
                  <text
                    x={index * 100 + 50}
                    y={160 - height}
                    textAnchor="middle"
                    fontSize="14"
                    fontWeight="800"
                    fill="#102a35"
                  >
                    {row.jumlahTemuan}
                  </text>
                  <text
                    x={index * 100 + 50}
                    y="193"
                    textAnchor="middle"
                    fontSize="11"
                    fill="#334155"
                  >
                    {row.categoryId ? row.name : "Belum"}
                  </text>
                  {!row.categoryId ? (
                    <text
                      x={index * 100 + 50}
                      y="208"
                      textAnchor="middle"
                      fontSize="11"
                      fill="#334155"
                    >
                      dipetakan
                    </text>
                  ) : null}
                </g>
              );
            })}
          </svg>
        </div>
      </article>
      <article className="surface flex min-w-0 flex-col overflow-hidden xl:h-[22rem]">
        <div className="shrink-0 p-4">
          <h2 className="text-sm font-extrabold text-heading">Rekapitulasi lokasi & risiko</h2>
          <p className="mt-0.5 text-xs text-secondary-text">
            Setiap angka memakai temuan yang sama dengan distribusi risiko.
          </p>
          <p className="mt-1 hidden text-xs text-secondary-text xl:block">
            Geser tabel ke atas atau bawah untuk melihat seluruh lokasi.
          </p>
        </div>
        <div
          className="overflow-auto overscroll-contain xl:min-h-0 xl:flex-1"
          tabIndex={0}
          role="region"
          aria-label="Rekap lokasi dan tingkat risiko"
        >
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead className="sticky top-0 z-10 bg-strip text-xs text-secondary-text">
              <tr>
                <th className="px-4 py-2">Lokasi</th>
                <th className="px-4 py-2 text-right">Temuan</th>
                <th className="px-4 py-2">Tingkat risiko</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {[...byArea.entries()]
                .sort((a, b) => b[1].total - a[1].total)
                .map(([id, entry]) => (
                  <tr key={id}>
                    <td className="px-4 py-3 font-semibold text-heading">
                      {entry.name}
                      {multipleInstitutions && entry.code ? (
                        <span className="mt-1 block text-xs font-normal text-secondary-text">
                          {entry.code}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-right font-extrabold text-heading">
                      {entry.total}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {distribution.risiko
                          .filter((item) => entry.risks[item.label])
                          .map((item) => (
                            <span key={item.label} className="whitespace-nowrap">
                              <StatusChip value={item.label} />{" "}
                              <strong className="text-xs">{entry.risks[item.label]}</strong>
                            </span>
                          ))}
                      </div>
                    </td>
                  </tr>
                ))}
              {!byArea.size ? (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-secondary-text">
                    Belum ada temuan tercatat pada konteks ini.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <div className="shrink-0 border-t border-line p-4">
          <ul className="flex flex-wrap gap-3 text-xs font-semibold text-secondary-text">
            {distribution.risiko.map((item) => (
              <li key={item.label}>
                <StatusChip value={item.label} /> <span className="ml-1">{item.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </article>
    </section>
  );
}

export function RekapKategoriPanel({
  reports,
  findings,
  snapshots,
  versions,
}: {
  reports: Report[];
  findings: RiskFinding[];
  snapshots: SelfAssessmentSnapshot[];
  versions: InstrumentVersion[];
}) {
  const rows: RekapKategori[] = hitungRekapKategori({ reports, findings, snapshots, versions });
  return (
    <article className="surface min-w-0 overflow-hidden" aria-label="Rekapitulasi per kategori K3">
      <div className="p-4">
        <h2 className="text-sm font-extrabold text-heading">Rekapitulasi per kategori</h2>
        <p className="mt-0.5 text-xs text-secondary-text">
          Indikator (katalog) · sesuai/tidak sesuai (snapshot Diterima) · temuan · sebaran risiko.
          Jawaban kosong, N/A, atau di luar skala versi asal tidak diklasifikasi. Data ilustrasi.
        </p>
        <p className="mt-1.5 text-xs font-semibold text-secondary-text xl:hidden">
          Geser tabel ke kanan untuk melihat semua kolom →
        </p>
      </div>
      <div className="border-t border-line">
        <TabelRekap rows={rows} />
      </div>
    </article>
  );
}

function TabelRekap({ rows }: { rows: RekapKategori[] }) {
  const firstCol = "sticky left-0 bg-white shadow-[1px_0_0_var(--color-line)]";
  const total = rows.reduce(
    (sum, row) => [
      sum[0] + row.jumlahIndikator,
      sum[1] + row.jumlahTemuan,
      sum[2] + row.jumlahSesuai,
      sum[3] + row.jumlahTidakSesuai,
      sum[4] + row.risiko.Rendah,
      sum[5] + row.risiko.Sedang,
      sum[6] + row.risiko.Tinggi,
      sum[7] + row.risiko.Ekstrem,
    ],
    Array(8).fill(0) as number[],
  );
  return (
    <div
      className="overflow-x-auto"
      tabIndex={0}
      role="region"
      aria-label="Tabel rincian per kategori"
    >
      <table className="w-full min-w-[880px] text-left text-base md:min-w-[760px] md:text-sm">
        <thead className="whitespace-nowrap bg-strip text-sm font-extrabold text-secondary-text md:text-xs">
          <tr>
            <th
              scope="col"
              className={`min-w-[11rem] px-5 py-3 md:min-w-0 md:px-4 md:py-2 ${firstCol}`}
            >
              Kategori
            </th>
            <th scope="col" className="px-5 py-3 text-right md:px-4 md:py-2">
              Indikator
            </th>
            <th scope="col" className="px-5 py-3 text-right md:px-4 md:py-2">
              Temuan
            </th>
            <th scope="col" className="px-5 py-3 text-right md:px-4 md:py-2">
              Sesuai
            </th>
            <th scope="col" className="px-5 py-3 text-right md:px-4 md:py-2">
              Tidak sesuai
            </th>
            <th scope="col" className="px-5 py-3 text-right md:px-4 md:py-2">
              Rendah
            </th>
            <th scope="col" className="px-5 py-3 text-right md:px-4 md:py-2">
              Sedang
            </th>
            <th scope="col" className="px-5 py-3 text-right md:px-4 md:py-2">
              Tinggi
            </th>
            <th scope="col" className="px-5 py-3 text-right md:px-4 md:py-2">
              Ekstrem
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row) => {
            const cat = K3_CATEGORIES.find((c) => c.id === row.categoryId);
            const Icon = cat ? KATEGORI_ICONS[cat.icon] : Minus;
            return (
              <tr key={row.name}>
                <td
                  className={`px-5 py-3.5 font-semibold text-heading md:px-4 md:py-3 ${firstCol}`}
                >
                  <span className="flex items-center gap-2">
                    <Icon size={16} className="shrink-0 text-primary" aria-hidden />
                    {row.name}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right font-extrabold text-heading md:px-4 md:py-3">
                  {row.jumlahIndikator}
                </td>
                <td className="px-5 py-3.5 text-right font-extrabold text-heading md:px-4 md:py-3">
                  {row.jumlahTemuan}
                </td>
                <td className="px-5 py-3.5 text-right md:px-4 md:py-3">{row.jumlahSesuai}</td>
                <td className="px-5 py-3.5 text-right md:px-4 md:py-3">{row.jumlahTidakSesuai}</td>
                <td className="px-5 py-3.5 text-right md:px-4 md:py-3">{row.risiko.Rendah}</td>
                <td className="px-5 py-3.5 text-right md:px-4 md:py-3">{row.risiko.Sedang}</td>
                <td className="px-5 py-3.5 text-right md:px-4 md:py-3">{row.risiko.Tinggi}</td>
                <td className="px-5 py-3.5 text-right md:px-4 md:py-3">{row.risiko.Ekstrem}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot className="border-t border-line bg-strip font-extrabold text-heading">
          <tr>
            <th scope="row" className={`px-5 py-3 ${firstCol}`}>
              Total
            </th>
            {total.map((value, index) => (
              <td key={index} className="px-5 py-3 text-right">
                {value}
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="mt-4 rounded-md bg-strip p-3 text-sm text-secondary-text">{text}</p>;
}

export function FollowUpSummary({
  recommendations,
  institutionCode,
}: {
  recommendations: Recommendation[];
  institutionCode?: string;
}) {
  const [params] = useSearchParams();
  const context = new URLSearchParams();
  const code = institutionCode ?? params.get("pesantren");
  if (code) context.set("pesantren", code);
  if (params.get("periode")) context.set("periode", params.get("periode")!);
  return (
    <article className="surface min-w-0 overflow-hidden">
      <div className="flex flex-wrap items-start gap-2 border-b border-line p-4">
        <Building2 size={17} className="text-primary" aria-hidden />
        <div>
          <h2 className="text-sm font-extrabold text-heading">Tindak lanjut terbaru</h2>
          <p className="text-xs text-secondary-text">
            PIC dan status penanganan yang dapat dibaca publik.
          </p>
        </div>
        <Link
          to={`/tindak-lanjut${context.size ? `?${context}` : ""}`}
          className="text-button ms-auto"
        >
          Lihat semua
        </Link>
      </div>
      {recommendations.length ? (
        <ul className="divide-y divide-line">
          {recommendations.slice(0, 3).map((recommendation) => (
            <li key={recommendation.id} className="flex flex-wrap items-center gap-2 p-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-heading">{recommendation.title}</p>
                <p className="mt-0.5 text-xs text-secondary-text">
                  PIC: {recommendation.owner} · progres {recommendation.progress}%
                </p>
              </div>
              <StatusChip value={recommendation.status} />
            </li>
          ))}
        </ul>
      ) : (
        <Empty text="Belum ada tindak lanjut publik untuk konteks ini." />
      )}
    </article>
  );
}

export function CategoryGuide() {
  return (
    <article className="surface min-w-0 p-4" aria-label="Kategori K3">
      <h2 className="text-sm font-extrabold text-heading">Kategori K3</h2>
      <p className="mt-1 text-xs text-secondary-text">Empat kategori pada instrumen prototipe.</p>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2 2xl:grid-cols-1">
        {K3_CATEGORIES.map((category) => {
          const Icon = KATEGORI_ICONS[category.icon];
          return (
            <li
              key={category.id}
              className="flex items-start gap-3 rounded-lg border border-line bg-strip/50 p-3"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-marun-bg text-primary">
                <Icon size={20} aria-hidden />
              </span>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-heading">{category.name}</h3>
                <p className="mt-1 text-xs leading-relaxed text-secondary-text">
                  {category.description}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </article>
  );
}
