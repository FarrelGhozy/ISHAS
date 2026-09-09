'use client';

import { useState, type SyntheticEvent } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  LockKeyhole,
  Plus,
  Search,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import { AdminHeading } from '@/features/admin/components/admin-heading';
import { mockStoreActions, useMockStore } from '@/mocks/store/mock-store';

export function AdminUsersPage() {
  const users = useMockStore((state) => state.users);
  const institutions = useMockStore((state) => state.institutions);
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
    const form = new FormData(event.currentTarget);
    const readField = (field: string) => {
      const value = form.get(field);
      return typeof value === 'string' ? value.trim() : '';
    };
    const name = readField('name');
    const email = readField('email');
    const role = readField('role');
    const institution = readField('institution');
    const roleIds = {
      Admin: 'admin',
      Peneliti: 'peneliti',
      Asesor: 'asesor',
      'Pengelola Pesantren': 'pengelola',
    } as const;
    const institutionRecord = institutions.find(
      (item) => item.name === institution,
    );
    const result = mockStoreActions.addUser({
      name,
      email,
      role,
      roleId: roleIds[role as keyof typeof roleIds] ?? 'asesor',
      institution,
      institutionCodes: institutionRecord ? [institutionRecord.code] : [],
    });
    if (!result.ok) {
      setFeedback(result.message);
      return;
    }
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
            <b>{users.length}</b>
            <small>Total pengguna</small>
          </span>
        </div>
        <div>
          <CheckCircle2 />
          <span>
            <b>{users.filter((user) => user.status === 'Aktif').length}</b>
            <small>Akun aktif</small>
          </span>
        </div>
        <div>
          <AlertTriangle />
          <span>
            <b>{users.filter((user) => user.status === 'Menunggu').length}</b>
            <small>Menunggu aktivasi</small>
          </span>
        </div>
        <div>
          <LockKeyhole />
          <span>
            <b>{users.filter((user) => user.status === 'Nonaktif').length}</b>
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
                  <input
                    required
                    name="name"
                    placeholder="Contoh: Ahmad Fauzan"
                  />
                </label>
                <label>
                  Email
                  <input
                    required
                    name="email"
                    type="email"
                    placeholder="nama@lembaga.id"
                  />
                </label>
                <label>
                  Peran
                  <select required name="role" defaultValue="">
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
                  <select required name="institution" defaultValue="">
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
