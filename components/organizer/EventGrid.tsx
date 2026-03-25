"use client";

import { useState } from "react";
import EventCard, { CreateEventCard } from "./EventCard";

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

type FilterType = "all" | "published" | "drafts";

interface EventGridProps {
  events: Event[];
  onCreateEvent: () => void;
}

export default function EventGrid({ events, onCreateEvent }: EventGridProps) {
  const [filter, setFilter] = useState<FilterType>("all");

  const filtered = events.filter((e) => {
    if (filter === "published") return e.fields.Status === "published";
    if (filter === "drafts") return e.fields.Status !== "published";
    return true;
  });

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "published", label: "Published" },
    { key: "drafts", label: "Drafts" },
  ];

  return (
    <div>
      {/* Section Header + Filters */}
      <div className="flex items-center justify-between mb-6">
        <h2
          className="text-[14px] uppercase tracking-[0.2em] text-[var(--text-secondary)]"
          style={{ fontFamily: "var(--font-display-org)" }}
        >
          Events
        </h2>

        <div className="flex items-center gap-4">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`text-[11px] uppercase tracking-[0.08em] pb-1 transition-colors duration-200 ${
                filter === f.key
                  ? "text-[var(--text-primary)] border-b border-[var(--copper)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
              style={{ fontFamily: "var(--font-body-org)" }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 && events.length === 0 ? (
        <div className="py-16 text-center">
          <p
            className="text-[13px] text-[var(--text-muted)] mb-6"
            style={{ fontFamily: "var(--font-body-org)" }}
          >
            No events yet. Create your first event to get started.
          </p>
          <button
            onClick={onCreateEvent}
            className="px-6 py-3 bg-[var(--copper)] text-[var(--bg-base)] text-[11px] uppercase tracking-[0.15em] rounded-[2px] hover:opacity-90 transition-opacity duration-200"
            style={{ fontFamily: "var(--font-display-org)" }}
          >
            + New Event
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((ev) => (
            <EventCard key={ev.id} event={ev} />
          ))}
          <CreateEventCard onClick={onCreateEvent} />
        </div>
      )}
    </div>
  );
}
