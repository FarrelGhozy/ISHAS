import { Link, useSearchParams } from "react-router";
import { PublicCampusMap } from "../components/public-campus-map";
import { ExternalLink } from "lucide-react";
import { useMockState } from "~/mocks/store/mock-store";
import {
  selectFindingsByReports,
  selectInstitutionByCode,
  selectRecommendationsByReports,
  selectRegisteredInstitutions,
  selectPublicReports,
} from "~/mocks/store/selectors";
import {
  hitungIndexSummary,
  knownPeriods,
  resolvePeriodeParam,
} from "~/mocks/processors/dashboard-aggregate";
import { EmptyState } from "~/shared/components/empty-state";
import { StatusChip } from "~/shared/components/status-chip";
import { PublicFilter } from "../components/public-filter";
import { LaporanPdfList } from "../components/laporan-pdf-card";

export type PublicReadKind = "hasil" | "peta" | "rekomendasi" | "tindak-lanjut";

const TITLES: Record<PublicReadKind, string> = {
  hasil: "Hasil penilaian",
  peta: "Peta bahaya dan risiko",
  rekomendasi: "Rekomendasi",
  "tindak-lanjut": "Tindak lanjut",
};

function PublicHeader({ kind }: { kind: PublicReadKind }) {
  return (
    <header>
      <p className="kicker">Data publik · ilustrasi</p>
      <h1 className="text-2xl font-extrabold text-heading">{TITLES[kind]}</h1>
      <p className="mt-1 text-sm text-secondary-text">
        Ringkasan data tervalidasi; nama pelapor, kontak, denah rinci, dan jawaban mentah
        tidak ditampilkan. Foto bukti hanya tampil pada PDF laporan.
      </p>
    </header>
  );
}

export function PublicReadPage({ kind }: { kind: PublicReadKind }) {
  const state = useMockState();
  const [params] = useSearchParams();
  const institutions = selectRegisteredInstitutions(state);
  const requested = params.get("pesantren") ?? undefined;
  const selected =
    requested && institutions.some((item) => item.code === requested) ? requested : undefined;
  const reports = selectPublicReports(state, selected ?? null);
  const findings = selectFindingsByReports(state, reports);
  const recommendations = selectRecommendationsByReports(state, reports);
  const scope = selectInstitutionByCode(state, selected)?.name ?? "Semua pesantren terdaftar";
  const { invalid: invalidPeriode } = resolvePeriodeParam(
    params.get("periode"),
    knownPeriods(state.indexHistory),
  );

  return (
    <section className="flex flex-col gap-5">
      <PublicHeader kind={kind} />
      {requested && !selected ? (
        <p
          role="status"
          className="rounded-lg border border-line bg-strip p-3 text-sm text-secondary-text"
        >
          Pesantren pada tautan tidak tersedia. Menampilkan semua pesantren terdaftar.
        </p>
      ) : null}
      {invalidPeriode ? (
        <p
          role="status"
          className="rounded-lg border border-line bg-strip p-3 text-sm text-secondary-text"
        >
          Periode &quot;{invalidPeriode}&quot; tidak tersedia. Menampilkan periode berjalan.
        </p>
      ) : null}
      <PublicFilter institutions={institutions} />
      {kind === "peta" ? (
        <PublicCampusMap institutionCode={selected} />
      ) : reports.length === 0 ? (
        <EmptyState
          title={`Belum ada data tervalidasi untuk ${scope}.`}
          description="Laporan Menunggu validasi atau Ditolak tidak pernah tampil di halaman publik."
        />
      ) : kind === "hasil" ? (
        <Results
          state={state}
          codes={selected ? [selected] : institutions.map((item) => item.code)}
          reports={reports}
          findings={findings}
          recommendations={recommendations}
        />
      ) : kind === "rekomendasi" ? (
        <Recommendations recommendations={recommendations} />
      ) : (
        <FollowUps recommendations={recommendations} />
      )}
    </section>
  );
}

function Results({
  state,
  codes,
  reports,
  findings,
  recommendations,
}: {
  state: ReturnType<typeof useMockState>;
  codes: string[];
  reports: ReturnType<typeof selectPublicReports>;
  findings: ReturnType<typeof selectFindingsByReports>;
  recommendations: ReturnType<typeof selectRecommendationsByReports>;
}) {
  const summary = hitungIndexSummary(
    {
      reports,
      selfAssessmentSnapshots: state.selfAssessmentSnapshots,
      instrumentVersions: state.instrumentVersions,
      indexHistory: state.indexHistory,
      instrument: state.instrument,
    },
    codes,
  );
  const temuanAktif = findings.filter(
    (item) => item.status !== "Terverifikasi" && item.status !== "Dibatalkan",
  ).length;
  const terverifikasi = recommendations.filter((item) => item.status === "Terverifikasi").length;
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <article className="stat-card">
        <p className="text-sm font-bold text-secondary-text">Indeks K3L</p>
        <p className="mt-2 text-4xl font-extrabold text-heading">
          {summary.currentIndex === null ? "—" : Math.round(summary.currentIndex)}
        </p>
        <p className="mt-2 text-sm text-secondary-text">Kategori ilustratif · {summary.periode}</p>
      </article>
      <article className="stat-card">
        <p className="text-sm font-bold text-secondary-text">Temuan aktif</p>
        <p className="mt-2 text-4xl font-extrabold text-heading">{temuanAktif}</p>
        <p className="mt-2 text-sm text-secondary-text">Perlu tindak lanjut</p>
      </article>
      <article className="stat-card">
        <p className="text-sm font-bold text-secondary-text">Terverifikasi</p>
        <p className="mt-2 text-4xl font-extrabold text-heading">{terverifikasi}</p>
        <p className="mt-2 text-sm text-secondary-text">Tindak lanjut selesai</p>
      </article>
      <article className="surface p-4 lg:col-span-3">
        <h2 className="font-extrabold text-heading">Dimensi hasil</h2>
        <p className="mt-1 text-sm text-secondary-text">
          Bank instrumen dan kategori adalah data ilustrasi.
        </p>
        <ul className="mt-4 space-y-3">
          {summary.dimensions.map((dimension) => (
            <li key={dimension.id} className="flex items-center gap-3">
              <span className="min-w-0 flex-1 text-sm font-semibold text-heading">
                {dimension.name}
              </span>
              <strong>{Math.round(dimension.score ?? 0)}</strong>
              <div className="h-2 w-24 overflow-hidden rounded-full bg-strip">
                <div
                  className="h-full bg-accent"
                  style={{ width: `${Math.round(dimension.score ?? 0)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </article>
      <article className="surface p-4 lg:col-span-3">
        <h2 className="font-extrabold text-heading">Laporan PDF penilaian</h2>
        <p className="mt-1 text-sm text-secondary-text">
          Satu penilai menghasilkan satu PDF berisi skor, dimensi, temuan, dan bukti foto.
          Buka lalu cetak/simpan sebagai PDF lewat browser.
        </p>
        <div className="mt-3">
          <LaporanPdfList reports={reports} />
        </div>
      </article>
    </div>
  );
}

function Recommendations({
  recommendations,
}: {
  recommendations: ReturnType<typeof selectRecommendationsByReports>;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {recommendations.map((item) => (
        <article key={item.id} className="surface flex flex-col gap-3 p-4">
          <div className="flex flex-wrap gap-2">
            <StatusChip value={item.priority} />
            <StatusChip value={item.status} />
          </div>
          <h2 className="font-extrabold text-heading">{item.title}</h2>
          <p className="text-sm text-secondary-text">{item.location}</p>
          <p className="text-sm text-body-text">{item.action}</p>
          {item.status === "Dibatalkan" && item.canceledReason ? (
            <p className="rounded-lg bg-strip p-3 text-sm text-secondary-text">
              Alasan pembatalan: {item.canceledReason}
            </p>
          ) : null}
          <div className="mt-auto">
            <p className="text-sm text-secondary-text">PIC: {item.owner}</p>
            <Progress value={item.progress} />
            <Link className="text-button mt-3" to="/login">
              Masuk untuk kelola <ExternalLink size={14} />
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}

function FollowUps({
  recommendations,
}: {
  recommendations: ReturnType<typeof selectRecommendationsByReports>;
}) {
  return (
    <div className="space-y-3">
      {recommendations.map((item) => (
        <article key={item.id} className="surface p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-extrabold text-heading">{item.title}</h2>
              <p className="mt-1 text-sm text-secondary-text">
                PIC: {item.owner || "—"} · {item.location}
              </p>
              <p className="mt-1 text-sm text-secondary-text">
                {item.source} · Prioritas {item.priority}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusChip value={item.status} />
              <StatusChip value={item.priority} />
            </div>
          </div>
          <Progress value={item.progress} />
          {item.status === "Dibatalkan" ? (
            <p className="mt-3 rounded-lg bg-strip p-3 text-sm text-secondary-text">
              Perbaikan ini dibatalkan.
              {item.canceledReason ? ` Alasan: ${item.canceledReason}` : ""}
            </p>
          ) : (
            <p className="mt-3 text-sm text-secondary-text">
              Progres dan status ditampilkan sebagai ringkasan publik. Bukti penyelesaian, tenggat,
              dan catatan internal tidak ditampilkan.
            </p>
          )}
        </article>
      ))}
    </div>
  );
}

function Progress({ value }: { value: number }) {
  return (
    <div className="mt-3">
      <div className="flex justify-between text-sm text-secondary-text">
        <span>Progres</span>
        <strong>{value}%</strong>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-strip">
        <div className="h-full bg-accent" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
