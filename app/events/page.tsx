"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import SiteLayout from "@/components/layout/SiteLayout";

// ─── Types ───────────────────────────────────────────────────────────────────

interface EventData {
  slug: string;
  name: string;
  date: string;
  rawDate: string;
  time: string;
  venue: string;
  image: string | null;
  organizer: string;
  orgName: string;
  orgLogo: string | null;
}

// ─── API ─────────────────────────────────────────────────────────────────────

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

function formatEventDate(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const months = [
      "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
      "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
    ];
    return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
  } catch {
    return dateStr;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapEvent(raw: any): EventData {
  const fields = raw.fields ?? raw;

  const bannerRaw = raw.banner ?? fields.Banner ?? null;
  const coverRaw = raw.cover ?? fields.Cover ?? null;
  const imageSource = bannerRaw ?? coverRaw;
  const imageUrl = Array.isArray(imageSource)
    ? (imageSource[0]?.url ?? null)
    : typeof imageSource === "string"
    ? imageSource
    : null;

  const org = raw.organization ?? null;
  const orgLogoRaw = org?.logo ?? null;
  const orgLogo = Array.isArray(orgLogoRaw)
    ? (orgLogoRaw[0]?.url ?? null)
    : typeof orgLogoRaw === "string"
    ? orgLogoRaw
    : null;

  return {
    slug: raw.slug ?? raw.id ?? "",
    name: fields.Name ?? fields.name ?? raw.name ?? "",
    date: formatEventDate(fields.Date ?? fields.date ?? raw.date),
    rawDate: fields.Date ?? fields.date ?? raw.date ?? "",
    time: fields.Time ?? fields.time ?? raw.time ?? "",
    venue: raw.venue ?? fields.Venue ?? fields.venue ?? "",
    image: imageUrl,
    organizer:
      raw.organizer?.name ??
      (typeof raw.organizer === "string" ? raw.organizer : "") ??
      fields.Organizer ??
      "",
    orgName: org?.name ?? "",
    orgLogo,
  };
}

async function fetchEvents(): Promise<EventData[]> {
  try {
    const res = await fetch(`${API_BASE}/events/explore?per_page=50`);
    if (!res.ok) return [];
    const json = await res.json();
    const raw: unknown[] =
      json.data ?? json.events ?? (Array.isArray(json) ? json : []);
    return raw.map(mapEvent);
  } catch {
    return [];
  }
}

// ─── Date filter helpers ─────────────────────────────────────────────────────

function isThisWeek(dateStr: string): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);
  return d >= startOfWeek && d < endOfWeek;
}

function isThisMonth(dateStr: string): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

const DATE_FILTERS = [
  { label: "All", value: "all" },
  { label: "This week", value: "week" },
  { label: "This month", value: "month" },
];

// ─── Skeleton card ───────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div
      style={{
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <div
        style={{ height: "220px", background: "var(--concrete)" }}
        className="shimmer"
      />
      <div style={{ background: "var(--smoke)", padding: "16px 20px 18px" }}>
        <div
          className="shimmer"
          style={{
            height: "12px",
            width: "50%",
            borderRadius: "4px",
            marginBottom: "12px",
            background: "var(--concrete)",
          }}
        />
        <div style={{ height: "1px", background: "var(--concrete)", marginBottom: "12px" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            className="shimmer"
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              background: "var(--concrete)",
            }}
          />
          <div
            className="shimmer"
            style={{
              height: "12px",
              width: "30%",
              borderRadius: "4px",
              background: "var(--concrete)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Event grid card ─────────────────────────────────────────────────────────

function EventGridCard({ event }: { event: EventData }) {
  const displayOrganizer = event.orgName || event.organizer;

  return (
    <Link
      href={`/events/${event.slug}`}
      style={{
        display: "block",
        borderRadius: "12px",
        overflow: "hidden",
        textDecoration: "none",
        transition: "transform 300ms ease, box-shadow 300ms ease",
        position: "relative",
      }}
      className="whispr-event-card"
    >
      {/* Banner image */}
      <div
        style={{
          height: "220px",
          background: event.image
            ? `url(${event.image}) center/cover no-repeat`
            : "linear-gradient(135deg, #1a1a1c 0%, #2a2a2e 50%, #1a1a1c 100%)",
          position: "relative",
        }}
      >
        {/* Vignette */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(10,10,12,0.95) 0%, rgba(10,10,12,0.3) 40%, transparent 100%)",
          }}
        />

        {/* Date badge */}
        {event.date && (
          <div
            style={{
              position: "absolute",
              top: "14px",
              right: "14px",
              background: "rgba(0,0,0,0.65)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              borderRadius: "8px",
              padding: "6px 12px",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--copper)",
                margin: 0,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              {event.date}
            </p>
          </div>
        )}

        {/* Event name */}
        <div
          style={{
            position: "absolute",
            bottom: "16px",
            left: "20px",
            right: "20px",
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "22px",
              color: "#fff",
              margin: 0,
              lineHeight: 1.2,
              textShadow: "0 2px 8px rgba(0,0,0,0.5)",
            }}
          >
            {event.name}
          </h3>
        </div>
      </div>

      {/* Card body */}
      <div
        style={{
          background: "var(--smoke)",
          padding: "16px 20px 18px",
          borderTop: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        {/* Venue */}
        {event.venue && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--copper)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ flexShrink: 0, opacity: 0.8 }}
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                color: "var(--whisper-gray)",
                margin: 0,
                letterSpacing: "0.02em",
              }}
            >
              {event.venue}
            </p>
          </div>
        )}

        {/* Divider */}
        <div style={{ height: "1px", background: "var(--concrete)", margin: "0 0 12px" }} />

        {/* Organizer row */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {event.orgLogo ? (
            <img
              src={event.orgLogo}
              alt={displayOrganizer}
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "1px solid var(--concrete)",
              }}
            />
          ) : displayOrganizer ? (
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: "var(--concrete)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "var(--copper)",
                }}
              >
                {displayOrganizer.charAt(0).toUpperCase()}
              </span>
            </div>
          ) : null}
          {displayOrganizer && (
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--paper)",
                margin: 0,
                opacity: 0.85,
              }}
            >
              {displayOrganizer}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function EventsPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<EventData[]>([]);

  useEffect(() => {
    fetchEvents()
      .then(setEvents)
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    activeFilter === "all"
      ? events
      : activeFilter === "week"
      ? events.filter((e) => isThisWeek(e.rawDate))
      : events.filter((e) => isThisMonth(e.rawDate));

  return (
    <SiteLayout>
      <div
        style={{
          minHeight: "100vh",
          background: "var(--void)",
          paddingTop: "80px",
          paddingBottom: "120px",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ marginBottom: "8px" }}
          >
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "clamp(24px, 4vw, 32px)",
                color: "var(--paper)",
                margin: 0,
              }}
            >
              What&apos;s moving.
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "14px",
              color: "var(--copper)",
              marginBottom: "40px",
            }}
          >
            Karachi
          </motion.p>

          {/* Filter chips */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
            style={{ display: "flex", gap: "8px", marginBottom: "48px", flexWrap: "wrap" }}
          >
            {DATE_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setActiveFilter(f.value)}
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "13px",
                  padding: "6px 14px",
                  borderRadius: "100px",
                  border: `1px solid ${
                    activeFilter === f.value ? "var(--copper)" : "var(--concrete)"
                  }`,
                  background:
                    activeFilter === f.value
                      ? "rgba(184,140,100,0.1)"
                      : "var(--smoke)",
                  color:
                    activeFilter === f.value
                      ? "var(--copper)"
                      : "var(--whisper-gray)",
                  cursor: "pointer",
                  transition:
                    "border-color 200ms ease, color 200ms ease, background 200ms ease",
                }}
              >
                {f.label}
              </button>
            ))}
          </motion.div>

          {/* Grid */}
          {loading ? (
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              style={{ gap: "24px" }}
            >
              {[...Array(6)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", paddingTop: "80px" }}>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "16px",
                  color: "var(--whisper-gray)",
                }}
              >
                Nothing on the calendar yet. Check back soon.
              </p>
            </div>
          ) : (
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              style={{ gap: "24px" }}
            >
              {filtered.map((event, i) => (
                <motion.div
                  key={event.slug}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: i * 0.08,
                    ease: "easeOut",
                  }}
                >
                  <EventGridCard event={event} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .whispr-event-card:hover {
          transform: translateY(-4px) scale(1.01);
          box-shadow: 0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(184,140,100,0.25);
        }
        @keyframes shimmer {
          0% { opacity: 0.5; }
          50% { opacity: 0.8; }
          100% { opacity: 0.5; }
        }
        .shimmer { animation: shimmer 1.5s ease-in-out infinite; }
      `}</style>
    </SiteLayout>
  );
}
