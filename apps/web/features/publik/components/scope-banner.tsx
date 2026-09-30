// Banner scope dashboard — WIREFRAMES.md §1 region 1.
// Ikon gedung + Pesantren aktif + Periode hasil + versi instrumen.

import { Building2 } from "lucide-react";

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
      <span aria-hidden className="text-brand-border">
        |
      </span>
      <span>
        Periode hasil: {periode}
        {instrumentLabel ? ` · ${instrumentLabel}` : ""}
      </span>
    </div>
  );
}
