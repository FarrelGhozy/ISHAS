// Banner scope dashboard — WIREFRAMES.md §1 region 1.
// Ikon gedung + Pesantren aktif + Periode hasil + versi instrumen + chip Data ilustrasi.

import { Building2, ShieldCheck } from "lucide-react";

export function ScopeBanner({
  scopeLabel,
  periode,
  instrumentLabel,
}: {
  scopeLabel: string;
  periode: string;
  instrumentLabel: string | null;
}) {
  return (
    <div className="scope-banner flex-wrap">
      <Building2 size={18} aria-hidden />
      <span>Pesantren aktif: {scopeLabel}</span>
      <span aria-hidden className="text-marun-border">
        |
      </span>
      <span>
        Periode hasil: {periode}
        {instrumentLabel ? ` · ${instrumentLabel}` : ""}
      </span>
      <span className="status status-blue ms-auto">
        <ShieldCheck size={11} aria-hidden />
        Data ilustrasi
      </span>
    </div>
  );
}
