import { NavLink, useMatch, useSearchParams } from "react-router";
import {
  BarChart3,
  BookOpen,
  ClipboardCheck,
  ClipboardList,
  FileText,
  ListChecks,
  MapPin,
  Megaphone,
  ShieldAlert,
} from "lucide-react";

const links = [
  ["/", "Dashboard", BarChart3],
  ["/lapor", "Pelaporan", Megaphone],
  ["/penilaian-mandiri", "Penilaian mandiri", ClipboardList],
  ["/hasil", "Hasil penilaian", ClipboardCheck],
  ["/peta-risiko", "Peta risiko", MapPin],
  ["/rekomendasi", "Rekomendasi", ShieldAlert],
  ["/tindak-lanjut", "Tindak lanjut", ListChecks],
  ["/laporan", "Laporan", FileText],
  ["/dokumen", "Dokumen", BookOpen],
] as const;

export function PublicNavigation({ onNavigate }: { onNavigate?: () => void }) {
  const [params] = useSearchParams();
  const institution = useMatch("/pesantren/:kode");
  const context = new URLSearchParams();
  const code = institution?.params.kode ?? params.get("pesantren");
  if (code) context.set("pesantren", code);
  const period = params.get("periode");
  if (period) context.set("periode", period);
  const query = context.size ? `?${context}` : "";
  const items = (
    <nav aria-label="Menu publik" className="p-3">
      <ul className="space-y-1">
        {links.map(([to, label, Icon]) => (
          <li key={to}>
            <NavLink
              to={`${to}${query}`}
              end={to === "/"}
              aria-current={to === "/" && institution ? "page" : undefined}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${isActive || (to === "/" && institution) ? "bg-primary text-white" : "text-secondary-text hover:bg-strip"}`
              }
            >
              <Icon size={18} aria-hidden />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
  return items;
}
