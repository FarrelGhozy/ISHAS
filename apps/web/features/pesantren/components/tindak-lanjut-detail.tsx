// Panel baca relasi laporan induk pada kartu tindak lanjut (D-21).
// Hanya-baca: nomor, kanal, judul, deskripsi, kategori/aspek + usulan,
// severity/priority final, lokasi, bukti pelapor privat, validator/waktu,
// temuan tertaut + tautan ke validasi.

import { Link } from "react-router";
import { K3_ASPECT_MAP, K3_CATEGORY_MAP } from "~/mocks/kategori-k3";
import type {
  CampusPlanVersion,
  Recommendation,
  Report,
  RiskFinding,
} from "~/mocks/types";
import { EvidencePreview } from "~/shared/components/evidence-preview";
import { SavedLocation } from "~/shared/components/denah-preview";
import { StatusChip } from "~/shared/components/status-chip";

function formatWaktu(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("id-ID");
}

export function TindakLanjutDetail({
  item,
  report,
  findings,
  institutionName,
  areaLabel,
  plans,
}: {
  item: Recommendation;
  report?: Report;
  findings: RiskFinding[];
  institutionName: string;
  areaLabel: string;
  plans: CampusPlanVersion[];
}) {
  const kategori = report?.categoryId
    ? (K3_CATEGORY_MAP[report.categoryId]?.name ?? report.categoryId)
    : "Belum dipilih";
  const aspek = report?.aspectId
    ? (K3_ASPECT_MAP[report.aspectId]?.name ?? report.aspectId)
    : "Belum dipilih";
  return (
    <section aria-label="Laporan induk" className="rounded-lg border border-line bg-strip/40 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <strong className="text-sm text-primary">{item.reportId}</strong>
        {report ? <StatusChip value={report.channel} /> : null}
        {report ? <StatusChip value={report.handlingStatus} /> : null}
        <Link className="text-button ms-auto text-sm" to="/pesantren/validasi-laporan">
          Lihat di Validasi
        </Link>
      </div>
      {report ? (
        <div className="mt-2">
          <p className="font-bold text-heading">{report.title}</p>
          <p className="mt-1 text-sm text-secondary-text">{report.description}</p>
        </div>
      ) : (
        <p className="mt-2 text-sm text-secondary-text">
          Laporan induk tidak ditemukan pada perangkat ini.
        </p>
      )}
      <dl className="mt-2 grid gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-bold text-heading">Pesantren</dt>
          <dd className="text-secondary-text">{institutionName}</dd>
        </div>
        <div>
          <dt className="font-bold text-heading">Lokasi laporan</dt>
          <dd className="text-secondary-text">{areaLabel}</dd>
        </div>
        <div>
          <dt className="font-bold text-heading">Kategori / Aspek</dt>
          <dd className="text-secondary-text">
            {kategori} / {aspek}
          </dd>
        </div>
        <div>
          <dt className="font-bold text-heading">Usulan pelapor</dt>
          <dd className="mt-0.5 flex flex-wrap gap-2">
            <StatusChip value={report?.reporterSeverity ?? "Belum ditentukan"} />
            <StatusChip value={report?.reporterPriority ?? "Belum ditentukan"} />
          </dd>
        </div>
        <div>
          <dt className="font-bold text-heading">Keputusan Pesantren</dt>
          <dd className="mt-0.5 flex flex-wrap gap-2">
            <StatusChip value={report?.severity ?? "Belum ditentukan"} />
            <StatusChip value={report?.priority ?? "Belum ditentukan"} />
          </dd>
        </div>
        <div>
          <dt className="font-bold text-heading">Validator</dt>
          <dd className="text-secondary-text">
            {report?.validatedByName ?? "—"}
            {report?.validatedAt ? ` · ${formatWaktu(report.validatedAt)}` : ""}
          </dd>
        </div>
      </dl>
      {report?.locationSnapshot ? (
        <div className="mt-2">
          <SavedLocation plans={plans} location={report.locationSnapshot} />
        </div>
      ) : null}
      {report?.evidenceName || report?.evidenceAssetId ? (
        <div className="mt-2">
          <p className="text-sm font-bold text-heading">
            Bukti pelapor (privat): {report.evidenceName ?? "tanpa nama"}
          </p>
          <EvidencePreview
            assetId={report.evidenceAssetId}
            institutionCode={report.institutionCode}
            name={report.evidenceName}
          />
        </div>
      ) : null}
      {findings.length ? (
        <div className="mt-2">
          <p className="text-sm font-bold text-heading">
            Temuan tertaut ({findings.length})
          </p>
          <ul className="mt-1 space-y-1">
            {findings.map((finding) => (
              <li key={finding.id} className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-secondary-text">
                  {finding.id} · {finding.issue}
                </span>
                <StatusChip value={finding.status} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {item.status === "Dibatalkan" ? (
        <p className="mt-2 rounded-lg bg-strip p-3 text-sm text-secondary-text">
          Dibatalkan
          {item.canceledAt ? ` · ${formatWaktu(item.canceledAt)}` : ""}.
          {item.canceledReason ? ` Alasan: ${item.canceledReason}` : ""}
        </p>
      ) : null}
    </section>
  );
}
