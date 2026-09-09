'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ChevronRight,
  FileCheck2,
  FileImage,
  List,
  ListChecks,
  MapPin,
  MapPinned,
  ShieldCheck,
  Target,
  Upload,
} from 'lucide-react';
import { DataState } from '@/components/ui/data-state';
import {
  RecommendationStatus,
  RiskFinding,
  RiskLevel,
} from '@/features/pengelola/model';
import {
  ManagerHeading,
  ManagerScope,
  RiskBadge,
  WorkflowBadge,
} from '@/features/pengelola/components/manager-components';
import { useMockStore } from '@/mocks/store/mock-store';
import { selectRiskWorkspaceData } from '@/mocks/store/selectors';
export function RiskFindingDetail({
  finding,
  onOpenAction,
}: {
  finding: RiskFinding | undefined;
  onOpenAction: (section: string, recommendationId: string) => void;
}) {
  if (!finding)
    return (
      <aside className="surface manager-risk-detail">
        <DataState
          variant="empty"
          title="Tidak ada temuan"
          description="Ubah filter untuk melihat temuan bahaya lainnya."
        />
      </aside>
    );
  return (
    <aside className="surface manager-risk-detail risk-detail-expanded">
      <div className="manager-risk-detail-head">
        <RiskBadge level={finding.level} />
        <span>{finding.id}</span>
      </div>
      <p className="section-kicker">Temuan bahaya</p>
      <h2>{finding.hazard}</h2>
      <p className="manager-risk-zone">
        <MapPin /> {finding.building} · {finding.floor} · {finding.location}
      </p>
      <div className="risk-separation-row">
        <div>
          <small>Tingkat risiko</small>
          <RiskBadge level={finding.level} />
        </div>
        <div>
          <small>Status pekerjaan</small>
          <WorkflowBadge status={finding.status} />
        </div>
      </div>
      <dl className="risk-detail-metadata">
        <div>
          <dt>Kemungkinan</dt>
          <dd>{finding.likelihood}</dd>
        </div>
        <div>
          <dt>Keparahan</dt>
          <dd>{finding.severity}</dd>
        </div>
        <div>
          <dt>Potensi terpapar</dt>
          <dd>{finding.exposedPeople}</dd>
        </div>
        <div>
          <dt>Risiko tersisa</dt>
          <dd>{finding.residualRisk}</dd>
        </div>
      </dl>
      <div className="manager-risk-description">
        <b>Dampak yang mungkin terjadi</b>
        <p>{finding.impact}</p>
      </div>
      <div className="manager-risk-description">
        <b>Pengendalian yang sudah ada</b>
        <p>{finding.existingControl}</p>
      </div>
      <div className="risk-traceability">
        <FileCheck2 />
        <div>
          <b>Sumber dan keterlacakan</b>
          <p>
            {finding.assessmentId} · {finding.instrumentVersion}
          </p>
          <p>
            {finding.indicator} · {finding.observedAt}
          </p>
          <p>
            {finding.evidence} · {finding.planVersion}
          </p>
        </div>
      </div>
      <div className="manager-risk-recommendation">
        <Target />
        <span>
          <b>Rekomendasi {finding.recommendationId}</b>
          <p>{finding.recommendation}</p>
        </span>
      </div>
      <button
        className="primary-button"
        onClick={() =>
          onOpenAction(
            finding.status === 'Belum ditindaklanjuti'
              ? 'recommendations'
              : 'follow-up',
            finding.recommendationId,
          )
        }
      >
        <ListChecks />
        {finding.status === 'Belum ditindaklanjuti'
          ? `Buat tindak lanjut ${finding.recommendationId}`
          : `Buka tindak lanjut ${finding.recommendationId}`}
      </button>
    </aside>
  );
}

export function RiskMapPage({
  onNavigate,
  onOpenAction,
}: {
  onNavigate: (section: string) => void;
  onOpenAction: (section: string, recommendationId: string) => void;
}) {
  const mockState = useMockStore((state) => state);
  const initialBuildings = mockState.buildings;
  const riskFindings = mockState.riskFindings;
  const periodResults = mockState.periodResults;
  const [view, setView] = useState<'areas' | 'plan' | 'findings'>('areas');
  const [assessmentId, setAssessmentId] = useState('Semua periode');
  const [buildingId, setBuildingId] = useState('Semua gedung');
  const [floor, setFloor] = useState('Semua lantai');
  const [riskLevel, setRiskLevel] = useState<RiskLevel | 'Semua risiko'>(
    'Semua risiko',
  );
  const [workStatus, setWorkStatus] = useState<
    RecommendationStatus | 'Semua status'
  >('Semua status');
  const [selectedId, setSelectedId] = useState(riskFindings[0].id);
  const selectedBuilding = initialBuildings.find(
    (building) => building.id === buildingId,
  );
  const floorOptions = selectedBuilding
    ? selectedBuilding.floors.map((item) => item.name)
    : [
        ...new Set(
          initialBuildings.flatMap((item) =>
            item.floors.map((floorItem) => floorItem.name),
          ),
        ),
      ];
  const { findings: visibleFindings, areas: visibleAreas } =
    selectRiskWorkspaceData(mockState, {
      assessmentId,
      buildingId,
      floor,
      riskLevel,
      workStatus,
    });
  const selected =
    visibleFindings.find((finding) => finding.id === selectedId) ??
    visibleFindings[0];
  const activePlan = selectedBuilding?.floors.find(
    (floorItem) => floorItem.name === floor,
  );
  const planAreas = visibleAreas.filter(
    (area) => area.buildingId === buildingId && area.floor === floor,
  );

  function changeView(nextView: 'areas' | 'plan' | 'findings') {
    setView(nextView);
    if (nextView === 'plan' && buildingId === 'Semua gedung') {
      setBuildingId('BLD-001');
      setFloor('Lantai 1');
      setSelectedId('RSK-001');
    }
  }

  return (
    <>
      <ManagerHeading
        title="Peta Bahaya & Risiko"
        description="Telusuri temuan berdasarkan area, denah unggahan pesantren, dan assessment sumbernya."
        action={
          <button
            className="secondary-button"
            onClick={() => onNavigate('locations')}
          >
            <Building2 /> Kelola gedung & denah
          </button>
        }
      />
      <ManagerScope compact />
      <div className="risk-source-banner">
        <ShieldCheck />
        <div>
          <b>Pemisahan sumber data</b>
          <p>
            Lokasi dan denah berasal dari Pengelola; titik, catatan, dan bukti
            berasal dari Asesor; kategori risiko dihitung oleh konfigurasi
            instrumen Published.
          </p>
        </div>
      </div>
      <div
        className="risk-view-tabs"
        role="tablist"
        aria-label="Tampilan peta bahaya"
      >
        <button
          role="tab"
          aria-selected={view === 'areas'}
          className={view === 'areas' ? 'active' : ''}
          onClick={() => changeView('areas')}
        >
          <List /> Daftar Area
        </button>
        <button
          role="tab"
          aria-selected={view === 'plan'}
          className={view === 'plan' ? 'active' : ''}
          onClick={() => changeView('plan')}
        >
          <MapPinned /> Denah Bangunan
        </button>
        <button
          role="tab"
          aria-selected={view === 'findings'}
          className={view === 'findings' ? 'active' : ''}
          onClick={() => changeView('findings')}
        >
          <AlertTriangle /> Daftar Temuan
        </button>
      </div>
      <section className="surface risk-filter-surface">
        <div className="risk-filter-grid">
          <label>
            Periode assessment
            <select
              value={assessmentId}
              onChange={(event) => setAssessmentId(event.target.value)}
            >
              <option>Semua periode</option>
              {periodResults.map((result) => (
                <option key={result.id} value={result.id}>
                  {result.period} · {result.id}
                </option>
              ))}
            </select>
          </label>
          <label>
            Gedung
            <select
              value={buildingId}
              onChange={(event) => {
                setBuildingId(event.target.value);
                setFloor('Semua lantai');
              }}
            >
              <option>Semua gedung</option>
              {initialBuildings.map((building) => (
                <option key={building.id} value={building.id}>
                  {building.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Lantai
            <select
              value={floor}
              onChange={(event) => setFloor(event.target.value)}
            >
              <option>Semua lantai</option>
              {floorOptions.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            Tingkat risiko
            <select
              value={riskLevel}
              onChange={(event) =>
                setRiskLevel(event.target.value as typeof riskLevel)
              }
            >
              <option>Semua risiko</option>
              <option>Tinggi</option>
              <option>Sedang</option>
              <option>Rendah</option>
            </select>
          </label>
          <label>
            Status pekerjaan
            <select
              value={workStatus}
              onChange={(event) =>
                setWorkStatus(event.target.value as typeof workStatus)
              }
            >
              <option>Semua status</option>
              <option>Belum ditindaklanjuti</option>
              <option>Berjalan</option>
              <option>Menunggu verifikasi</option>
              <option>Terverifikasi</option>
            </select>
          </label>
        </div>
      </section>
      <div className="risk-summary-strip">
        <span>
          <b>{visibleAreas.length}</b> area ditampilkan
        </span>
        <span>
          <b>{visibleFindings.length}</b> temuan aktif
        </span>
        <span className="high">
          <b>
            {visibleFindings.filter((item) => item.level === 'Tinggi').length}
          </b>{' '}
          risiko tinggi
        </span>
        <p>Risiko dan status pekerjaan ditampilkan terpisah.</p>
      </div>

      <div className="risk-workspace-layout">
        <section className="surface risk-primary-surface">
          {view === 'areas' ? (
            <div className="risk-area-grid">
              {visibleAreas.map((area) => {
                const building = initialBuildings.find(
                  (item) => item.id === area.buildingId,
                );
                const areaFindings = visibleFindings.filter(
                  (finding) => finding.areaId === area.id,
                );
                const highest = areaFindings.some(
                  (item) => item.level === 'Tinggi',
                )
                  ? 'Tinggi'
                  : areaFindings.some((item) => item.level === 'Sedang')
                    ? 'Sedang'
                    : undefined;
                return (
                  <article key={area.id}>
                    <div className="risk-area-head">
                      <span>
                        <MapPin />
                      </span>
                      <div>
                        <b>{area.name}</b>
                        <small>
                          {building?.name} · {area.floor} · {area.zone}
                        </small>
                      </div>
                    </div>
                    {highest ? (
                      <RiskBadge level={highest} />
                    ) : (
                      <span className="status status-neutral">
                        <CheckCircle2 /> Tidak ada temuan aktif
                      </span>
                    )}
                    <p>
                      {areaFindings.length
                        ? `${areaFindings.length} temuan dari assessment aktif.`
                        : 'Area tetap tersedia untuk observasi walaupun belum memiliki titik bahaya.'}
                    </p>
                    {areaFindings.map((finding) => (
                      <button
                        key={finding.id}
                        onClick={() => setSelectedId(finding.id)}
                        className={finding.id === selected?.id ? 'active' : ''}
                      >
                        <span>{finding.id}</span>
                        <b>{finding.hazard}</b>
                        <ChevronRight />
                      </button>
                    ))}
                  </article>
                );
              })}
              {visibleAreas.length === 0 ? (
                <DataState
                  variant="empty"
                  title="Area tidak ditemukan"
                  description="Ubah pilihan gedung atau lantai."
                />
              ) : null}
            </div>
          ) : null}

          {view === 'plan' ? (
            activePlan?.planFile ? (
              <>
                <div className="plan-source-head">
                  <div>
                    <p className="section-kicker">Denah unggahan pengelola</p>
                    <h2>
                      {selectedBuilding?.name} · {activePlan.name}
                    </h2>
                    <p>
                      {activePlan.planFile} · {activePlan.planVersion} ·{' '}
                      {activePlan.uploadedAt}
                    </p>
                  </div>
                  <span className="status status-blue">
                    <FileImage /> Pratinjau dummy
                  </span>
                </div>
                <div
                  className="risk-floorplan risk-floorplan-versioned"
                  aria-label={`Denah ${selectedBuilding?.name} ${activePlan.name}`}
                >
                  {planAreas.map((area) => (
                    <div
                      className="floor-room dynamic-room"
                      key={area.id}
                      style={{
                        left: `${area.x}%`,
                        top: `${area.y}%`,
                        width: `${area.width}%`,
                        height: `${area.height}%`,
                      }}
                    >
                      <span>{area.name}</span>
                      <small>{area.zone}</small>
                    </div>
                  ))}
                  {visibleFindings.map((finding, index) => (
                    <button
                      className={`risk-marker risk-${finding.level.toLowerCase()} ${finding.id === selected?.id ? 'active' : ''}`}
                      style={{ left: `${finding.x}%`, top: `${finding.y}%` }}
                      key={finding.id}
                      onClick={() => setSelectedId(finding.id)}
                      aria-label={`${finding.level}: ${finding.hazard} di ${finding.location}`}
                    >
                      <span>{index + 1}</span>
                      <b>{finding.level}</b>
                    </button>
                  ))}
                </div>
                <div className="risk-map-help">
                  <MapPin />
                  <p>
                    <b>Koordinat relatif</b>Titik disimpan pada skala 0–100 agar
                    tetap tepat ketika denah ditampilkan di desktop atau HP.
                  </p>
                </div>
              </>
            ) : (
              <DataState
                variant="empty"
                title="Denah belum tersedia"
                description="Pilih gedung dan lantai yang memiliki denah, atau gunakan Daftar Area."
                action={
                  <button
                    className="secondary-button"
                    onClick={() => onNavigate('locations')}
                  >
                    <Upload /> Kelola denah
                  </button>
                }
              />
            )
          ) : null}

          {view === 'findings' ? (
            <div className="risk-finding-list">
              {visibleFindings.map((finding, index) => (
                <button
                  className={finding.id === selected?.id ? 'active' : ''}
                  key={finding.id}
                  onClick={() => setSelectedId(finding.id)}
                >
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <small>
                      {finding.id} · {finding.indicator}
                    </small>
                    <b>{finding.hazard}</b>
                    <p>
                      {finding.building} · {finding.floor} · {finding.location}
                    </p>
                  </div>
                  <RiskBadge level={finding.level} />
                  <WorkflowBadge status={finding.status} />
                  <ChevronRight />
                </button>
              ))}
              {visibleFindings.length === 0 ? (
                <DataState
                  variant="empty"
                  title="Temuan tidak ditemukan"
                  description="Ubah filter risiko atau status pekerjaan."
                />
              ) : null}
            </div>
          ) : null}
        </section>
        <RiskFindingDetail finding={selected} onOpenAction={onOpenAction} />
      </div>
    </>
  );
}
