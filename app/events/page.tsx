"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import SiteLayout from "@/components/layout/SiteLayout";

// ─── Mock data (replace with API call) ───────────────────────────────────────

const ALL_EVENTS = [
  { slug: "nocturnal-001", name: "Nocturnal", date: "SAT 12 APR", time: "22:00", organizer: "MKhan", image: null, filter: "week" },
  { slug: "signal-karachi-apr", name: "Signal", date: "FRI 18 APR", time: "21:00", organizer: "Basement Collective", image: null, filter: "week" },
  { slug: "the-room-vol3", name: "The Room Vol. 3", date: "SAT 26 APR", time: "22:30", organizer: "Sidereal", image: null, filter: "month" },
  { slug: "frequency-may", name: "Frequency", date: "FRI 02 MAY", time: "20:00", organizer: "FRQNCY", image: null, filter: "month" },
  { slug: "closed-circuit", name: "Closed Circuit", date: "SAT 10 MAY", time: "23:00", organizer: "MKhan", image: null, filter: "month" },
  { slug: "axis-vol2", name: "Axis Vol. 2", date: "SAT 17 MAY", time: "22:00", organizer: "Basement Collective", image: null, filter: "all" },
];

const DATE_FILTERS = [
  { label: "This week", value: "week" },
  { label: "This month", value: "month" },
  { label: "All", value: "all" },
];

// ─── Skeleton card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div
      style={{
        background: "var(--smoke)",
        border: "1px solid var(--concrete)",
        borderRadius: "8px",
        overflow: "hidden",
        height: "420px",
      }}
    >
      <div
        style={{ height: "60%", background: "var(--concrete)" }}
        className="shimmer"
      />
      <div style={{ padding: "16px 20px" }}>
        <div className="shimmer" style={{ height: "14px", width: "60%", borderRadius: "4px", marginBottom: "10px", background: "var(--concrete)" }} />
        <div className="shimmer" style={{ height: "12px", width: "40%", borderRadius: "4px", background: "var(--concrete)" }} />
      </div>
    </div>
  );
}

// ─── Event grid card ──────────────────────────────────────────────────────────

function EventGridCard({ event }: { event: typeof ALL_EVENTS[0] }) {
  return (
    <Link
      href={`/events/${event.slug}`}
      style={{
        display: "block",
        background: "var(--smoke)",
        border: "1px solid var(--concrete)",
        borderRadius: "8px",
        overflow: "hidden",
        textDecoration: "none",
        transition: "transform 200ms ease, border-color 200ms ease",
      }}
      className="whispr-event-card"
    >
      {/* Image / dark top */}
      <div
        style={{
          height: "252px",
          background: event.image
            ? `url(${event.image}) center/cover`
            : "linear-gradient(180deg, #1a1a1c 0%, #111113 100%)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "60%",
            background: "linear-gradient(to top, rgba(28,28,30,1) 0%, transparent 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "12px",
            left: "20px",
            right: "20px",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: "18px",
              color: "var(--paper)",
              margin: 0,
            }}
          >
            {event.name}
          </p>
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: "16px 20px 20px" }}>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--copper)", marginBottom: "6px" }}>
          {event.date} · {event.time}
        </p>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "var(--whisper-gray)" }}>
          {event.organizer}
        </p>
      </div>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EventsPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading] = useState(false);

  const filtered = activeFilter === "all"
    ? ALL_EVENTS
    : ALL_EVENTS.filter((e) => e.filter === activeFilter || e.filter === "all" || activeFilter === "all");

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
                  border: `1px solid ${activeFilter === f.value ? "var(--copper)" : "var(--concrete)"}`,
                  background: "var(--smoke)",
                  color: activeFilter === f.value ? "var(--copper)" : "var(--whisper-gray)",
                  cursor: "pointer",
                  transition: "border-color 200ms ease, color 200ms ease",
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
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", paddingTop: "80px" }}>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "16px", color: "var(--whisper-gray)" }}>
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
                  transition={{ duration: 0.4, delay: i * 0.08, ease: "easeOut" }}
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
          transform: scale(1.02);
          border-color: var(--copper) !important;
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
