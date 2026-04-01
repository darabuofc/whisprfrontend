"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import SiteLayout from "@/components/layout/SiteLayout";

// ─── Mock data ────────────────────────────────────────────────────────────────
// Replace with real API calls to your Laravel backend

const MOCK_EVENTS = [
  {
    slug: "nocturnal-001",
    name: "Nocturnal",
    date: "SAT 12 APR",
    time: "22:00",
    organizer: "MKhan",
    image: null,
  },
  {
    slug: "signal-karachi-apr",
    name: "Signal",
    date: "FRI 18 APR",
    time: "21:00",
    organizer: "Basement Collective",
    image: null,
  },
  {
    slug: "the-room-vol3",
    name: "The Room Vol. 3",
    date: "SAT 26 APR",
    time: "22:30",
    organizer: "Sidereal",
    image: null,
  },
  {
    slug: "frequency-may",
    name: "Frequency",
    date: "FRI 02 MAY",
    time: "20:00",
    organizer: "FRQNCY",
    image: null,
  },
  {
    slug: "closed-circuit",
    name: "Closed Circuit",
    date: "SAT 10 MAY",
    time: "23:00",
    organizer: "MKhan",
    image: null,
  },
];

const MOCK_READS = [
  {
    slug: "architecture-of-entry",
    title: "The Architecture of Entry",
    excerpt: "What a door communicates before anyone walks through it.",
    readTime: "4 min read",
    image: null,
  },
  {
    slug: "guestlist-as-design",
    title: "The Guest List as Design Tool",
    excerpt: "Curation isn't gatekeeping. It's room design with people.",
    readTime: "6 min read",
    image: null,
  },
  {
    slug: "sound-before-crowd",
    title: "Sound Before Crowd",
    excerpt: "Why the best nights start with an empty room and a good system.",
    readTime: "5 min read",
    image: null,
  },
];

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

function EventCard({ event }: { event: typeof MOCK_EVENTS[0] }) {
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

function EventCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
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
  }, [isPaused]);

  // Duplicate cards for seamless loop
  const cards = [...MOCK_EVENTS, ...MOCK_EVENTS];

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
            willChange: "transform",
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

// ─── 4. Organizer Value Prop ──────────────────────────────────────────────────

const VALUE_BLOCKS = [
  {
    headline: "Your audience, filtered.",
    body: "Every name on the list is there because you said so.",
  },
  {
    headline: "Your night, controlled.",
    body: "One dashboard. Approvals, guest lists, door management. Nothing you didn't ask for.",
  },
  {
    headline: "Your room, full.",
    body: "Not oversold. Not underattended. Exactly the capacity you designed it for.",
  },
];

function OrganizerValueProp() {
  return (
    <section
      style={{
        paddingTop: "120px",
        paddingBottom: "80px",
        background: "var(--void)",
      }}
    >
      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "0 24px" }}>
        <FadeIn>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "clamp(22px, 3vw, 36px)",
              color: "var(--copper)",
              marginBottom: "64px",
            }}
          >
            For the ones building the room.
          </p>
        </FadeIn>

        <div style={{ display: "flex", flexDirection: "column", gap: "56px", marginBottom: "64px" }}>
          {VALUE_BLOCKS.map((block, i) => (
            <FadeIn key={block.headline} delay={i * 0.15}>
              <div>
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 600,
                    fontSize: "clamp(18px, 2.5vw, 26px)",
                    color: "var(--paper)",
                    marginBottom: "10px",
                    letterSpacing: "0.01em",
                  }}
                >
                  {block.headline}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "clamp(15px, 1.8vw, 17px)",
                    color: "var(--whisper-gray)",
                    lineHeight: 1.6,
                  }}
                >
                  {block.body}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn>
          <Link
            href="/organize"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: "16px",
              background: "var(--copper)",
              color: "var(--void)",
              padding: "14px 32px",
              borderRadius: "6px",
              textDecoration: "none",
              display: "inline-block",
              transition: "background 200ms ease",
            }}
            className="whispr-cta-primary"
          >
            Start Building →
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── 5. Trust / Logos (Mode B) ────────────────────────────────────────────────

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

// ─── 6. Featured Reads ────────────────────────────────────────────────────────

function BlogCard({ read }: { read: typeof MOCK_READS[0] }) {
  return (
    <Link
      href={`/reads/${read.slug}`}
      style={{
        display: "block",
        flex: 1,
        minWidth: 0,
        background: "var(--smoke)",
        border: "1px solid var(--concrete)",
        borderRadius: "8px",
        overflow: "hidden",
        textDecoration: "none",
        transition: "border-color 200ms ease",
      }}
      className="whispr-blog-card"
    >
      {/* Image area */}
      <div
        style={{
          height: "200px",
          background: read.image
            ? `url(${read.image}) center/cover`
            : "linear-gradient(180deg, #1e1e20 0%, #141416 100%)",
        }}
      />

      {/* Card content */}
      <div style={{ padding: "20px" }}>
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: "20px",
            color: "var(--paper)",
            marginBottom: "8px",
            lineHeight: 1.3,
          }}
        >
          {read.title}
        </p>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "14px",
            color: "var(--whisper-gray)",
            marginBottom: "16px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {read.excerpt}
        </p>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            color: "var(--copper)",
          }}
        >
          {read.readTime}
        </p>
      </div>
    </Link>
  );
}

function FeaturedReads() {
  return (
    <section
      style={{
        paddingTop: "80px",
        paddingBottom: "80px",
        background: "var(--void)",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
        <FadeIn style={{ marginBottom: "12px" }}>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "clamp(22px, 3vw, 32px)",
              color: "var(--paper)",
            }}
          >
            From the inside.
          </p>
        </FadeIn>
        <FadeIn style={{ marginBottom: "40px" }}>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "16px",
              color: "var(--whisper-gray)",
            }}
          >
            Dispatches from the dancefloor, the backroom, and everything in between.
          </p>
        </FadeIn>

        <div
          className="flex flex-col md:flex-row"
          style={{ gap: "24px" }}
        >
          {MOCK_READS.map((read, i) => (
            <FadeIn key={read.slug} delay={i * 0.1} style={{ flex: 1, minWidth: 0 }}>
              <BlogCard read={read} />
            </FadeIn>
          ))}
        </div>
      </div>

      <style>{`
        .whispr-blog-card:hover { border-color: var(--copper) !important; }
      `}</style>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <SiteLayout heroPage>
      <Hero />
      <EventCarousel />
      <BrandStatement />
      <OrganizerValueProp />
      <TrustSection />
      <FeaturedReads />
    </SiteLayout>
  );
}
