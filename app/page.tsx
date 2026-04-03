"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import SiteLayout from "@/components/layout/SiteLayout";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DisplayEvent {
  slug: string;
  name: string;
  date: string;
  time: string;
  organizer: string;
  image: string | null;
}

// ─── API helpers ──────────────────────────────────────────────────────────────

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
function mapToDisplayEvent(raw: any): DisplayEvent {
  const fields = raw.fields ?? raw;
  const imageAttachments = fields.Banner ?? fields.Cover ?? null;
  const imageUrl = Array.isArray(imageAttachments)
    ? (imageAttachments[0]?.url ?? null)
    : typeof imageAttachments === "string"
    ? imageAttachments
    : null;

  return {
    slug: raw.slug ?? raw.id ?? "",
    name: fields.Name ?? fields.name ?? raw.name ?? "",
    date: formatEventDate(fields.Date ?? fields.date ?? raw.date),
    time: fields.Time ?? fields.time ?? raw.time ?? "",
    organizer:
      raw.organizer?.name ??
      raw.organizer ??
      fields.Organizer ??
      "",
    image: imageUrl,
  };
}

async function fetchExploreEvents(): Promise<DisplayEvent[]> {
  try {
    const res = await fetch(`${API_BASE}/events/explore?per_page=10`);
    if (!res.ok) return [];
    const json = await res.json();
    const raw: unknown[] = json.data ?? json.events ?? (Array.isArray(json) ? json : []);
    return raw.map(mapToDisplayEvent);
  } catch {
    return [];
  }
}

// ─── Fade-in on scroll helper ─────────────────────────────────────────────────

function FadeIn({
  children,
  delay = 0,
  className,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

// ─── Grain overlay ────────────────────────────────────────────────────────────

function GrainOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        opacity: 0.04,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat",
      }}
    />
  );
}

// ─── 1. Hero ──────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section
      style={{
        minHeight: "100vh",
        background: "var(--void)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <GrainOverlay />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          padding: "0 24px",
          maxWidth: "800px",
        }}
      >
        {/* Tagline — single H1 */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "clamp(32px, 6vw, 64px)",
            color: "var(--paper)",
            letterSpacing: "0.02em",
            lineHeight: 1.1,
            marginBottom: "24px",
          }}
        >
          The architecture of a night out.
        </motion.h1>

        {/* Sub-line */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1, ease: "easeOut" }}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "clamp(13px, 1.5vw, 15px)",
            color: "var(--copper)",
            letterSpacing: "0.03em",
            marginBottom: "40px",
          }}
        >
          Rooms. Sound. Entry. All designed.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.5, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center justify-center"
          style={{ gap: "16px" }}
        >
          <Link
            href="/events"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: "16px",
              background: "var(--copper)",
              color: "var(--void)",
              padding: "14px 32px",
              borderRadius: "6px",
              textDecoration: "none",
              transition: "background 200ms ease",
              display: "inline-block",
            }}
            className="whispr-cta-primary"
          >
            See What&apos;s Next
          </Link>
          <Link
            href="/organize"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: "16px",
              background: "transparent",
              color: "var(--copper)",
              padding: "14px 32px",
              borderRadius: "6px",
              border: "1px solid var(--copper)",
              textDecoration: "none",
              transition: "background 200ms ease, color 200ms ease",
              display: "inline-block",
            }}
            className="whispr-cta-secondary"
          >
            Bring Your Night
          </Link>
        </motion.div>
      </div>

      <style>{`
        .whispr-cta-primary:hover { background: var(--ember) !important; }
        .whispr-cta-secondary:hover { background: var(--copper) !important; color: var(--void) !important; }
      `}</style>
    </section>
  );
}

// ─── 2. Event Carousel ────────────────────────────────────────────────────────

function EventCard({ event }: { event: DisplayEvent }) {
  return (
    <Link
      href={`/events/${event.slug}`}
      style={{
        display: "block",
        flexShrink: 0,
        width: "320px",
        height: "420px",
        background: "var(--smoke)",
        border: "1px solid var(--concrete)",
        borderRadius: "8px",
        overflow: "hidden",
        textDecoration: "none",
        transition: "transform 200ms ease, border-color 200ms ease",
        position: "relative",
      }}
      className="whispr-event-card"
    >
      {/* Image placeholder / dark top 60% */}
      <div
        style={{
          height: "60%",
          background: event.image
            ? `url(${event.image}) center/cover`
            : "linear-gradient(180deg, #1a1a1c 0%, #111113 100%)",
          position: "relative",
        }}
      >
        {/* Bottom gradient overlay */}
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
        {/* Event name over image */}
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
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "13px",
            color: "var(--copper)",
            marginBottom: "6px",
          }}
        >
          {event.date} · {event.time}
        </p>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "14px",
            color: "var(--whisper-gray)",
          }}
        >
          {event.organizer}
        </p>
      </div>
    </Link>
  );
}

function EventCarousel({ events }: { events: DisplayEvent[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const animRef = useRef<number | null>(null);
  const shouldScroll = events.length >= 2;

  useEffect(() => {
    if (!shouldScroll) return;

    const track = trackRef.current;
    if (!track) return;

    let pos = 0;
    const step = () => {
      if (!isPaused) {
        pos += 0.5;
        // Reset when scrolled halfway (duplicate cards for infinite feel)
        const maxScroll = track.scrollWidth / 2;
        if (pos >= maxScroll) pos = 0;
        track.style.transform = `translateX(-${pos}px)`;
      }
      animRef.current = requestAnimationFrame(step);
    };

    animRef.current = requestAnimationFrame(step);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPaused, shouldScroll]);

  // Duplicate cards for seamless loop only when scrolling is enabled
  const cards = shouldScroll ? [...events, ...events] : events;

  return (
    <section style={{ paddingTop: "80px", paddingBottom: "80px", overflow: "hidden" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", marginBottom: "32px" }}>
        <FadeIn>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              fontSize: "clamp(18px, 2.5vw, 24px)",
              color: "var(--paper)",
            }}
          >
            Now showing
            <span style={{ color: "var(--copper)" }}>.</span>
          </p>
        </FadeIn>
      </div>

      {/* Carousel track */}
      <div
        style={{ position: "relative", overflow: "hidden" }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Right fade-out */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            width: "80px",
            background: "linear-gradient(to left, var(--void), transparent)",
            zIndex: 1,
            pointerEvents: "none",
          }}
        />

        <div
          ref={trackRef}
          style={{
            display: "flex",
            gap: "24px",
            paddingLeft: "24px",
            paddingRight: "24px",
            willChange: shouldScroll ? "transform" : "auto",
          }}
        >
          {cards.map((event, i) => (
            <EventCard key={`${event.slug}-${i}`} event={event} />
          ))}
        </div>
      </div>

      <style>{`
        .whispr-event-card:hover {
          transform: scale(1.02);
          border-color: var(--copper) !important;
        }
      `}</style>
    </section>
  );
}

// ─── 3. Brand Statement ───────────────────────────────────────────────────────

function BrandStatement() {
  return (
    <section
      style={{
        paddingTop: "160px",
        paddingBottom: "160px",
        background: "var(--void)",
      }}
    >
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
        <FadeIn>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "clamp(24px, 4vw, 48px)",
              color: "var(--paper)",
              lineHeight: 1.2,
              letterSpacing: "0.02em",
            }}
          >
            Every good night was drawn before it was lived.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── 4. Trust / Logos (Mode B) ────────────────────────────────────────────────

function TrustSection() {
  return (
    <section
      style={{
        paddingTop: "80px",
        paddingBottom: "80px",
        background: "var(--void)",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
        <FadeIn>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "18px",
              color: "var(--whisper-gray)",
              letterSpacing: "0.01em",
            }}
          >
            Already trusted by the rooms that matter.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [events, setEvents] = useState<DisplayEvent[]>([]);

  useEffect(() => {
    fetchExploreEvents().then(setEvents);
  }, []);

  return (
    <SiteLayout heroPage>
      <Hero />
      <EventCarousel events={events} />
      <BrandStatement />
      <TrustSection />
    </SiteLayout>
  );
}
