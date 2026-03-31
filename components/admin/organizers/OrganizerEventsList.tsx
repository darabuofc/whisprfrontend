"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import StatusBadge from "@/components/admin/shared/StatusBadge";

interface OrgEvent {
  id: string;
  name: string;
  date: string;
  status: string;
  tickets_sold: number;
}

interface OrganizerEventsListProps {
  events: OrgEvent[];
}

export default function OrganizerEventsList({ events }: OrganizerEventsListProps) {
  const router = useRouter();

  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
      <h3
        className="text-[11px] uppercase tracking-[0.15em] text-[var(--text-muted)] mb-5"
        style={{ fontFamily: "var(--font-mono-org)" }}
      >
        Events ({events.length})
      </h3>

      {events.length === 0 ? (
        <p className="text-[13px] text-[var(--text-muted)] py-4 text-center">
          No events yet
        </p>
      ) : (
        <div className="space-y-2">
          {events.map((event) => (
            <button
              key={event.id}
              onClick={() => router.push(`/admin/events/${event.id}`)}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/[0.03] transition-colors text-left"
            >
              <div>
                <p className="text-[13px] text-[var(--text-primary)] font-medium">
                  {event.name}
                </p>
                <p
                  className="text-[11px] text-[var(--text-muted)] mt-0.5"
                  style={{ fontFamily: "var(--font-mono-org)" }}
                >
                  {(() => {
                    try {
                      return format(new Date(event.date), "MMM d, yyyy");
                    } catch {
                      return event.date;
                    }
                  })()}{" "}
                  · {event.tickets_sold} tickets
                </p>
              </div>
              <StatusBadge status={event.status} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
