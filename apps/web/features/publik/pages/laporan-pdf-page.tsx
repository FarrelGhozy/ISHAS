// Halaman cetak PDF satu laporan penilaian mandiri (D-24, D-28).
// Rekapan publik: skor + dimensi + temuan + tindak lanjut + foto + metadata.
// Tanpa jawaban mentah per soal (D-02). Cetak via browser.

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { Printer } from "lucide-react";
import { repository } from "~/shared/api/repository";
import { usePublicReportPdf } from "~/shared/api/public-report-pdf";
import type { SelfAssessmentSnapshot } from "~/mocks/types";
import { EmptyState } from "~/shared/components/empty-state";
import { StatusChip } from "~/shared/components/status-chip";

// D-27: foto bukti per jawaban tampil publik di PDF.
// Blob hanya ada di perangkat pengunggah; perangkat lain menampilkan
// nama file + catatan.
function FotoBukti({
  assetId,
  institutionCode,
  name,
}: {
  assetId?: string;
  institutionCode: string;
  name: string;
}) {
  const [url, setUrl] = useState("");
  const [hilang, setHilang] = useState(false);
  useEffect(() => {
    if (!assetId) return;
    let batal = false;
    let objectUrl = "";
    repository
      .openEvidenceAsset(assetId, institutionCode)
      .then((asset) => {
        if (batal) return;
        if (!asset.ok) {
          setHilang(true);
          return;
        }
        objectUrl = URL.createObjectURL(asset.blob);
        setUrl(objectUrl);
      })
      .catch(() => {
        if (!batal) setHilang(true);
      });
    return () => {
      batal = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [assetId, institutionCode]);
  if (!assetId)
    return (
      <p className="mt-2 text-sm text-secondary-text">
        {name} (hanya nama file, gambar tidak diunggah pada perangkat ini).
      </p>
    );
  if (hilang)
    return (
      <p className="mt-2 text-sm text-secondary-text">
        {name} (gambar hanya tersedia di perangkat pengunggah).
      </p>
    );
  if (!url)
    return (
      <p role="status" className="mt-2 text-sm text-secondary-text">
        Memuat gambar {name}…
      </p>
    );
  return (
    <figure className="mt-2 break-inside-avoid">
      <img
        src={url}
        alt={`Bukti foto: ${name}`}
        className="max-h-80 w-full rounded object-contain"
      />
      <figcaption className="mt-1 break-words text-xs text-secondary-text">
        {name}
      </figcaption>
    </figure>
  );
}

function BuktiFoto({
  snapshot,
  institutionCode,
}: {
  snapshot?: SelfAssessmentSnapshot | null;
  institutionCode: string;
}) {
  const entri = Object.entries(snapshot?.answers ?? {}).filter(
    ([, jawaban]) => jawaban.evidenceAssetId || jawaban.evidenceName?.trim(),
  );
  if (!entri.length) return null;
  const beku = new Map((snapshot?.frozenIndicators ?? []).map((item) => [item.id, item]));
  return (
    <div className="mt-5">
      <h2 className="font-extrabold text-heading">Bukti foto</h2>
      <ul className="mt-2 space-y-3">
        {entri.map(([id, jawaban]) => {
          const info = beku.get(id);
          return (
            <li key={id} className="rounded-lg border border-line p-3 break-inside-avoid">
              <p className="text-sm font-bold text-heading">
                {info ? `${info.code} · ${info.title}` : id}
              </p>
              <FotoBukti
                assetId={jawaban.evidenceAssetId}
                institutionCode={institutionCode}
                name={jawaban.evidenceName}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function LaporanPdfPage() {
  const { id } = useParams();
  const data = usePublicReportPdf(id);

  if (!data)
    return (
      <EmptyState
        title="Laporan tidak tersedia"
        description="Hanya laporan penilaian mandiri yang sudah Diterima yang dapat dibuka publik."
      />
    );

  const { report, snapshot, institution } = data;
  const temuan = data.findings;
  const rekomendasi = new Map(data.recommendations.map((r) => [r.id, r]));
  const checksumPendek = snapshot?.instrumentChecksum
    ? snapshot.instrumentChecksum.slice(0, 8)
    : "";
  const tanggalKirim = report.submittedAt ?? report.createdAt;

  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2 print:hidden">
        <Link className="text-button" to="/hasil">
          ← Kembali ke hasil
        </Link>
        <button
          type="button"
          className="primary-button ms-auto"
          onClick={() => window.print()}
        >
          <Printer size={16} />
          Cetak / simpan PDF
        </button>
      </div>
      <article className="surface p-6">
        <p className="kicker">ISHAS · Penilaian K3L Pesantren</p>
        <h1 className="mt-1 text-2xl font-extrabold text-heading">{report.title}</h1>
        <p className="mt-1 text-sm text-secondary-text">
          {institution?.name} · {institution?.location} ·{" "}
          {new Date(tanggalKirim).toLocaleDateString("id-ID")}
        </p>
        <p className="mt-1 text-xs text-secondary-text">
          {data.instrumentLabel}
          {checksumPendek ? ` · checksum ${checksumPendek}` : ""}
          {report.pdfGeneratedAt
            ? ` · PDF dibuat ${new Date(report.pdfGeneratedAt).toLocaleDateString("id-ID")}`
            : ""}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <StatusChip value="Diterima" />
          {report.severity !== "Belum ditentukan" ? (
            <StatusChip value={report.severity} />
          ) : null}
          {report.priority !== "Belum ditentukan" ? (
            <StatusChip value={report.priority} />
          ) : null}
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-strip p-4 text-center">
            <p className="text-xs font-bold text-secondary-text">Skor penilaian</p>
            <p className="text-4xl font-extrabold text-heading">
              {report.scorePercent === undefined || report.scorePercent === null
                ? "—"
                : Math.round(report.scorePercent)}
            </p>
            <p className="text-xs text-secondary-text">dari 100 · ilustrasi</p>
          </div>
          <div className="rounded-lg bg-strip p-4 text-center">
            <p className="text-xs font-bold text-secondary-text">Indikator dinilai</p>
            <p className="text-4xl font-extrabold text-heading">
              {snapshot ? Object.keys(snapshot.answers).length : 0}
            </p>
            <p className="text-xs text-secondary-text">jawaban snapshot beku</p>
          </div>
          <div className="rounded-lg bg-strip p-4 text-center">
            <p className="text-xs font-bold text-secondary-text">Temuan</p>
            <p className="text-4xl font-extrabold text-heading">{temuan.length}</p>
            <p className="text-xs text-secondary-text">perlu tindak lanjut</p>
          </div>
        </div>
        {snapshot?.byDimension && Object.keys(snapshot.byDimension).length ? (
          <div className="mt-5">
            <h2 className="font-extrabold text-heading">Skor per dimensi</h2>
            <ul className="mt-2 space-y-2">
              {Object.entries(snapshot.byDimension).map(([dimId, value]) => {
                const name =
                  snapshot.frozenIndicators?.find((f) => f.dimensionId === dimId)
                    ?.dimensionName ?? dimId;
                return (
                  <li key={dimId} className="flex items-center gap-3 text-sm">
                    <span className="min-w-0 flex-1 font-semibold text-heading">{name}</span>
                    <strong>{value === null ? "—" : Math.round(value)}</strong>
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-strip">
                      <div
                        className="h-full bg-accent"
                        style={{ width: `${Math.round(value ?? 0)}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
        <div className="mt-5">
          <h2 className="font-extrabold text-heading">Temuan tervalidasi</h2>
          {temuan.length ? (
            <ul className="mt-2 divide-y divide-line">
              {temuan.map((item) => {
                const tindak = rekomendasi.get(item.recommendationId);
                const detailLokasi = [item.building, item.zone, item.floor]
                  .filter((bagian) => bagian && bagian !== "—")
                  .join(" · ");
                return (
                  <li key={item.id} className="py-3 text-sm break-inside-avoid">
                    <div className="flex flex-wrap items-center gap-2">
                      <strong className="mr-auto text-heading">{item.issue}</strong>
                      <StatusChip value={item.level} />
                    </div>
                    <p className="mt-1 text-secondary-text">
                      {item.location}
                      {detailLokasi ? ` · ${detailLokasi}` : ""}
                    </p>
                    {tindak ? (
                      <p className="mt-1 text-xs text-secondary-text">
                        Tindak lanjut: {tindak.status} · progres {tindak.progress}%
                        {tindak.owner ? ` · PIC ${tindak.owner}` : ""}
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-secondary-text">
              Tidak ada temuan bahaya pada penilaian ini.
            </p>
          )}
        </div>
        <BuktiFoto snapshot={snapshot} institutionCode={report.institutionCode} />
        {report.validatedByName ? (
          <p className="mt-5 text-sm text-secondary-text">
            Divalidasi oleh {report.validatedByName}
            {report.validatedAt
              ? ` · ${new Date(report.validatedAt).toLocaleDateString("id-ID")}`
              : ""}
          </p>
        ) : null}
        <p className="mt-2 text-xs text-faint">
          Data ilustrasi prototipe · nama pelapor, kontak, dan jawaban mentah tidak
          ditampilkan publik (D-02); foto bukti tampil publik (D-27).
        </p>
      </article>
    </section>
  );
}
