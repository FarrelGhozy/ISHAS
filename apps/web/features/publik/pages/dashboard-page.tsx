// Dashboard publik `/` — final visual & fungsional (V2-02).
// Sumber data HANYA report `Diterima` (selector) — laporan Menunggu validasi/Ditolak
// tidak pernah memengaruhi angka/grafik/temuan. Tanpa panel count antrean (D-02).
// Filter pesantren satu sumber: URL ?pesantren= (ROUTES §1); mengubah seluruh konten.

import { useMemo } from "react";
import { Link, useSearchParams } from "react-router";
import { useMockState } from "~/mocks/store/mock-store";
import {
  selectFindingsByReports,
  selectInstitutionByCode,
  selectRegisteredInstitutions,
  selectRecommendationsByReports,
  selectPublicReports,
  selectUserById,
} from "~/mocks/store/selectors";
import {
  buatDashboardInsight,
  hitungIndexSummary,
  knownPeriods,
  pilihTemuanPrioritas,
  resolvePeriodeParam,
  ringkasTindakLanjut,
} from "~/mocks/processors/dashboard-aggregate";
import { EmptyState } from "~/shared/components/empty-state";
import { ContextBar } from "../components/context-bar";
import { ScopeBanner } from "../components/scope-banner";
import { StatCards } from "../components/stat-cards";
import { IndexTrendPanel } from "../components/index-trend-panel";
import { DimensionPanel } from "../components/dimension-panel";
import { FindingsPanel } from "../components/findings-panel";
import { PublicInsightPanels } from "../components/public-insight-panels";
import { AspectAndRecap, CategoryGuide, FollowUpSummary, RekapKategoriPanel, ScoreSummary } from "../components/dashboard-workspace";
import { PublicCampusMap } from "../components/public-campus-map";
import {
  InstitutionComparisonPanel,
  type InstitutionComparisonItem,
} from "../components/institution-comparison-panel";

export function DashboardPage({ lockedInstitutionCode }: { lockedInstitutionCode?: string }) {
  const state = useMockState();
  const [searchParams] = useSearchParams();

  const registered = selectRegisteredInstitutions(state);
  const isLocked = Boolean(lockedInstitutionCode);
  const rawParam = lockedInstitutionCode ?? searchParams.get("pesantren") ?? undefined;
  const selected =
    rawParam && registered.some((i) => i.code === rawParam) ? rawParam : undefined;
  const pesantrenInvalid = Boolean(rawParam && !selected);

  const known = knownPeriods(state.indexHistory);
  const requestedPeriode = searchParams.get("periode") ?? undefined;
  const { selected: selectedPeriode, invalid: invalidPeriode } = resolvePeriodeParam(
    requestedPeriode,
    known,
  );

  const reports = useMemo(() => selectPublicReports(state, selected ?? null), [state, selected]);
  const findings = useMemo(() => selectFindingsByReports(state, reports), [state, reports]);
  const recommendations = useMemo(
    () => selectRecommendationsByReports(state, reports),
    [state, reports],
  );

  const selectedInstitution = selectInstitutionByCode(state, selected);
  const rawInstitution = selectInstitutionByCode(state, rawParam);
  const scopeLabel = selectedInstitution ? selectedInstitution.name : "Semua terdaftar";

  if (isLocked && pesantrenInvalid) {
    // ROUTES §3 + D-08: filter terkunci tidak fallback diam-diam.
    // Bedakan kode tak dikenal vs dikenal-tapi-tidak-terdaftar.
    const isKnown = Boolean(rawInstitution);
    return (
      <EmptyState
        title={isKnown ? "Pesantren tidak tersedia untuk publik" : "Pesantren tidak ditemukan"}
        description={
          isKnown
            ? `Kode "${rawParam}" tercatat tetapi tidak memenuhi syarat Pesantren terdaftar (Aktif + pengelola aktif). Hasil lama tidak tampil publik sesuai D-08.`
            : `Kode "${rawParam}" tidak dikenal. Periksa kembali tautan atau pilih pesantren dari dashboard.`
        }
        action={<Link className="secondary-button" to="/">Kembali ke dashboard</Link>}
      />
    );
  }

  // Angka indeks: per kode lembaga (aturan ilustrasi D-04) — bukan per laporan.
  const scopeCodes = selected ? [selected] : registered.map((i) => i.code);
  const summary = hitungIndexSummary(
    {
      reports,
      selfAssessmentSnapshots: state.selfAssessmentSnapshots,
      instrumentVersions: state.instrumentVersions,
      indexHistory: state.indexHistory,
    },
    scopeCodes,
  );
  const insight = buatDashboardInsight({
    reports,
    findings,
    recommendations,
    institutions: registered,
    users: state.users,
    buildings: state.buildings,
    areas: state.areas,
    scopeCodes,
  });

  const institutionComparison: InstitutionComparisonItem[] = registered
    .filter((institution) => scopeCodes.includes(institution.code))
    .map((institution) => {
      const institutionReports = selectPublicReports(state, institution.code);
      const institutionFindings = selectFindingsByReports(state, institutionReports);
      const institutionRecommendations = selectRecommendationsByReports(state, institutionReports);
      const institutionSummary = hitungIndexSummary(
        {
          reports: institutionReports,
          selfAssessmentSnapshots: state.selfAssessmentSnapshots,
          instrumentVersions: state.instrumentVersions,
          indexHistory: state.indexHistory,
        },
        [institution.code],
      );
      return {
        code: institution.code,
        name: institution.name,
        location: institution.location,
        index: institutionSummary.currentIndex,
        reports: institutionReports.length,
        activeFindings: institutionFindings.filter((finding) => finding.status !== "Terverifikasi").length,
        progress: ringkasTindakLanjut(institutionRecommendations).rataProgress,
      };
    });

  const temuanPrioritas = pilihTemuanPrioritas(findings, 4);
  const reportById = new Map(reports.map((r) => [r.id, r]));
  const instrumentLabel =
    summary.instrumentVersionIds.length === 1
      ? (state.instrumentVersions.find((v) => v.id === summary.instrumentVersionIds[0])?.label ?? null)
      : summary.instrumentVersionIds.length > 1
        ? "Beberapa versi instrumen"
        : null;

  if (registered.length === 0) {
    return (
      <section className="flex flex-col gap-5">
        <h1 className="text-2xl font-extrabold text-heading">Dashboard K3L Pesantren</h1>
        <ContextBar registered={registered} />
        <EmptyState
          title="Belum ada pesantren terdaftar"
          description="Pendaftaran dilakukan oleh Super Admin. Grafik dan statistik disembunyikan sampai ada pesantren terdaftar."
        />
      </section>
    );
  }

  const periodeNotice = invalidPeriode
    ? `Periode "${invalidPeriode}" tidak tersedia. Menampilkan periode ${summary.periode}.`
    : selectedPeriode && selectedPeriode !== summary.periode
      ? `Pratinjau periode ${selectedPeriode} (ilustrasi). Rincian filter periode menunggu D-04 final; angka utama tetap periode ${summary.periode}.`
      : null;

  if (reports.length === 0) {
    return (
      <section className="flex flex-col gap-5">
        <h1 className="text-2xl font-extrabold text-heading">Dashboard K3L Pesantren</h1>
        <ContextBar
          registered={registered}
          lockedInstitutionCode={lockedInstitutionCode}
          lockedName={selectedInstitution?.name}
        />
        {!isLocked && pesantrenInvalid ? (
          <p role="status" className="rounded-lg border border-line bg-strip p-3 text-sm text-secondary-text">
            Pesantren pada tautan tidak tersedia. Menampilkan semua pesantren terdaftar.
          </p>
        ) : null}
        {periodeNotice ? (
          <p role="status" className="rounded-lg border border-line bg-strip p-3 text-sm text-secondary-text">
            {periodeNotice}
          </p>
        ) : null}
        <EmptyState
          title={`Belum ada hasil tervalidasi untuk ${scopeLabel}.`}
          description="Laporan Menunggu validasi atau Ditolak tidak pernah tampil di dashboard publik."
        />
        <PublicCampusMap institutionCode={selected} compact />
      </section>
    );
  }

  return (
      <section className="min-w-0 flex flex-col gap-5">
        <div>
        <p className="kicker">Ringkasan publik</p>
        <h1 className="text-2xl font-extrabold text-heading">Dashboard K3L Pesantren</h1>
        <p className="mt-1 max-w-3xl text-sm text-secondary-text">
          Pantau cakupan, hasil penilaian, tingkat risiko, dan kemajuan tindak lanjut dari data yang telah divalidasi.
        </p>
      </div>
      <ContextBar
        registered={registered}
        lockedInstitutionCode={lockedInstitutionCode}
        lockedName={selectedInstitution?.name}
      />
      {!isLocked && pesantrenInvalid ? (
        <p role="status" className="rounded-lg border border-line bg-strip p-3 text-sm text-secondary-text">
          Pesantren pada tautan tidak tersedia. Menampilkan semua pesantren terdaftar.
        </p>
      ) : null}
      {periodeNotice ? (
        <p role="status" className="rounded-lg border border-line bg-strip p-3 text-sm text-secondary-text">
          {periodeNotice}
        </p>
      ) : null}

      <ScopeBanner
        scopeLabel={scopeLabel}
        periode={summary.periode}
        instrumentLabel={instrumentLabel}
      />

      <div className="grid min-w-0 items-start gap-4 2xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-4">
          <div className="grid min-w-0 gap-3 xl:grid-cols-2">
            <ScoreSummary summary={summary} snapshots={state.selfAssessmentSnapshots.filter((snapshot) => reportById.has(snapshot.reportId))} versions={state.instrumentVersions} />
            <IndexTrendPanel summary={summary} />
          </div>
          <StatCards summary={summary} findings={findings} recommendations={recommendations} />
          <PublicInsightPanels distribution={insight.distribution} />
          <AspectAndRecap findings={findings} versions={state.instrumentVersions} areas={state.areas.filter((area) => scopeCodes.includes(area.institutionCode))} distribution={insight.distribution} reports={reports} />
          <RekapKategoriPanel reports={reports} findings={findings} snapshots={state.selfAssessmentSnapshots.filter((snapshot) => reportById.has(snapshot.reportId))} versions={state.instrumentVersions} />
          <FindingsPanel institutionCode={selected} findings={temuanPrioritas} reportById={reportById} userById={(id) => selectUserById(state, id)} />
        </div>
        <aside className="grid min-w-0 gap-3 xl:grid-cols-2 2xl:grid-cols-1" aria-label="Kategori, lokasi, dan tindak lanjut">
          <CategoryGuide />
          <PublicCampusMap institutionCode={selected} compact />
          <FollowUpSummary recommendations={recommendations} institutionCode={selected} />
          <DimensionPanel dimensions={summary.dimensions} />
        </aside>
      </div>
        <InstitutionComparisonPanel items={institutionComparison} />
      </section>
  );
}
