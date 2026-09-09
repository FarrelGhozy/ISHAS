// Chip status — persis DESIGN_SYSTEM.md §2: SELALU label teks + ikon, tidak pernah warna saja.

import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Info,
  Megaphone,
  Minus,
  X,
  type LucideIcon,
} from "lucide-react";

type Chip = { className: string; icon: LucideIcon; label: string };

const RED = "status-red";
const AMBER = "status-amber";
const GREEN = "status-green";
const BLUE = "status-blue";
const NEUTRAL = "status-neutral";

const MAP: Record<string, Chip> = {
  Tinggi: { className: RED, icon: AlertTriangle, label: "Tinggi" },
  Sedang: { className: AMBER, icon: AlertTriangle, label: "Sedang" },
  Rendah: { className: GREEN, icon: CheckCircle2, label: "Rendah" },
  "Belum ditentukan": { className: NEUTRAL, icon: Minus, label: "Belum ditentukan" },
  "Menunggu validasi": { className: NEUTRAL, icon: Clock3, label: "Menunggu validasi" },
  Pending: { className: AMBER, icon: Clock3, label: "Pending" },
  Proses: { className: BLUE, icon: Activity, label: "Proses" },
  Completed: { className: GREEN, icon: CheckCircle2, label: "Completed" },
  Diarsipkan: { className: NEUTRAL, icon: ClipboardCheck, label: "Diarsipkan" },
  Ditolak: { className: NEUTRAL, icon: X, label: "Ditolak" },
  Diterima: { className: GREEN, icon: CheckCircle2, label: "Diterima" },
  "Belum ditindaklanjuti": { className: NEUTRAL, icon: Minus, label: "Belum ditindaklanjuti" },
  Berjalan: { className: BLUE, icon: Activity, label: "Berjalan" },
  "Menunggu verifikasi": { className: AMBER, icon: Clock3, label: "Menunggu verifikasi" },
  Terverifikasi: { className: GREEN, icon: CheckCircle2, label: "Terverifikasi" },
  Aktif: { className: GREEN, icon: CheckCircle2, label: "Aktif" },
  Nonaktif: { className: NEUTRAL, icon: X, label: "Nonaktif" },
  Menunggu: { className: AMBER, icon: Clock3, label: "Menunggu" },
  Persiapan: { className: AMBER, icon: Clock3, label: "Persiapan" },
  Draft: { className: AMBER, icon: Clock3, label: "Draft" },
  Published: { className: GREEN, icon: CheckCircle2, label: "Published" },
  Archived: { className: NEUTRAL, icon: ClipboardCheck, label: "Archived" },
  "lapor-cepat": { className: BLUE, icon: Megaphone, label: "Lapor cepat" },
  "penilaian-mandiri": { className: BLUE, icon: ClipboardCheck, label: "Penilaian mandiri" },
  "Data publik · ilustrasi": { className: BLUE, icon: Info, label: "Data publik · ilustrasi" },
};

export function statusChip(value: string): Chip {
  return MAP[value] ?? { className: NEUTRAL, icon: Minus, label: value };
}

export function StatusChip({ value }: { value: string }) {
  const chip = statusChip(value);
  const Icon = chip.icon;
  return (
    <span className={`status ${chip.className}`}>
      <Icon size={11} aria-hidden />
      {chip.label}
    </span>
  );
}
