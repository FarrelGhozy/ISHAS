// Detail isi laporan pada modal validasi — hanya-baca (FLOWS §4, D-19).
// Menampilkan seluruh field kiriman publik: identitas, kontak internal,
// kategori/aspek, usulan mandiri, lokasi + denah, bukti gambar, waktu,
// dan jejak keputusan bila sudah diputus.

import type { ReactNode } from "react";
import { K3_ASPECT_MAP, K3_CATEGORY_MAP } from "~/mocks/kategori-k3";
import type { IshasState, Report } from "~/mocks/types";
import { EvidencePreview } from "~/shared/components/evidence-preview";
import { SavedLocation } from "~/shared/components/denah-preview";
import { StatusChip } from "~/shared/components/status-chip";

function formatWaktu(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("id-ID");
}

function cariIndikator(
  state: IshasState,
  indicatorId: string,
): { code: string; title: string } | null {
  for (const version of state.instrumentVersions) {
    for (const dim of version.dimensions) {
      const found = dim.indicators.find((item) => item.id === indicatorId);
      if (found) return { code: found.code, title: found.title };
    }
  }
  return null;
}

function Baris({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="py-1.5">
      <dt className="text-sm font-bold text-heading">
        {label}
      </dt>
      <dd className="mt-0.5 min-w-0 text-sm text-secondary-text">
        {children}
      </dd>
    </div>
  );
}

export function ReviewDetail({
  report,
  live,
  state,
  institutionName,
  areaLabel,
}: {
  report: Report;
  live: Report;
  state: IshasState;
  institutionName: string;
  areaLabel: string;
}) {
  const decided = live.validationStatus !== "Menunggu validasi";
  const kategori = report.categoryId
    ? (K3_CATEGORY_MAP[report.categoryId]?.name ?? report.categoryId)
    : "Belum dipilih";
  const aspek = report.aspectId
    ? (K3_ASPECT_MAP[report.aspectId]?.name ?? report.aspectId)
    : "Belum dipilih";
  const indikatorLama = report.indicatorId
    ? (cariIndikator(state, report.indicatorId) ?? {
        code: report.indicatorId,
        title: "Indikator arsip",
      })
    : null;
  const akun = report.reporterAccountEmail ?? "Publik (tanpa login)";
  return (
    <div className="max-w-xl">
      <div className="flex flex-wrap gap-2">
        <StatusChip value={report.channel} />
        <StatusChip value={live.validationStatus} />
        <StatusChip value={live.handlingStatus} />
      </div>
      <p className="mt-3 text-sm font-bold text-primary">
        {report.id}
      </p>
      <h2 className="mt-1 text-xl font-extrabold text-heading">
        {report.title}
      </h2>

      <section aria-label="Pelapor dan waktu" className="mt-4">
        <h3 className="text-sm font-extrabold uppercase tracking-wide text-secondary-text">
          Pelapor dan waktu
        </h3>
        <dl className="mt-1 divide-y divide-line">
          <Baris label="Pelapor">
            {report.reporterName}
          </Baris>
          <Baris label="Akun">
            {akun}
          </Baris>
          <Baris label="Kontak (internal)">
            {report.contact ?? "—"}
          </Baris>
          <Baris label="Pesantren">
            {report.institutionCode}
            {" — "}
            {institutionName}
          </Baris>
          <Baris label="Dikirim">
            {formatWaktu(report.submittedAt ?? report.createdAt)}
          </Baris>
          {report.observedAt ? (
            <Baris label="Waktu kejadian">
              {formatWaktu(report.observedAt)}
            </Baris>
          ) : null}
          <Baris label="Diperbarui">
            {formatWaktu(live.updatedAt ?? report.createdAt)}
          </Baris>
        </dl>
      </section>

      <section aria-label="Klasifikasi" className="mt-4">
        <h3 className="text-sm font-extrabold uppercase tracking-wide text-secondary-text">
          Klasifikasi
        </h3>
        <dl className="mt-1 divide-y divide-line">
          <Baris label="Kategori">
            {kategori}
          </Baris>
          <Baris label="Aspek">
            {aspek}
          </Baris>
          {indikatorLama ? (
            <Baris label="Indikator (arsip)">
              {indikatorLama.code}
              {" · "}
              {indikatorLama.title}
            </Baris>
          ) : null}
          <Baris label="Usulan pelapor">
            <span className="flex flex-wrap items-center gap-2">
              <StatusChip value={report.reporterSeverity ?? "Belum ditentukan"} />
              <StatusChip value={report.reporterPriority ?? "Belum ditentukan"} />
            </span>
          </Baris>
          {decided && live.validationStatus === "Diterima" ? (
            <Baris label="Keputusan">
              <span className="flex flex-wrap items-center gap-2">
                <StatusChip value={live.severity} />
                <StatusChip value={live.priority} />
              </span>
            </Baris>
          ) : null}
        </dl>
      </section>

      <section aria-label="Lokasi" className="mt-4">
        <h3 className="text-sm font-extrabold uppercase tracking-wide text-secondary-text">
          Lokasi
        </h3>
        <p className="mt-1 text-sm text-secondary-text">
          {areaLabel}
        </p>
        {report.locationSnapshot ? (
          <p className="mt-1 text-sm text-secondary-text">
            {report.locationSnapshot.locationText}
            {report.locationSnapshot.floorNote
              ? ` · ${report.locationSnapshot.floorNote}`
              : ""}
          </p>
        ) : null}
        <SavedLocation
          plans={state.campusPlans.filter(
            (plan) => plan.institutionCode === report.institutionCode,
          )}
          location={report.locationSnapshot}
        />
      </section>

      <section aria-label="Deskripsi" className="mt-4">
        <h3 className="text-sm font-extrabold uppercase tracking-wide text-secondary-text">
          Deskripsi
        </h3>
        <p className="mt-1 whitespace-pre-wrap text-sm text-secondary-text">
          {report.description}
        </p>
      </section>

      <section aria-label="Bukti" className="mt-4">
        <h3 className="text-sm font-extrabold uppercase tracking-wide text-secondary-text">
          Bukti
        </h3>
        {report.evidenceName ? (
          <p className="mt-1 break-words text-sm text-secondary-text">
            {report.evidenceName}
          </p>
        ) : (
          <p className="mt-1 text-sm text-secondary-text">
            Tanpa lampiran.
          </p>
        )}
        <EvidencePreview
          assetId={report.evidenceAssetId}
          institutionCode={report.institutionCode}
          name={report.evidenceName}
        />
      </section>

      {report.instrumentVersionId ? (
        <section aria-label="Instrumen" className="mt-4">
          <h3 className="text-sm font-extrabold uppercase tracking-wide text-secondary-text">
            Instrumen
          </h3>
          <p className="mt-1 text-sm text-secondary-text">
            Versi instrumen:
            {" "}
            {report.instrumentVersionId}
          </p>
        </section>
      ) : null}

      {decided ? (
        <section aria-label="Jejak keputusan" className="mt-4">
          <h3 className="text-sm font-extrabold uppercase tracking-wide text-secondary-text">
            Jejak keputusan
          </h3>
          <dl className="mt-1 divide-y divide-line">
            <Baris label="Diputus oleh">
              {live.validatedByName ?? "—"}
              {live.validatedByRole ? ` (${live.validatedByRole})` : ""}
            </Baris>
            <Baris label="Waktu putus">
              {formatWaktu(live.validatedAt)}
            </Baris>
            {live.validationNote ? (
              <Baris label="Catatan validasi">
                {live.validationNote}
              </Baris>
            ) : null}
            {live.rejectionReason ? (
              <Baris label="Alasan penolakan">
                {live.rejectionReason}
              </Baris>
            ) : null}
          </dl>
          <p role="alert" className="mt-2 text-sm text-[#b91c1c]">
            Laporan ini sudah
            {" "}
            {live.validationStatus}
            ; keputusan baru ditolak sistem.
          </p>
        </section>
      ) : null}
    </div>
  );
}
