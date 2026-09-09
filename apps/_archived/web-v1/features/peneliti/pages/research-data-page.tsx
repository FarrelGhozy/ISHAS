'use client';

import { useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  Database,
  Download,
  FileCheck2,
  Search,
  ShieldCheck,
  Upload,
  X,
} from 'lucide-react';
import { DataState } from '@/components/ui/data-state';
import { ResearchHeading } from '@/features/peneliti/components/research-components';
import { useMockStore } from '@/mocks/store/mock-store';

export function ResearchDataPage() {
  const researchDatasets = useMockStore((state) => state.researchDatasets);
  const [query, setQuery] = useState('');
  const [period, setPeriod] = useState('Semua periode');
  const [exported, setExported] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [imported, setImported] = useState(false);
  const [importFile, setImportFile] = useState('');
  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(
    null,
  );
  const normalizedQuery = query.trim().toLowerCase();
  const filteredDatasets = useMemo(
    () =>
      researchDatasets.filter(
        (dataset) =>
          (period === 'Semua periode' || dataset.period === period) &&
          (!normalizedQuery ||
            dataset.name.toLowerCase().includes(normalizedQuery) ||
            dataset.id.toLowerCase().includes(normalizedQuery) ||
            dataset.instrument.toLowerCase().includes(normalizedQuery)),
      ),
    [normalizedQuery, period, researchDatasets],
  );
  const selectedDataset = researchDatasets.find(
    (dataset) => dataset.id === selectedDatasetId,
  );
  return (
    <>
      <ResearchHeading
        title="Data Penelitian"
        description="Kelola dataset assessment teragregasi dengan jejak versi instrumen dan status verifikasi."
        action={
          <div className="page-heading-actions">
            <button
              className="secondary-button"
              onClick={() => setImportOpen(true)}
            >
              <Upload /> Import Excel/CSV
            </button>
            <button
              className="secondary-button"
              onClick={() => setExported(true)}
            >
              <Download /> Ekspor dataset
            </button>
          </div>
        }
      />
      <div className="research-data-guardrail">
        <ShieldCheck />
        <div>
          <b>Data untuk penelitian</b>
          <p>
            Tampilan ini menggunakan data dummy. Ekspor produksi nantinya harus
            menerapkan izin, minimisasi data, dan anonimisasi identitas.
          </p>
        </div>
      </div>
      {exported ? (
        <div className="admin-feedback">
          <CheckCircle2 />
          Simulasi ekspor berhasil disiapkan dengan metadata versi instrumen.
        </div>
      ) : null}
      {imported ? (
        <div className="admin-feedback">
          <CheckCircle2 />
          Simulasi import selesai divalidasi. Baris bermasalah akan ditolak
          sebelum data masuk ke dataset.
        </div>
      ) : null}
      <div className="research-data-stats">
        <article>
          <Database />
          <span>
            <b>4 dataset</b>
            <small>3 aktif · 1 arsip</small>
          </span>
        </article>
        <article>
          <BookOpenCheck />
          <span>
            <b>2.304 rekaman</b>
            <small>Data indikator dummy</small>
          </span>
        </article>
        <article>
          <ShieldCheck />
          <span>
            <b>2 terverifikasi</b>
            <small>Siap untuk analisis contoh</small>
          </span>
        </article>
      </div>
      <section className="surface admin-data-surface">
        <div className="admin-toolbar">
          <div className="admin-search">
            <Search />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari dataset, kode, atau versi..."
              aria-label="Cari dataset"
            />
          </div>
          <select
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            aria-label="Filter periode"
          >
            <option>Semua periode</option>
            <option>Semester 1 2026</option>
            <option>Semester 2 2025</option>
            <option>Semester 1 2025</option>
          </select>
          <span className="admin-result-count">
            {filteredDatasets.length} dataset
          </span>
        </div>
        <div className="admin-table-wrap">
          <div className="admin-table research-data-table admin-table-head">
            <span>Dataset</span>
            <span>Periode</span>
            <span>Versi instrumen</span>
            <span>Pesantren</span>
            <span>Rekaman</span>
            <span>Status</span>
            <span />
          </div>
          {filteredDatasets.map((dataset) => (
            <div
              className="admin-table research-data-table admin-table-row"
              key={dataset.id}
            >
              <div className="dataset-name">
                <span>
                  <Database />
                </span>
                <div>
                  <b>{dataset.name}</b>
                  <small>{dataset.id}</small>
                </div>
              </div>
              <span>{dataset.period}</span>
              <span className="admin-role-chip">{dataset.instrument}</span>
              <span>{dataset.institutions}</span>
              <span>{dataset.records.toLocaleString('id-ID')}</span>
              <span
                className={`status ${dataset.status === 'Terverifikasi' ? 'status-green' : dataset.status === 'Validasi' ? 'status-amber' : 'status-neutral'}`}
              >
                {dataset.status}
              </span>
              <button
                className="admin-row-button"
                aria-label={`Buka ${dataset.name}`}
                onClick={() => setSelectedDatasetId(dataset.id)}
              >
                <ArrowRight />
              </button>
            </div>
          ))}
          {filteredDatasets.length === 0 ? (
            <DataState
              variant="empty"
              title="Dataset tidak ditemukan"
              description="Ubah kata kunci atau filter periode untuk melihat dataset lain."
              compact
            />
          ) : null}
        </div>
      </section>

      {selectedDataset ? (
        <div className="admin-modal-backdrop" role="presentation">
          <dialog
            open
            className="admin-modal dataset-dialog"
            aria-labelledby="dataset-detail-title"
          >
            <div className="admin-modal-head">
              <div>
                <p className="section-kicker">Detail dataset</p>
                <h2 id="dataset-detail-title">{selectedDataset.name}</h2>
                <p>{selectedDataset.id} · Data dummy untuk validasi tampilan</p>
              </div>
              <button
                onClick={() => setSelectedDatasetId(null)}
                aria-label="Tutup detail dataset"
              >
                <X />
              </button>
            </div>
            <dl className="dataset-detail-grid">
              <div>
                <dt>Periode</dt>
                <dd>{selectedDataset.period}</dd>
              </div>
              <div>
                <dt>Versi instrumen</dt>
                <dd>{selectedDataset.instrument}</dd>
              </div>
              <div>
                <dt>Jumlah pesantren</dt>
                <dd>{selectedDataset.institutions}</dd>
              </div>
              <div>
                <dt>Rekaman indikator</dt>
                <dd>{selectedDataset.records.toLocaleString('id-ID')}</dd>
              </div>
              <div>
                <dt>Status verifikasi</dt>
                <dd>{selectedDataset.status}</dd>
              </div>
              <div>
                <dt>Identitas personal</dt>
                <dd>Dianonimkan</dd>
              </div>
            </dl>
            <div className="research-data-guardrail dataset-guardrail">
              <ShieldCheck />
              <div>
                <b>Metadata wajib saat ekspor</b>
                <p>
                  Kode dataset, periode, versi instrumen, status verifikasi, dan
                  waktu ekspor harus ikut tercatat.
                </p>
              </div>
            </div>
            <div className="admin-modal-actions">
              <button
                className="secondary-button"
                onClick={() => setSelectedDatasetId(null)}
              >
                Tutup
              </button>
              <button
                className="primary-button"
                onClick={() => {
                  setExported(true);
                  setSelectedDatasetId(null);
                }}
              >
                <Download /> Ekspor data dummy
              </button>
            </div>
          </dialog>
        </div>
      ) : null}

      {importOpen ? (
        <div className="admin-modal-backdrop" role="presentation">
          <dialog
            open
            className="admin-modal dataset-dialog"
            aria-labelledby="dataset-import-title"
          >
            <div className="admin-modal-head">
              <div>
                <p className="section-kicker">Import data terkontrol</p>
                <h2 id="dataset-import-title">Validasi file Excel/CSV</h2>
                <p>File diperiksa sebelum data dapat dimasukkan ke dataset.</p>
              </div>
              <button
                onClick={() => setImportOpen(false)}
                aria-label="Tutup import dataset"
              >
                <X />
              </button>
            </div>
            <label className="assessment-upload-button dataset-import-upload">
              <Upload /> Pilih file .xlsx atau .csv
              <input
                type="file"
                accept=".xlsx,.csv"
                onChange={(event) =>
                  setImportFile(event.target.files?.[0]?.name ?? '')
                }
              />
            </label>
            {importFile ? (
              <div className="research-data-guardrail dataset-guardrail">
                <FileCheck2 />
                <div>
                  <b>{importFile}</b>
                  <p>
                    Simulasi validasi: kolom identitas, versi instrumen, kode
                    indikator, tipe nilai, dan duplikasi akan diperiksa.
                  </p>
                </div>
              </div>
            ) : (
              <DataState
                variant="empty"
                title="Belum ada file dipilih"
                description="Gunakan template sesuai versi instrumen agar kode indikator dapat dipetakan."
                compact
              />
            )}
            <div className="admin-modal-actions">
              <button
                className="secondary-button"
                onClick={() => setImportOpen(false)}
              >
                Batal
              </button>
              <button
                className="primary-button"
                disabled={!importFile}
                onClick={() => {
                  setImported(true);
                  setImportOpen(false);
                  setImportFile('');
                }}
              >
                <ShieldCheck /> Validasi file dummy
              </button>
            </div>
          </dialog>
        </div>
      ) : null}
    </>
  );
}
