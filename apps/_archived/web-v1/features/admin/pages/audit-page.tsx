'use client';

import { useState } from 'react';
import { CheckCircle2, FileText, LockKeyhole, Search } from 'lucide-react';
import { DataState } from '@/components/ui/data-state';
import { AdminHeading } from '@/features/admin/components/admin-heading';
import { useMockStore } from '@/mocks/store/mock-store';

export function AdminAuditPage() {
  const auditRecords = useMockStore((state) => state.auditRecords);
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
