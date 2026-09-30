// Detail full internal satu laporan penilaian mandiri (D-36).
// Hanya dibaca akun Pesantren pemilik scope; read-only mengikuti D-32.
import { Link } from "react-router";
import { CalendarDays, ExternalLink, FileCheck2, Hash, UserRound } from "lucide-react";
import type {
  CampusPlanVersion,
  FrozenIndicator,
  Instrument,
  Report,
  SelfAssessmentSnapshot,
} from "~/mocks/types";
import { EvidencePreview } from "~/shared/components/evidence-preview";
import { SavedLocation } from "~/shared/components/denah-preview";
import { StatusChip } from "~/shared/components/status-chip";

function formatWaktu(value?: string): string {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString("id-ID");
}

export function HasilMandiriDetail({
  report,
  snapshot,
  bank,
  areaLabel,
  plans,
  institutionName,
}: {
  report: Report;
  snapshot?: SelfAssessmentSnapshot;
  bank: Instrument;
  areaLabel: Map<string, string>;
  plans: CampusPlanVersion[];
  institutionName: string;
}) {
  const frozen: FrozenIndicator[] =
    snapshot?.frozenIndicators ??
    bank.dimensions.flatMap((dim) =>
      dim.indicators.map((ind) => ({
        id: ind.id,
        code: ind.code,
        title: ind.title,
        prompt: ind.prompt,
        dimensionId: dim.id,
        dimensionName: dim.name,
        categoryId: ind.categoryId,
        aspectId: ind.aspectId,
        answerType: ind.answerType,
        weight: ind.weight ?? 1,
        options: ind.options,
      })),
    );
  const groups = new Map<string, { name: string; items: FrozenIndicator[] }>();
  for (const ind of frozen) {
    const entry = groups.get(ind.dimensionId) ?? {
      name: ind.dimensionName,
      items: [],
    };
    entry.items.push(ind);
    groups.set(ind.dimensionId, entry);
  }
  const checksum = snapshot?.instrumentChecksum ?? report.instrumentChecksum;
  const byDimension = snapshot?.byDimension ?? {};
  const skor = report.scorePercent ?? snapshot?.scorePercent ?? null;
  return (
    <article className="surface overflow-hidden">
      <div className="border-b border-line bg-strip p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <StatusChip value={report.validationStatus} />
            <StatusChip value={report.channel} />
          </div>
          <span className="text-xs font-semibold text-secondary-text">Read-only</span>
        </div>
        <p className="mt-4 text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
          {report.id}
        </p>
        <h2 className="mt-1 text-xl font-extrabold leading-7 text-heading">
          {report.title}
        </h2>
        <p className="mt-1 text-sm text-secondary-text">{institutionName}</p>
      </div>
      <div className="p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <DetailMeta icon={UserRound} label="Penilai" value={report.reporterName} />
          <DetailMeta
            icon={CalendarDays}
            label="Dikirim"
            value={formatWaktu(report.submittedAt ?? report.createdAt)}
          />
          <DetailMeta
            icon={FileCheck2}
            label="Indikator terisi"
            value={String(snapshot?.jawabanTerisi ?? Object.keys(snapshot?.answers ?? {}).length)}
          />
        </div>
        <section aria-label="Kontak dan waktu internal" className="mt-5 rounded-lg border border-line-soft p-4">
          <div className="flex items-center gap-2">
            <UserRound size={16} className="text-primary" aria-hidden />
            <h3 className="text-sm font-extrabold text-heading">Informasi internal penilai</h3>
          </div>
          <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-faint">Nama penilai</dt>
              <dd className="mt-1 text-secondary-text">{report.reporterName}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-faint">Kontak</dt>
              <dd className="mt-1 text-secondary-text">{report.contact ?? "—"}</dd>
            </div>
          </dl>
        </section>
        <section aria-label="Skor beku" className="mt-5 rounded-lg border border-[#bae6fd] bg-[#eff6ff] p-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wide text-secondary-text">Skor penilaian beku</p>
              <p className="mt-1 text-4xl font-extrabold text-heading">
                {skor === null ? "—" : `${Math.round(skor)}%`}
              </p>
            </div>
            <p className="max-w-[220px] text-right text-xs leading-5 text-secondary-text">
              Skor tidak berubah ketika bank instrumen diperbarui.
            </p>
          </div>
          {Object.keys(byDimension).length ? (
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {Object.entries(byDimension).map(([dimId, value]) => {
                const name =
                  snapshot?.frozenIndicators?.find((item) => item.dimensionId === dimId)
                    ?.dimensionName ?? dimId;
                return (
                  <li key={dimId} className="rounded-md border border-[#bae6fd] bg-white p-3">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-semibold text-heading">{name}</span>
                      <strong>{value === null ? "—" : `${Math.round(value)}%`}</strong>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-strip">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${Math.round(value ?? 0)}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : null}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-[#bae6fd] pt-3 text-xs text-secondary-text">
            <span className="inline-flex items-center gap-1"><Hash size={13} aria-hidden />{checksum ? `Checksum ${checksum.slice(0, 8)}` : "Tanpa checksum"}</span>
            {report.pdfGeneratedAt ? <span>PDF dibuat {formatWaktu(report.pdfGeneratedAt)}</span> : null}
          </div>
        </section>
        <section aria-label="Jawaban per indikator" className="mt-5">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h3 className="text-sm font-extrabold text-heading">Jawaban per indikator</h3>
              <p className="mt-1 text-xs text-secondary-text">Rincian observasi internal dari snapshot laporan.</p>
            </div>
            <span className="text-xs font-bold text-secondary-text">{frozen.length} indikator</span>
          </div>
          <div className="mt-3 space-y-3">
            {[...groups.entries()].map(([dimId, group]) => (
              <div key={dimId} className="rounded-lg border border-line-soft p-3">
                <p className="text-xs font-extrabold uppercase tracking-wide text-primary">{group.name}</p>
                <ul className="mt-2 space-y-2">
                  {group.items.map((ind) => {
                    const answer = snapshot?.answers[ind.id];
                    return (
                      <li key={ind.id} className="rounded-md border border-line bg-white p-3 text-sm">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <strong className="text-heading">{ind.code} · {ind.title}</strong>
                          <span className="rounded bg-strip px-2 py-1 text-xs font-bold text-heading">{answer?.value || "Belum diisi"}</span>
                        </div>
                        {answer?.note ? <p className="mt-2 text-secondary-text"><strong className="text-heading">Catatan:</strong> {answer.note}</p> : null}
                        {answer?.evidenceName ? <p className="mt-2 text-secondary-text"><strong className="text-heading">Bukti:</strong> {answer.evidenceName}</p> : null}
                        <EvidencePreview assetId={answer?.evidenceAssetId} institutionCode={report.institutionCode} name={answer?.evidenceName} />
                        {answer?.areaId || answer?.manualLocation ? <p className="mt-2 text-secondary-text"><strong className="text-heading">Lokasi:</strong> {answer.areaId ? (areaLabel.get(answer.areaId) ?? answer.areaId) : answer.manualLocation}</p> : null}
                        {answer?.locationSnapshot ? <SavedLocation plans={plans} location={answer.locationSnapshot} /> : null}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </section>
        <div className="mt-5 border-t border-line pt-4">
          <Link className="primary-button w-full sm:w-auto" to={`/laporan/${report.id}`}>
            <ExternalLink size={15} aria-hidden />
            Buka PDF laporan
          </Link>
        </div>
      </div>
    </article>
  );
}

function DetailMeta({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UserRound;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-line-soft bg-strip p-3">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-secondary-text">
        <Icon size={14} className="text-primary" aria-hidden />
        {label}
      </div>
      <p className="mt-2 truncate text-sm font-bold text-heading">{value}</p>
    </div>
  );
}
