// Pola state kosong — docs WIREFRAMES.md §0: pesan + aksi, garis netral, tanpa warna merek baru.

import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="surface flex flex-col items-center gap-2 px-6 py-12 text-center">
      <div className="h-10 w-10 rounded-full border border-line bg-strip" aria-hidden />
      <p className="text-sm font-bold text-heading">{title}</p>
      {description ? <p className="max-w-md text-xs text-secondary-text">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
