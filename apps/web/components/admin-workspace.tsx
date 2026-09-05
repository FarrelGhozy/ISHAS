'use client';

import { useState, type SyntheticEvent } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  FileText,
  History,
  KeyRound,
  LockKeyhole,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import { DataState } from '@/components/ui/data-state';

const users = [
  {
    name: 'Dr. M. Ridwan',
    email: 'peneliti@ishas.demo',
    initials: 'MR',
    role: 'Peneliti',
    institution: 'Konsorsium Riset K3L',
    status: 'Aktif',
    lastActive: '5 menit lalu',
  },
  {
    name: 'Ahmad Fauzan',
    email: 'asesor@ishas.demo',
    initials: 'AF',
    role: 'Asesor',
    institution: 'Wilayah Jawa Timur',
    status: 'Aktif',
    lastActive: '18 menit lalu',
  },
  {
    name: 'Ust. K.H. Mustofa Kamal',
    email: 'pengelola@ishas.demo',
    initials: 'MK',
    role: 'Pengelola Pesantren',
    institution: 'PP Al-Hikmah Malang',
    status: 'Aktif',
    lastActive: '1 jam lalu',
  },
  {
    name: 'Nabila Putri',
    email: 'nabila.asesor@ishas.demo',
    initials: 'NP',
    role: 'Asesor',
    institution: 'Wilayah Jawa Tengah',
    status: 'Aktif',
    lastActive: 'Kemarin',
  },
  {
    name: 'Ahmad Rifqi',
    email: 'rifqi@ishas.demo',
    initials: 'AR',
    role: 'Asesor',
    institution: 'Belum ditentukan',
    status: 'Menunggu',
    lastActive: 'Belum pernah masuk',
  },
  {
    name: 'Siti Rahmawati',
    email: 'siti@ishas.demo',
    initials: 'SR',
    role: 'Pengelola Pesantren',
    institution: 'PP Nurul Ilmi',
    status: 'Nonaktif',
    lastActive: '12 hari lalu',
  },
];

const institutions = [
  {
    name: 'PP Al-Hikmah Malang',
    location: 'Malang, Jawa Timur',
    code: 'PSN-0018',
    manager: 'Ust. K.H. Mustofa Kamal',
    users: 8,
    assessment: 'Berjalan',
    status: 'Aktif',
  },
  {
    name: 'Pesantren Darussalam',
    location: 'Jombang, Jawa Timur',
    code: 'PSN-0021',
    manager: 'Ust. Hamdan Fikri',
    users: 6,
    assessment: 'Draft',
    status: 'Aktif',
  },
  {
    name: 'Pesantren Nurul Ilmi',
    location: 'Semarang, Jawa Tengah',
    code: 'PSN-0034',
    manager: 'Siti Rahmawati',
    users: 5,
    assessment: 'Selesai',
    status: 'Aktif',
  },
  {
    name: 'PP Modern Darussalam Gontor',
    location: 'Ponorogo, Jawa Timur',
    code: 'PSN-0042',
    manager: 'Belum ditetapkan',
    users: 3,
    assessment: 'Belum dimulai',
    status: 'Persiapan',
  },
  {
    name: 'PP Al-Muayyad',
    location: 'Surakarta, Jawa Tengah',
    code: 'PSN-0048',
    manager: 'Ust. Bambang W.',
    users: 4,
    assessment: 'Selesai',
    status: 'Aktif',
  },
];

const auditRecords = [
  {
    actor: 'Nadia Permata',
    initials: 'NP',
    action: 'Mengubah hak akses laporan',
    target: 'Peran Pengelola Pesantren',
    category: 'Hak Akses',
    time: 'Hari ini, 09.42',
    reference: 'AUD-260905-091',
  },
  {
    actor: 'Nadia Permata',
    initials: 'NP',
    action: 'Mengaktifkan akun pengguna',
    target: 'Nabila Putri · Asesor',
    category: 'Pengguna',
    time: 'Hari ini, 08.17',
    reference: 'AUD-260905-087',
  },
  {
    actor: 'Dr. M. Ridwan',
    initials: 'MR',
    action: 'Mempublikasikan instrumen',
    target: 'ISHAS v1.0',
    category: 'Instrumen',
    time: 'Kemarin, 16.05',
    reference: 'AUD-260904-074',
  },
  {
    actor: 'Sistem',
    initials: 'SY',
    action: 'Mengunci assessment final',
    target: 'ASM-0254 · PP Al-Hikmah',
    category: 'Assessment',
    time: 'Kemarin, 14.38',
    reference: 'AUD-260904-069',
  },
  {
    actor: 'Nadia Permata',
    initials: 'NP',
    action: 'Memperbarui data pesantren',
    target: 'Pesantren Nurul Ilmi',
    category: 'Pesantren',
    time: '3 Sep 2026, 11.20',
    reference: 'AUD-260903-052',
  },
];

const permissionRows = [
  {
    role: 'Admin',
    scope: 'Seluruh sistem dan lembaga',
    system: true,
    instrument: false,
    assessment: false,
    result: true,
    followUp: false,
  },
  {
    role: 'Peneliti',
    scope: 'Instrumen dan data penelitian',
    system: false,
    instrument: true,
    assessment: false,
    result: true,
    followUp: false,
  },
  {
    role: 'Asesor',
    scope: 'Penugasan assessment sendiri',
    system: false,
    instrument: false,
    assessment: true,
    result: true,
    followUp: false,
  },
  {
    role: 'Pengelola Pesantren',
    scope: 'Data pesantren sendiri',
    system: false,
    instrument: false,
    assessment: false,
    result: true,
    followUp: true,
  },
];

function AdminHeading({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="page-heading">
      <div>
        <p className="section-kicker">Kendali sistem</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </header>
  );
}

function AdminUsersPage() {
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('Semua peran');
  const [showCreate, setShowCreate] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(
    null,
  );
  const normalizedQuery = query.trim().toLowerCase();
  const filteredUsers = users.filter(
    (user) =>
      (roleFilter === 'Semua peran' || user.role === roleFilter) &&
      (!normalizedQuery ||
        user.name.toLowerCase().includes(normalizedQuery) ||
        user.email.toLowerCase().includes(normalizedQuery) ||
        user.institution.toLowerCase().includes(normalizedQuery)),
  );
  const selectedUser = users.find((user) => user.email === selectedUserEmail);

  function createUser(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setShowCreate(false);
    setFeedback(
      'Undangan akun demo berhasil disiapkan dan tercatat di audit log.',
    );
  }

  return (
    <>
      <AdminHeading
        title="Pengguna"
        description="Kelola akun, status aktivasi, peran, dan lingkup akses pengguna ISHAS."
        action={
          <button
            className="primary-button"
            onClick={() => setShowCreate(true)}
          >
            <Plus /> Tambah pengguna
          </button>
        }
      />
      <div className="admin-mini-stats">
        <div>
          <Users />
          <span>
            <b>126</b>
            <small>Total pengguna</small>
          </span>
        </div>
        <div>
          <CheckCircle2 />
          <span>
            <b>118</b>
            <small>Akun aktif</small>
          </span>
        </div>
        <div>
          <AlertTriangle />
          <span>
            <b>3</b>
            <small>Menunggu aktivasi</small>
          </span>
        </div>
        <div>
          <LockKeyhole />
          <span>
            <b>5</b>
            <small>Akun nonaktif</small>
          </span>
        </div>
      </div>
      {feedback ? (
        <div className="admin-feedback">
          <CheckCircle2 />
          {feedback}
        </div>
      ) : null}
      <section className="surface admin-data-surface">
        <div className="admin-toolbar">
          <div className="admin-search">
            <Search />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari nama, email, atau lembaga..."
              aria-label="Cari pengguna"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            aria-label="Filter peran"
          >
            <option>Semua peran</option>
            <option>Admin</option>
            <option>Peneliti</option>
            <option>Asesor</option>
            <option>Pengelola Pesantren</option>
          </select>
          <span className="admin-result-count">
            {filteredUsers.length} pengguna ditampilkan
          </span>
        </div>
        <div className="admin-table-wrap">
          <div className="admin-table admin-users-table admin-table-head">
            <span>Pengguna</span>
            <span>Peran</span>
            <span>Lembaga / lingkup</span>
            <span>Status</span>
            <span>Aktivitas</span>
            <span />
          </div>
          {filteredUsers.map((user) => (
            <div
              className="admin-table admin-users-table admin-table-row"
              key={user.email}
            >
              <div className="admin-person">
                <span>{user.initials}</span>
                <div>
                  <b>{user.name}</b>
                  <small>{user.email}</small>
                </div>
              </div>
              <span className="admin-role-chip">{user.role}</span>
              <span>{user.institution}</span>
              <span
                className={`status ${user.status === 'Aktif' ? 'status-green' : user.status === 'Menunggu' ? 'status-amber' : 'status-neutral'}`}
              >
                {user.status}
              </span>
              <span>{user.lastActive}</span>
              <button
                className="admin-row-button"
                aria-label={`Buka detail ${user.name}`}
                onClick={() => setSelectedUserEmail(user.email)}
              >
                <ArrowRight />
              </button>
            </div>
          ))}
          {filteredUsers.length === 0 ? (
            <div className="admin-empty">
              <Search />
              <b>Pengguna tidak ditemukan</b>
              <p>Coba ubah kata kunci atau filter peran.</p>
            </div>
          ) : null}
        </div>
      </section>

      {showCreate ? (
        <div className="admin-modal-backdrop" role="presentation">
          <dialog
            open
            className="admin-modal"
            aria-labelledby="create-user-title"
          >
            <form onSubmit={createUser}>
              <div className="admin-modal-head">
                <div>
                  <p className="section-kicker">Akun baru</p>
                  <h2 id="create-user-title">Tambah pengguna</h2>
                  <p>
                    Pengguna akan menerima undangan untuk mengaktifkan akun.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  aria-label="Tutup formulir"
                >
                  <X />
                </button>
              </div>
              <div className="admin-form-grid">
                <label>
                  Nama lengkap
                  <input required placeholder="Contoh: Ahmad Fauzan" />
                </label>
                <label>
                  Email
                  <input required type="email" placeholder="nama@lembaga.id" />
                </label>
                <label>
                  Peran
                  <select required defaultValue="">
                    <option value="" disabled>
                      Pilih peran
                    </option>
                    <option>Admin</option>
                    <option>Peneliti</option>
                    <option>Asesor</option>
                    <option>Pengelola Pesantren</option>
                  </select>
                </label>
                <label>
                  Lingkup lembaga
                  <select required defaultValue="">
                    <option value="" disabled>
                      Pilih lingkup
                    </option>
                    <option>Seluruh sistem</option>
                    <option>PP Al-Hikmah Malang</option>
                    <option>Pesantren Darussalam</option>
                    <option>Wilayah Jawa Timur</option>
                  </select>
                </label>
              </div>
              <div className="admin-modal-note">
                <ShieldCheck />
                <p>
                  <b>Prinsip akses minimum</b>Berikan peran dan lingkup sesuai
                  tugas pengguna. Semua perubahan akan dicatat pada audit log.
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
                  Simpan dan kirim undangan
                </button>
              </div>
            </form>
          </dialog>
        </div>
      ) : null}

      {selectedUser ? (
        <div className="admin-modal-backdrop" role="presentation">
          <dialog
            open
            className="admin-modal"
            aria-labelledby="user-detail-title"
          >
            <div className="admin-modal-head">
              <div>
                <p className="section-kicker">Detail pengguna</p>
                <h2 id="user-detail-title">{selectedUser.name}</h2>
                <p>{selectedUser.email}</p>
              </div>
              <button
                onClick={() => setSelectedUserEmail(null)}
                aria-label="Tutup detail pengguna"
              >
                <X />
              </button>
            </div>
            <dl className="dataset-detail-grid">
              <div>
                <dt>Peran</dt>
                <dd>{selectedUser.role}</dd>
              </div>
              <div>
                <dt>Status akun</dt>
                <dd>{selectedUser.status}</dd>
              </div>
              <div>
                <dt>Lingkup</dt>
                <dd>{selectedUser.institution}</dd>
              </div>
              <div>
                <dt>Aktivitas terakhir</dt>
                <dd>{selectedUser.lastActive}</dd>
              </div>
            </dl>
            <div className="admin-modal-note">
              <ShieldCheck />
              <p>
                <b>Perubahan akses wajib teraudit</b>Backend harus memvalidasi
                peran dan lingkup pada setiap permintaan, bukan hanya
                menyembunyikan menu.
              </p>
            </div>
            <div className="admin-modal-actions">
              <button
                className="secondary-button"
                onClick={() => setSelectedUserEmail(null)}
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

function AdminInstitutionsPage() {
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
            <b>48 pesantren</b>
            <p>Terdaftar di 6 wilayah</p>
          </div>
        </article>
        <article>
          <CheckCircle2 />
          <div>
            <b>42 aktif</b>
            <p>Data lembaga terverifikasi</p>
          </div>
        </article>
        <article>
          <FileText />
          <div>
            <b>31 dinilai</b>
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
                  <input required placeholder="Nama resmi lembaga" />
                </label>
                <label>
                  Kode internal
                  <input required placeholder="Contoh: PSN-0051" />
                </label>
                <label>
                  Kota / kabupaten
                  <input required placeholder="Kabupaten, provinsi" />
                </label>
                <label>
                  Pengelola utama
                  <input required placeholder="Nama penanggung jawab" />
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

function PermissionMark({ allowed }: { allowed: boolean }) {
  return (
    <span
      className="permission-cell"
      aria-label={allowed ? 'Diizinkan' : 'Tidak diizinkan'}
    >
      {allowed ? (
        <span className="permission-yes" aria-hidden="true">
          <Check />
        </span>
      ) : (
        <span className="permission-no" aria-hidden="true">
          —
        </span>
      )}
    </span>
  );
}

function AdminPermissionsPage() {
  return (
    <>
      <AdminHeading
        title="Hak Akses"
        description="Pahami batas kewenangan setiap peran sebelum akses diterapkan oleh backend."
      />
      <div className="admin-guardrail">
        <ShieldCheck />
        <div>
          <b>Pemisahan kewenangan utama</b>
          <p>
            Admin mengelola sistem, tetapi tidak mengubah instrumen ilmiah.
            Instrumen published tetap terkunci dan hanya Peneliti yang dapat
            membuat versi pengganti.
          </p>
        </div>
      </div>
      <section className="surface admin-data-surface">
        <div className="surface-head">
          <div>
            <h2>Matriks akses empat peran</h2>
            <p>
              Tanda centang menunjukkan akses utama pada ruang lingkup yang
              telah ditetapkan
            </p>
          </div>
          <span className="status status-blue">Simulasi frontend</span>
        </div>
        <div className="permission-table-wrap">
          <div className="permission-table permission-table-head">
            <span>Peran dan lingkup</span>
            <span>Kelola sistem</span>
            <span>Kelola instrumen</span>
            <span>Isi assessment</span>
            <span>Lihat hasil</span>
            <span>Tindak lanjut</span>
          </div>
          {permissionRows.map((permission) => (
            <div
              className="permission-table permission-table-row"
              key={permission.role}
            >
              <div>
                <b>{permission.role}</b>
                <small>{permission.scope}</small>
              </div>
              <PermissionMark allowed={permission.system} />
              <PermissionMark allowed={permission.instrument} />
              <PermissionMark allowed={permission.assessment} />
              <PermissionMark allowed={permission.result} />
              <PermissionMark allowed={permission.followUp} />
            </div>
          ))}
        </div>
      </section>
      <div className="admin-policy-grid">
        <article className="surface">
          <KeyRound />
          <div>
            <b>Prinsip akses minimum</b>
            <p>
              Setiap akun hanya memperoleh menu dan data yang diperlukan untuk
              tugasnya.
            </p>
          </div>
        </article>
        <article className="surface">
          <Building2 />
          <div>
            <b>Pembatasan lingkup data</b>
            <p>
              Pengelola melihat pesantrennya sendiri; Asesor hanya melihat
              penugasannya.
            </p>
          </div>
        </article>
        <article className="surface">
          <History />
          <div>
            <b>Perubahan teraudit</b>
            <p>
              Aktivasi, perubahan peran, dan perluasan lingkup harus memiliki
              jejak audit.
            </p>
          </div>
        </article>
      </div>
    </>
  );
}

function AdminAuditPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Semua aktivitas');
  const [exported, setExported] = useState(false);
  const normalizedQuery = query.trim().toLowerCase();
  const filteredAudit = auditRecords.filter(
    (record) =>
      (category === 'Semua aktivitas' || record.category === category) &&
      (!normalizedQuery ||
        record.actor.toLowerCase().includes(normalizedQuery) ||
        record.action.toLowerCase().includes(normalizedQuery) ||
        record.target.toLowerCase().includes(normalizedQuery) ||
        record.reference.toLowerCase().includes(normalizedQuery)),
  );
  return (
    <>
      <AdminHeading
        title="Audit Log"
        description="Telusuri perubahan penting, pelaku, objek, dan waktu kejadian di seluruh sistem."
        action={
          <button
            className="secondary-button"
            onClick={() => setExported(true)}
          >
            <FileText /> Ekspor log
          </button>
        }
      />
      {exported ? (
        <div className="admin-feedback">
          <CheckCircle2 /> Ekspor audit log dummy disiapkan dengan filter aktif.
        </div>
      ) : null}
      <div className="admin-audit-notice">
        <LockKeyhole />
        <p>
          <b>Catatan bersifat hanya-baca</b>Audit log tidak dapat diedit atau
          dihapus melalui antarmuka Admin.
        </p>
      </div>
      <section className="surface admin-data-surface">
        <div className="admin-toolbar">
          <div className="admin-search">
            <Search />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari pelaku, aksi, objek, atau referensi..."
              aria-label="Cari audit log"
            />
          </div>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="Filter aktivitas"
          >
            <option>Semua aktivitas</option>
            <option>Pengguna</option>
            <option>Pesantren</option>
            <option>Hak Akses</option>
            <option>Instrumen</option>
            <option>Assessment</option>
          </select>
          <span className="admin-result-count">
            {filteredAudit.length} aktivitas
          </span>
        </div>
        <div className="audit-list">
          {filteredAudit.map((record) => (
            <article className="audit-record" key={record.reference}>
              <span className="audit-avatar">{record.initials}</span>
              <div className="audit-main">
                <div>
                  <b>{record.action}</b>
                  <span className="admin-role-chip">{record.category}</span>
                </div>
                <p>
                  {record.actor} · {record.target}
                </p>
                <small>{record.reference}</small>
              </div>
              <time>{record.time}</time>
            </article>
          ))}
          {filteredAudit.length === 0 ? (
            <DataState
              variant="empty"
              title="Aktivitas tidak ditemukan"
              description="Tidak ada audit log yang cocok dengan pencarian dan kategori aktif."
              compact
            />
          ) : null}
        </div>
      </section>
    </>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      className={`admin-toggle ${checked ? 'admin-toggle-on' : ''}`}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
    >
      <span />
    </button>
  );
}

function AdminSettingsPage() {
  const [emailNotification, setEmailNotification] = useState(true);
  const [maintenanceNotice, setMaintenanceNotice] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmSessions, setConfirmSessions] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  return (
    <>
      <AdminHeading
        title="Pengaturan Sistem"
        description="Atur preferensi operasional non-ilmiah tanpa memengaruhi instrumen atau hasil assessment."
        action={
          <button className="primary-button" onClick={() => setSaved(true)}>
            <Check /> Simpan perubahan
          </button>
        }
      />
      {saved ? (
        <div className="admin-feedback">
          <CheckCircle2 />
          Pengaturan demo berhasil disimpan.
        </div>
      ) : null}
      <div className="settings-layout">
        <section className="surface settings-section">
          <div className="surface-head">
            <div>
              <h2>Preferensi operasional</h2>
              <p>Konfigurasi umum yang berlaku pada lingkungan prototipe</p>
            </div>
            <Settings />
          </div>
          <div className="settings-field">
            <span>
              <b>Nama lingkungan</b>
              <small>Ditampilkan untuk membedakan prototipe dan produksi</small>
            </span>
            <input
              defaultValue="ISHAS Prototype"
              aria-label="Nama lingkungan"
            />
          </div>
          <div className="settings-field">
            <span>
              <b>Batas waktu sesi</b>
              <small>Pengguna diminta masuk kembali setelah tidak aktif</small>
            </span>
            <select defaultValue="30" aria-label="Batas waktu sesi">
              <option value="15">15 menit</option>
              <option value="30">30 menit</option>
              <option value="60">60 menit</option>
            </select>
          </div>
          <div className="settings-field">
            <span>
              <b>Notifikasi email administratif</b>
              <small>Kirim ringkasan aktivasi akun dan insiden akses</small>
            </span>
            <Toggle
              checked={emailNotification}
              onChange={() => setEmailNotification(!emailNotification)}
              label="Notifikasi email administratif"
            />
          </div>
          <div className="settings-field">
            <span>
              <b>Banner pemeliharaan</b>
              <small>Tampilkan pemberitahuan tanpa menonaktifkan sistem</small>
            </span>
            <Toggle
              checked={maintenanceNotice}
              onChange={() => setMaintenanceNotice(!maintenanceNotice)}
              label="Banner pemeliharaan"
            />
          </div>
        </section>
        <aside className="surface settings-boundary">
          <ShieldCheck />
          <p className="section-kicker">Batas kewenangan</p>
          <h2>Konfigurasi ilmiah tidak tersedia di sini</h2>
          <p>
            Bobot, rubric, indikator, scoring, dan publikasi instrumen dikelola
            melalui ruang kerja Peneliti.
          </p>
          <span>
            <LockKeyhole /> Instrumen published tetap terkunci
          </span>
        </aside>
      </div>
      <section className="surface danger-zone">
        <div>
          <AlertTriangle />
          <span>
            <b>Akhiri seluruh sesi demo</b>
            <p>
              Meminta semua pengguna masuk kembali. Tindakan ini akan dicatat
              pada audit log.
            </p>
          </span>
        </div>
        {!confirmSessions ? (
          <button
            className="danger-button"
            onClick={() => setConfirmSessions(true)}
          >
            Akhiri sesi
          </button>
        ) : (
          <div className="danger-confirm">
            <span>Yakin melanjutkan?</span>
            <button
              className="secondary-button"
              onClick={() => setConfirmSessions(false)}
            >
              Batal
            </button>
            <button
              className="danger-button"
              onClick={() => {
                setConfirmSessions(false);
                setSessionEnded(true);
              }}
            >
              Ya, akhiri
            </button>
          </div>
        )}
      </section>
      {sessionEnded ? (
        <div className="admin-feedback">
          <History />
          Simulasi selesai: seluruh sesi demo telah diakhiri dan dicatat.
        </div>
      ) : null}
    </>
  );
}

export function AdminSection({ section }: { section: string }) {
  if (section === 'users') return <AdminUsersPage />;
  if (section === 'institutions') return <AdminInstitutionsPage />;
  if (section === 'permissions') return <AdminPermissionsPage />;
  if (section === 'audit') return <AdminAuditPage />;
  if (section === 'settings') return <AdminSettingsPage />;
  return null;
}
