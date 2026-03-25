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
      className="group cursor-pointer bg-[var(--bg-raised)] border border-[var(--border-subtle)] rounded-lg overflow-hidden transition-all duration-250 hover:-translate-y-[2px] hover:border-[var(--border-copper)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
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
          <div className="w-full h-full bg-[var(--bg-hover)] flex items-center justify-center px-6">
            <span
              className="text-[20px] text-[var(--text-muted)] uppercase text-center leading-tight tracking-wide"
              style={{ fontFamily: "var(--font-display-org)" }}
            >
              {event.fields.Name || "Untitled Event"}
            </span>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span
            className="px-3 py-1.5 rounded-md text-[11px] font-medium uppercase tracking-wide backdrop-blur-[8px]"
            style={{
              fontFamily: "var(--font-body-org)",
              background: "rgba(10,10,10,0.75)",
              color: isPublished ? "var(--status-live)" : "var(--status-draft)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {isPublished ? "Published" : "Draft"}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3
          className="text-[16px] text-[var(--text-primary)] truncate leading-snug"
          style={{ fontFamily: "var(--font-body-org)", fontWeight: 600 }}
        >
          {event.fields.Name || "Untitled Event"}
        </h3>

        <div className="flex items-center gap-2 mt-2">
          <p
            className="text-[13px] text-[var(--text-secondary)]"
            style={{ fontFamily: "var(--font-body-org)" }}
          >
            {formatDate(event.fields.Date)}
          </p>

          {event.fields.Location && (
            <>
              <span className="text-[var(--text-muted)]">·</span>
              <p
                className="text-[13px] text-[var(--text-secondary)] truncate"
                style={{ fontFamily: "var(--font-body-org)" }}
              >
                {event.fields.Location}
              </p>
            </>
          )}
        </div>

        <p
          className="text-[12px] text-[var(--text-muted)] group-hover:text-[var(--copper)] transition-colors duration-200 mt-4 tracking-wide"
          style={{ fontFamily: "var(--font-mono-org)" }}
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
      className="w-full h-full min-h-[300px] rounded-lg border border-dashed border-[var(--border-subtle)] hover:border-[var(--border-copper)] flex items-center justify-center transition-all duration-200 group bg-transparent"
    >
      <span
        className="text-[13px] text-[var(--text-muted)] group-hover:text-[var(--copper)] uppercase tracking-[0.08em] transition-colors duration-200"
        style={{ fontFamily: "var(--font-body-org)" }}
      >
        + Create Event
      </span>
    </button>
  );
}
