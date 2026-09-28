// Jejak audit satu pengamatan SAM-iSAFE (D-26.e).
// Membaca auditEvents global, disaring objectId pengamatan + tindak lanjutnya.

import { useMemo } from "react";
import type { AuditEvent, SamFollowUp } from "~/mocks/types";

export function SamAuditTrail({
  assessmentId,
  followUps,
  events,
}: {
  assessmentId: string;
  followUps: SamFollowUp[];
  events: AuditEvent[];
}) {
  const riwayat = useMemo(() => {
    const ids = new Set([assessmentId, ...followUps.map((item) => item.id)]);
    return events
      .filter((event) => ids.has(event.objectId))
      .sort((a, b) => b.at.localeCompare(a.at));
  }, [assessmentId, followUps, events]);

  if (riwayat.length === 0) {
    return (
      <p className="text-sm text-secondary-text">
        Belum ada jejak audit.
      </p>
    );
  }

  return (
    <ol className="flex flex-col gap-2">
      {riwayat.map((event) => (
        <li
          key={event.id}
          className="flex flex-wrap items-baseline gap-2 border-b border-line pb-2 text-sm last:border-0"
        >
          <strong className="text-heading">
            {event.action}
          </strong>
          <span className="text-xs text-secondary-text">
            {event.actorName} · {event.at.slice(0, 10)}
          </span>
          {event.note ? (
            <span className="w-full text-xs text-faint">
              {event.note}
            </span>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
