'use client';

import { Building2, Check, History, KeyRound, ShieldCheck } from 'lucide-react';
import { AdminHeading } from '@/features/admin/components/admin-heading';
import { useMockStore } from '@/mocks/store/mock-store';

export function PermissionMark({ allowed }: { allowed: boolean }) {
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

export function AdminPermissionsPage() {
  const permissionRows = useMockStore((state) => state.permissionRows);
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
