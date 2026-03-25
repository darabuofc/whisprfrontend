"use client";

import { useRouter } from "next/navigation";

interface Event {
  id: string;
  fields: {
    Name?: string;
    Date?: string;
    Location?: string;
    Status?: string;
    Cover?: string[];
  };
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "Date TBD";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function EventCard({ event }: { event: Event }) {
  const router = useRouter();
  const isPublished = event.fields.Status === "published";
  const coverImage = event.fields.Cover?.[0];

  return (
    <div
      onClick={() => router.push(`/organizers/events/${event.id}/mission-control`)}
      className="group cursor-pointer bg-[var(--bg-raised)] rounded-[3px] overflow-hidden transition-all duration-250 hover:-translate-y-[2px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)] hover:border-b hover:border-b-[var(--border-copper)]"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }}
    >
      {/* Cover Image */}
      <div className="relative h-[200px] overflow-hidden">
        {coverImage ? (
          <img
            src={coverImage}
            alt={event.fields.Name || "Event"}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-[#111] flex items-center justify-center px-4">
            <span
              className="text-[18px] text-[var(--text-muted)] uppercase text-center leading-tight"
              style={{ fontFamily: "var(--font-display-org)" }}
            >
              {event.fields.Name || "Untitled Event"}
            </span>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span
            className="px-2.5 py-1 rounded-[2px] text-[10px] uppercase backdrop-blur-[8px]"
            style={{
              fontFamily: "var(--font-body-org)",
              background: "rgba(10,10,10,0.7)",
              color: isPublished ? "var(--status-live)" : "var(--status-draft)",
            }}
          >
            {isPublished ? "Published" : "Draft"}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3
          className="text-[15px] text-[var(--text-primary)] truncate"
          style={{ fontFamily: "var(--font-body-org)", fontWeight: 500 }}
        >
          {event.fields.Name || "Untitled Event"}
        </h3>

        <p
          className="text-[11px] text-[var(--text-muted)] mt-1"
          style={{ fontFamily: "var(--font-body-org)" }}
        >
          {formatDate(event.fields.Date)}
        </p>

        {event.fields.Location && (
          <p
            className="text-[11px] text-[var(--text-muted)] mt-1"
            style={{ fontFamily: "var(--font-body-org)" }}
          >
            {event.fields.Location}
          </p>
        )}

        <p
          className="text-[11px] text-[var(--text-muted)] group-hover:text-[var(--copper)] transition-colors duration-200 mt-4"
          style={{ fontFamily: "var(--font-body-org)" }}
        >
          Mission Control →
        </p>
      </div>
    </div>
  );
}

export function CreateEventCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full h-full min-h-[300px] rounded-[3px] border border-dashed border-[var(--border-subtle)] hover:border-[var(--border-copper)] flex items-center justify-center transition-colors duration-200 group bg-transparent"
    >
      <span
        className="text-[12px] text-[var(--text-muted)] group-hover:text-[var(--copper)] uppercase tracking-[0.08em] transition-colors duration-200"
        style={{ fontFamily: "var(--font-body-org)" }}
      >
        + Create Event
      </span>
    </button>
  );
}
