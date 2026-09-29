// Detail full internal satu laporan penilaian mandiri (D-36).
// Hanya dibaca akun Pesantren pemilik scope; read-only mengikuti D-32.
import { Link } from "react-router";
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
    <article className="surface p-4">
      <div className="flex flex-wrap gap-2">
        <StatusChip value={report.validationStatus} />
        <StatusChip value={report.channel} />
      </div>
      <p className="mt-3 text-sm font-bold text-primary">
        {report.id}
      </p>
      <h2 className="mt-1 text-xl font-extrabold text-heading">
        {report.title}
      </h2>
      <p className="mt-1 text-sm text-secondary-text">
        {institutionName}
      </p>
      <section aria-label="Penilai dan waktu" className="mt-4">
        <h3 className="text-sm font-extrabold uppercase tracking-wide text-secondary-text">
          Penilai dan waktu
        </h3>
        <dl className="mt-1 divide-y divide-line">
          <div className="py-1.5">
            <dt className="text-sm font-bold text-heading">
              Nama penilai (internal)
            </dt>
            <dd className="mt-0.5 text-sm text-secondary-text">
              {report.reporterName}
            </dd>
          </div>
          <div className="py-1.5">
            <dt className="text-sm font-bold text-heading">
              Kontak (internal)
            </dt>
            <dd className="mt-0.5 text-sm text-secondary-text">
              {report.contact ?? "—"}
            </dd>
          </div>
          <div className="py-1.5">
            <dt className="text-sm font-bold text-heading">
              Dikirim
            </dt>
            <dd className="mt-0.5 text-sm text-secondary-text">
              {formatWaktu(report.submittedAt ?? report.createdAt)}
            </dd>
          </div>
        </dl>
      </section>
      <section aria-label="Skor beku" className="mt-4">
        <h3 className="text-sm font-extrabold uppercase tracking-wide text-secondary-text">
          Skor beku
        </h3>
        <p className="mt-1 text-sm text-secondary-text">
          {skor === null
            ? "Skor belum tersedia pada snapshot ini."
            : `Skor ${Math.round(skor)}% · tidak berubah bila bank diedit.`}
        </p>
        {Object.keys(byDimension).length ? (
          <ul className="mt-2 space-y-2">
            {Object.entries(byDimension).map(([dimId, value]) => {
              const name =
                snapshot?.frozenIndicators?.find(
                  (item) => item.dimensionId === dimId,
                )?.dimensionName ?? dimId;
              return (
                <li
                  key={dimId}
                  className="flex items-center gap-3 text-sm"
                >
                  <span className="min-w-0 flex-1 font-semibold text-heading">
                    {name}
                  </span>
                  <strong>
                    {value === null ? "—" : Math.round(value)}
                  </strong>
                </li>
              );
            })}
          </ul>
        ) : null}
        <p className="mt-2 text-xs text-faint">
          {checksum ? `Checksum ${checksum.slice(0, 8)}` : "Tanpa checksum"}
          {report.pdfGeneratedAt
            ? ` · PDF dibuat ${formatWaktu(report.pdfGeneratedAt)}`
            : ""}
        </p>
      </section>
      <section aria-label="Jawaban per indikator" className="mt-4">
        <h3 className="text-sm font-extrabold uppercase tracking-wide text-secondary-text">
          Jawaban per indikator (internal)
        </h3>
        <div className="mt-3 space-y-3">
          {[...groups.entries()].map(([dimId, group]) => (
            <div key={dimId}>
              <p className="text-xs font-extrabold uppercase tracking-wide text-secondary-text">
                {group.name}
              </p>
              <ul className="mt-1 space-y-2">
                {group.items.map((ind) => {
                  const answer = snapshot?.answers[ind.id];
                  return (
                    <li
                      key={ind.id}
                      className="rounded border border-line-soft p-3 text-sm"
                    >
                      <strong className="block text-heading">
                        {ind.code}
                        {" · "}
                        {ind.title}
                      </strong>
                      <span className="text-secondary-text">
                        {`Jawaban: ${answer?.value || "—"}`}
                      </span>
                      {answer?.note ? (
                        <span className="block text-secondary-text">
                          {`Catatan: ${answer.note}`}
                        </span>
                      ) : null}
                      {answer?.evidenceName ? (
                        <span className="block text-secondary-text">
                          {`Bukti: ${answer.evidenceName}`}
                        </span>
                      ) : null}
                      <EvidencePreview
                        assetId={answer?.evidenceAssetId}
                        institutionCode={report.institutionCode}
                        name={answer?.evidenceName}
                      />
                      {answer?.areaId || answer?.manualLocation ? (
                        <span className="block text-secondary-text">
                          {"Lokasi: "}
                          {answer.areaId
                            ? (areaLabel.get(answer.areaId) ?? answer.areaId)
                            : answer.manualLocation}
                        </span>
                      ) : null}
                      {answer?.locationSnapshot ? (
                        <SavedLocation
                          plans={plans}
                          location={answer.locationSnapshot}
                        />
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>
      <div className="mt-4">
        <Link
          className="text-button"
          to={`/laporan/${report.id}`}
        >
          Lihat PDF laporan →
        </Link>
      </div>
    </article>
  );
}
