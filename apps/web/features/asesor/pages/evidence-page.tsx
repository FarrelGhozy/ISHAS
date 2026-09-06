'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  ClipboardList,
  FileCheck2,
  FileText,
  ImagePlus,
  LockKeyhole,
  MapPin,
  Plus,
  Save,
  ShieldCheck,
  Upload,
  X,
  type LucideIcon,
} from 'lucide-react';
import { DataState } from '@/components/ui/data-state';
import { AssessorHeading } from '@/features/asesor/components/assessor-components';
import { mockStoreActions, useMockStore } from '@/mocks/store/mock-store';

export function EvidencePage() {
  const evidence = useMockStore((state) => state.evidence);
  const [filter, setFilter] = useState('Semua bukti');
  const [incidentOpen, setIncidentOpen] = useState(false);
  const [incidentSaved, setIncidentSaved] = useState(false);
  const visible = evidence.filter(
    (item) =>
      filter === 'Semua bukti' ||
      (filter === 'Belum lengkap' ? !item.file : Boolean(item.file)),
  );
  return (
    <>
      <AssessorHeading
        title="Bukti Lapangan"
        description="Pastikan foto dan dokumen terhubung ke assessment serta indikator yang tepat."
      />
      <div className="evidence-stats">
        <article>
          <Camera />
          <span>
            <b>{evidence.filter((item) => item.file).length} bukti</b>
            <small>Sudah ditambahkan</small>
          </span>
        </article>
        <article>
          <AlertTriangle />
          <span>
            <b>{evidence.filter((item) => !item.file).length} wajib</b>
            <small>Belum lengkap</small>
          </span>
        </article>
        <article>
          <LockKeyhole />
          <span>
            <b>ISHAS v1.0</b>
            <small>Versi instrumen terkait</small>
          </span>
        </article>
      </div>
      {incidentSaved ? (
        <div className="admin-feedback">
          <CheckCircle2 /> Catatan insiden dummy tersimpan dan siap dikaitkan
          dengan indikator assessment.
        </div>
      ) : null}
      <section className="surface assessment-source-panel">
        <div className="surface-head">
          <div>
            <h2>Sumber data assessment</h2>
            <p>Jenis input yang dipetakan dari kebutuhan proposal ISHAS</p>
          </div>
          <button
            className="secondary-button"
            onClick={() => setIncidentOpen(true)}
          >
            <Plus /> Catat insiden
          </button>
        </div>
        <div className="assessment-source-grid">
          {[
            [
              'Kuesioner',
              'Jawaban terstandar pada form indikator.',
              ClipboardList,
            ],
            [
              'Observasi lapangan',
              'Catatan kondisi dan lokasi temuan.',
              MapPin,
            ],
            [
              'Dokumen/kebijakan',
              'Foto atau PDF sebagai bukti pendukung.',
              FileText,
            ],
            [
              'Catatan insiden',
              'Kejadian, waktu, area, dan ringkasan dampak.',
              AlertTriangle,
            ],
          ].map(([title, description, Icon]) => {
            const SourceIcon = Icon as LucideIcon;
            return (
              <article key={title as string}>
                <SourceIcon />
                <span>
                  <b>{title as string}</b>
                  <small>{description as string}</small>
                </span>
                <CheckCircle2 />
              </article>
            );
          })}
        </div>
        <p className="assessment-source-note">
          Sensor/IoT tetap dicatat sebagai integrasi opsional tahap lanjut,
          bukan syarat prototipe 2026.
        </p>
      </section>
      <section className="surface admin-data-surface">
        <div className="admin-toolbar">
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            aria-label="Filter bukti"
          >
            <option>Semua bukti</option>
            <option>Sudah lengkap</option>
            <option>Belum lengkap</option>
          </select>
          <span className="admin-result-count">
            {visible.length} item bukti
          </span>
        </div>
        <div className="evidence-card-grid">
          {visible.map((item) => (
            <article
              key={item.id}
              className={item.file ? 'complete' : 'missing'}
            >
              <div className="evidence-preview">
                {item.file ? <FileCheck2 /> : <ImagePlus />}
                <span
                  className={`status ${item.file ? 'status-green' : 'status-red'}`}
                >
                  {item.file ? 'Lengkap' : 'Bukti wajib'}
                </span>
              </div>
              <div className="evidence-card-body">
                <small>
                  {item.indicator} · {item.id}
                </small>
                <h3>{item.title}</h3>
                <p>{item.institution}</p>
                {item.file ? (
                  <div className="evidence-file-name">
                    <FileText /> {item.file}
                  </div>
                ) : (
                  <label className="assessment-upload-button">
                    <Upload /> Tambahkan bukti
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(event) => {
                        const name = event.target.files?.[0]?.name;
                        if (name)
                          mockStoreActions.updateEvidence(item.id, name);
                      }}
                    />
                  </label>
                )}
              </div>
            </article>
          ))}
          {visible.length === 0 ? (
            <DataState
              variant="empty"
              title="Bukti tidak ditemukan"
              description="Tidak ada bukti yang cocok dengan filter kelengkapan saat ini."
            />
          ) : null}
        </div>
      </section>
      <div className="context-note context-note-wide">
        <ShieldCheck />
        <p>
          <b>Privasi bukti</b>Pada versi backend, file harus dibatasi
          berdasarkan penugasan, dicatat pengunggahnya, dan tidak boleh menjadi
          tautan publik.
        </p>
      </div>
      {incidentOpen ? (
        <div className="admin-modal-backdrop" role="presentation">
          <dialog
            open
            className="admin-modal"
            aria-labelledby="incident-form-title"
          >
            <div className="admin-modal-head">
              <div>
                <p className="section-kicker">Sumber data pendukung</p>
                <h2 id="incident-form-title">Catat insiden lapangan</h2>
                <p>Form dummy untuk memperjelas kebutuhan data insiden.</p>
              </div>
              <button
                type="button"
                onClick={() => setIncidentOpen(false)}
                aria-label="Tutup form insiden"
              >
                <X />
              </button>
            </div>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setIncidentSaved(true);
                setIncidentOpen(false);
              }}
            >
              <div className="admin-form-grid">
                <label>
                  Tanggal dan waktu kejadian
                  <input type="datetime-local" required />
                </label>
                <label>
                  Area kejadian
                  <select defaultValue="" required>
                    <option value="" disabled>
                      Pilih area
                    </option>
                    <option>Asrama Putra A</option>
                    <option>Dapur Utama</option>
                    <option>Gedung Kelas</option>
                  </select>
                </label>
                <label>
                  Tingkat awal
                  <select defaultValue="Belum diklasifikasi">
                    <option>Belum diklasifikasi</option>
                    <option>Rendah (ilustrasi)</option>
                    <option>Sedang (ilustrasi)</option>
                    <option>Tinggi (ilustrasi)</option>
                  </select>
                </label>
                <label>
                  Indikator terkait
                  <select defaultValue="Belum dipetakan">
                    <option>Belum dipetakan</option>
                    <option>IND-SAR-001</option>
                    <option>IND-SAR-002</option>
                    <option>IND-DAR-001</option>
                  </select>
                </label>
                <label className="admin-form-wide">
                  Ringkasan kejadian
                  <textarea
                    rows={4}
                    required
                    placeholder="Jelaskan kejadian, kondisi, dan tindakan awal..."
                  />
                </label>
              </div>
              <div className="context-note context-note-wide">
                <ShieldCheck />
                <p>
                  <b>Klasifikasi final oleh konfigurasi</b>Level risiko di atas
                  hanya ilustrasi dan tidak menggantikan parameter ilmiah.
                </p>
              </div>
              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setIncidentOpen(false)}
                >
                  Batal
                </button>
                <button type="submit" className="primary-button">
                  <Save /> Simpan catatan dummy
                </button>
              </div>
            </form>
          </dialog>
        </div>
      ) : null}
    </>
  );
}
