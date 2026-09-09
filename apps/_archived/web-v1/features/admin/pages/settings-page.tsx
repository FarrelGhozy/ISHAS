'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  History,
  LockKeyhole,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { AdminHeading } from '@/features/admin/components/admin-heading';
import { mockStoreActions, useMockStore } from '@/mocks/store/mock-store';
export function Toggle({
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

export function AdminSettingsPage() {
  const settings = useMockStore((state) => state.settings);
  const [emailNotification, setEmailNotification] = useState(
    settings.emailNotification,
  );
  const [maintenanceNotice, setMaintenanceNotice] = useState(
    settings.maintenanceNotice,
  );
  const [saved, setSaved] = useState(false);
  const [confirmSessions, setConfirmSessions] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  return (
    <>
      <AdminHeading
        title="Pengaturan Sistem"
        description="Atur preferensi operasional non-ilmiah tanpa memengaruhi instrumen atau hasil assessment."
        action={
          <button
            className="primary-button"
            onClick={() => {
              mockStoreActions.updateSettings({
                emailNotification,
                maintenanceNotice,
              });
              setSaved(true);
            }}
          >
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
      <section className="surface danger-zone">
        <div>
          <History />
          <span>
            <b>Reset seluruh data demo</b>
            <p>
              Kembalikan data lintas role ke kondisi awal. Gunakan sebelum
              memulai skenario presentasi baru.
            </p>
          </span>
        </div>
        <button
          className="danger-button"
          onClick={() => {
            mockStoreActions.resetMockData();
            setEmailNotification(true);
            setMaintenanceNotice(false);
            setSaved(false);
            setSessionEnded(false);
          }}
        >
          Reset data demo
        </button>
      </section>
    </>
  );
}
