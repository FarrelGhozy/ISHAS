'use client';

import { useState } from 'react';
import {
  Activity,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  History,
  LockKeyhole,
  ShieldCheck,
  X,
} from 'lucide-react';
import {
  ManagerHeading,
  ManagerScope,
} from '@/features/pengelola/components/manager-components';
import { useMockStore } from '@/mocks/store/mock-store';

export function ReportsPage() {
  const periodResults = useMockStore((state) => state.periodResults);
  const reports = useMockStore((state) => state.reports);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [downloaded, setDownloaded] = useState('');
  return (
    <>
      <ManagerHeading
        title="Laporan"
        description="Siapkan ringkasan hasil dan tindak lanjut yang mudah dibaca pimpinan."
        action={
          <button
            className="primary-button"
            onClick={() => setPreviewOpen(true)}
          >
            <FileText /> Buat ringkasan pimpinan
          </button>
        }
      />
      <ManagerScope compact />
      {downloaded ? (
        <div className="admin-feedback">
          <CheckCircle2 /> Simulasi unduhan {downloaded} berhasil disiapkan.
        </div>
      ) : null}
      <div className="report-format-grid">
        <article>
          <FileText />
          <span>
            <b>Ringkasan pimpinan</b>
            <small>Indeks, risiko prioritas, dan progres tindakan</small>
          </span>
          <button onClick={() => setPreviewOpen(true)}>
            Pratinjau <Eye />
          </button>
        </article>
        <article>
          <FileSpreadsheet />
          <span>
            <b>Lampiran data</b>
            <small>Rekap dimensi dan daftar rekomendasi dummy</small>
          </span>
          <button onClick={() => setDownloaded('Excel')}>
            Ekspor <Download />
          </button>
        </article>
        <article>
          <History />
          <span>
            <b>Riwayat laporan</b>
            <small>Versi instrumen tercantum pada setiap laporan</small>
          </span>
          <button
            onClick={() =>
              document
                .getElementById('report-history')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            Lihat <ArrowRight />
          </button>
        </article>
      </div>
      <section className="surface executive-report-preview">
        <div className="executive-report-head">
          <div>
            <span className="manager-report-logo">
              <ShieldCheck />
            </span>
            <span>
              <b>ISHAS</b>
              <small>Ringkasan Evaluasi K3L Pesantren</small>
            </span>
          </div>
          <div>
            <small>Pesantren</small>
            <b>PP Al-Hikmah Malang</b>
          </div>
          <div>
            <small>Periode</small>
            <b>Semester 1 2026</b>
          </div>
        </div>
        <div className="executive-report-score">
          <div>
            <p className="section-kicker">Indeks K3L ilustrasi</p>
            <strong>78,5</strong>
            <span className="status status-green">Baik</span>
          </div>
          <p>
            Hasil meningkat <b>3,2 poin</b> dibanding semester sebelumnya.
            Perhatian utama berada pada jalur evakuasi Asrama Putra A dan
            inspeksi instalasi gas Dapur Utama.
          </p>
        </div>
        <div className="executive-report-grid">
          <section>
            <h3>Ringkasan dimensi</h3>
            {periodResults[0].dimensions.map((item) => (
              <div key={item.name}>
                <span>
                  <b>{item.name}</b>
                  <small>{item.findings} temuan</small>
                </span>
                <i>
                  <em style={{ width: `${item.score}%` }} />
                </i>
                <strong>{item.score}</strong>
              </div>
            ))}
          </section>
          <aside>
            <h3>Status tindak lanjut</h3>
            <div>
              <Activity />
              <span>
                <b>2 pekerjaan berjalan</b>
                <small>Perlu dipantau sampai tenggat</small>
              </span>
            </div>
            <div>
              <Clock3 />
              <span>
                <b>1 menunggu verifikasi</b>
                <small>Bukti telah diserahkan</small>
              </span>
            </div>
            <div>
              <CheckCircle2 />
              <span>
                <b>1 sudah terverifikasi</b>
                <small>Selesai dan terdokumentasi</small>
              </span>
            </div>
          </aside>
        </div>
        <footer>
          <span>
            <LockKeyhole /> Assessment ASM-0254 · ISHAS v1.0
          </span>
          <span>Data ilustrasi prototipe · bukan hasil ilmiah final</span>
        </footer>
      </section>
      <section className="surface report-history-panel" id="report-history">
        <div className="surface-head">
          <div>
            <h2>Riwayat laporan</h2>
            <p>Laporan dipisahkan berdasarkan periode dan versi instrumen</p>
          </div>
          <span className="status status-blue">3 laporan</span>
        </div>
        {reports.map((report) => (
          <article key={report.id}>
            <span>
              <FileText />
            </span>
            <div>
              <small>{report.id}</small>
              <h3>{report.title}</h3>
              <p>
                {report.date} · {report.version}
              </p>
            </div>
            <span
              className={`status ${report.status === 'Siap diunduh' ? 'status-green' : 'status-neutral'}`}
            >
              {report.status}
            </span>
            <button className="row-action" onClick={() => setDownloaded('PDF')}>
              Unduh PDF <Download />
            </button>
          </article>
        ))}
      </section>
      {previewOpen ? (
        <div className="admin-modal-backdrop" role="presentation">
          <dialog
            open
            className="admin-modal manager-report-dialog"
            aria-labelledby="report-create-title"
          >
            <div className="admin-modal-head">
              <div>
                <p className="section-kicker">Ringkasan pimpinan</p>
                <h2 id="report-create-title">Siapkan laporan periode ini</h2>
                <p>
                  Laporan menggunakan hasil final dan progres tindak lanjut
                  terbaru.
                </p>
              </div>
              <button
                onClick={() => setPreviewOpen(false)}
                aria-label="Tutup form laporan"
              >
                <X />
              </button>
            </div>
            <div className="admin-form-grid">
              <label>
                Periode
                <select defaultValue="Semester 1 2026">
                  <option>Semester 1 2026</option>
                  <option>Semester 2 2025</option>
                </select>
              </label>
              <label>
                Format
                <select defaultValue="PDF">
                  <option>PDF</option>
                  <option>Excel</option>
                </select>
              </label>
              <div className="admin-form-full report-section-field">
                <b>Bagian yang disertakan</b>
                <div className="report-section-options">
                  <span>
                    <Check /> Ringkasan indeks dan dimensi
                  </span>
                  <span>
                    <Check /> Temuan risiko prioritas
                  </span>
                  <span>
                    <Check /> Status tindak lanjut
                  </span>
                  <span>
                    <Check /> Metadata assessment
                  </span>
                </div>
              </div>
            </div>
            {generated ? (
              <div className="admin-feedback">
                <CheckCircle2 /> Ringkasan dummy siap diunduh.
              </div>
            ) : null}
            <div className="admin-modal-actions">
              <button
                className="secondary-button"
                onClick={() => setPreviewOpen(false)}
              >
                Tutup
              </button>
              <button
                className="primary-button"
                onClick={() => setGenerated(true)}
              >
                <Download /> Siapkan PDF dummy
              </button>
            </div>
          </dialog>
        </div>
      ) : null}
    </>
  );
}
