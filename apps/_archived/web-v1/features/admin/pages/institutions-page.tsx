'use client';

import { useState, type SyntheticEvent } from 'react';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  FileText,
  Plus,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react';
import { DataState } from '@/components/ui/data-state';
import { AdminHeading } from '@/features/admin/components/admin-heading';
import { mockStoreActions, useMockStore } from '@/mocks/store/mock-store';

export function AdminInstitutionsPage() {
  const institutions = useMockStore((state) => state.institutions);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua status');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const normalizedQuery = query.trim().toLowerCase();
  const filteredInstitutions = institutions.filter(
    (institution) =>
      (statusFilter === 'Semua status' ||
        institution.status === statusFilter) &&
      (!normalizedQuery ||
        institution.name.toLowerCase().includes(normalizedQuery) ||
        institution.location.toLowerCase().includes(normalizedQuery) ||
        institution.code.toLowerCase().includes(normalizedQuery)),
  );
  const selectedInstitution = institutions.find(
    (institution) => institution.code === selectedCode,
  );

  function createInstitution(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const readField = (field: string) => {
      const value = form.get(field);
      return typeof value === 'string' ? value.trim() : '';
    };
    const result = mockStoreActions.addInstitution({
      name: readField('name'),
      location: readField('location'),
      manager: readField('manager'),
    });
    if (!result.ok) {
      setFeedback(result.message);
      return;
    }
    setShowCreate(false);
    setFeedback('Data pesantren dummy berhasil disiapkan untuk verifikasi.');
  }
  return (
    <>
      <AdminHeading
        title="Direktori Pesantren"
        description="Kelola identitas lembaga, pengelola utama, status onboarding, dan aktivitas assessment."
        action={
          <button
            className="primary-button"
            onClick={() => setShowCreate(true)}
          >
            <Plus /> Tambah pesantren
          </button>
        }
      />
      {feedback ? (
        <div className="admin-feedback">
          <CheckCircle2 /> {feedback}
        </div>
      ) : null}
      <div className="admin-highlight-grid">
        <article>
          <Building2 />
          <div>
            <b>{institutions.length} pesantren</b>
            <p>Terdaftar di 6 wilayah</p>
          </div>
        </article>
        <article>
          <CheckCircle2 />
          <div>
            <b>
              {institutions.filter((item) => item.status === 'Aktif').length}{' '}
              aktif
            </b>
            <p>Data lembaga terverifikasi</p>
          </div>
        </article>
        <article>
          <FileText />
          <div>
            <b>
              {
                institutions.filter((item) => item.assessment === 'Selesai')
                  .length
              }{' '}
              dinilai
            </b>
            <p>Memiliki hasil assessment</p>
          </div>
        </article>
      </div>
      <section className="surface admin-data-surface">
        <div className="admin-toolbar">
          <div className="admin-search">
            <Search />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari pesantren, kota, atau kode..."
              aria-label="Cari pesantren"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter status pesantren"
          >
            <option>Semua status</option>
            <option>Aktif</option>
            <option>Persiapan</option>
          </select>
          <span className="admin-result-count">
            {filteredInstitutions.length} lembaga ditampilkan
          </span>
        </div>
        <div className="admin-table-wrap">
          <div className="admin-table admin-institutions-table admin-table-head">
            <span>Pesantren</span>
            <span>Pengelola utama</span>
            <span>Pengguna</span>
            <span>Assessment</span>
            <span>Status</span>
            <span />
          </div>
          {filteredInstitutions.map((institution) => (
            <div
              className="admin-table admin-institutions-table admin-table-row"
              key={institution.code}
            >
              <div className="institution-name">
                <span>
                  <Building2 />
                </span>
                <div>
                  <b>{institution.name}</b>
                  <small>
                    {institution.code} · {institution.location}
                  </small>
                </div>
              </div>
              <span>{institution.manager}</span>
              <span>{institution.users} akun</span>
              <span
                className={`status ${institution.assessment === 'Selesai' ? 'status-green' : institution.assessment === 'Berjalan' || institution.assessment === 'Draft' ? 'status-amber' : 'status-neutral'}`}
              >
                {institution.assessment}
              </span>
              <span
                className={`status ${institution.status === 'Aktif' ? 'status-green' : 'status-blue'}`}
              >
                {institution.status}
              </span>
              <button
                className="admin-row-button"
                aria-label={`Buka detail ${institution.name}`}
                onClick={() => setSelectedCode(institution.code)}
              >
                <ArrowRight />
              </button>
            </div>
          ))}
          {filteredInstitutions.length === 0 ? (
            <DataState
              variant="empty"
              title="Pesantren tidak ditemukan"
              description="Coba ubah kata kunci atau filter status lembaga."
              compact
            />
          ) : null}
        </div>
      </section>

      {showCreate ? (
        <div className="admin-modal-backdrop" role="presentation">
          <dialog
            open
            className="admin-modal"
            aria-labelledby="create-institution-title"
          >
            <form onSubmit={createInstitution}>
              <div className="admin-modal-head">
                <div>
                  <p className="section-kicker">Lembaga baru</p>
                  <h2 id="create-institution-title">Tambah pesantren</h2>
                  <p>
                    Data baru berstatus Persiapan sampai diverifikasi Admin.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  aria-label="Tutup formulir pesantren"
                >
                  <X />
                </button>
              </div>
              <div className="admin-form-grid">
                <label>
                  Nama pesantren
                  <input
                    required
                    name="name"
                    placeholder="Nama resmi lembaga"
                  />
                </label>
                <label>
                  Kode internal
                  <input
                    required
                    name="code"
                    placeholder="Kode dibuat otomatis"
                    disabled
                  />
                </label>
                <label>
                  Kota / kabupaten
                  <input
                    required
                    name="location"
                    placeholder="Kabupaten, provinsi"
                  />
                </label>
                <label>
                  Pengelola utama
                  <input
                    required
                    name="manager"
                    placeholder="Nama penanggung jawab"
                  />
                </label>
                <label className="admin-form-full">
                  Alamat lengkap
                  <textarea
                    required
                    rows={3}
                    placeholder="Alamat lembaga untuk kebutuhan penugasan lapangan"
                  />
                </label>
              </div>
              <div className="admin-modal-note">
                <ShieldCheck />
                <p>
                  <b>Belum mengubah hasil historis</b>Profil lembaga dapat
                  diperbarui tanpa mengganti identitas assessment yang sudah
                  final.
                </p>
              </div>
              <div className="admin-modal-actions">
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => setShowCreate(false)}
                >
                  Batal
                </button>
                <button className="primary-button" type="submit">
                  Simpan sebagai Persiapan
                </button>
              </div>
            </form>
          </dialog>
        </div>
      ) : null}

      {selectedInstitution ? (
        <div className="admin-modal-backdrop" role="presentation">
          <dialog
            open
            className="admin-modal"
            aria-labelledby="institution-detail-title"
          >
            <div className="admin-modal-head">
              <div>
                <p className="section-kicker">Detail lembaga</p>
                <h2 id="institution-detail-title">
                  {selectedInstitution.name}
                </h2>
                <p>
                  {selectedInstitution.code} · {selectedInstitution.location}
                </p>
              </div>
              <button
                onClick={() => setSelectedCode(null)}
                aria-label="Tutup detail lembaga"
              >
                <X />
              </button>
            </div>
            <dl className="dataset-detail-grid">
              <div>
                <dt>Pengelola utama</dt>
                <dd>{selectedInstitution.manager}</dd>
              </div>
              <div>
                <dt>Jumlah akun</dt>
                <dd>{selectedInstitution.users}</dd>
              </div>
              <div>
                <dt>Status assessment</dt>
                <dd>{selectedInstitution.assessment}</dd>
              </div>
              <div>
                <dt>Status onboarding</dt>
                <dd>{selectedInstitution.status}</dd>
              </div>
            </dl>
            <div className="admin-modal-note">
              <Building2 />
              <p>
                <b>Relasi backend</b>Pengguna, penugasan, assessment, dan hasil
                harus mengacu pada ID lembaga yang sama.
              </p>
            </div>
            <div className="admin-modal-actions">
              <button
                className="secondary-button"
                onClick={() => setSelectedCode(null)}
              >
                Tutup
              </button>
            </div>
          </dialog>
        </div>
      ) : null}
    </>
  );
}
