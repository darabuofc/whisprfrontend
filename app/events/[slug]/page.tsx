"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { joinExistingRegistration } from "@/lib/api";
import Link from "next/link";
import { motion } from "framer-motion";
import SiteLayout from "@/components/layout/SiteLayout";

// ─── Mock data (replace with API call using slug) ─────────────────────────────

const MOCK_EVENT = {
  name: "Nocturnal",
  organizer: "MKhan",
  organizerSlug: "mkhan",
  date: "Saturday, 12 April 2026",
  time: "22:00",
  venue: "Karachi — Venue disclosed to approved guests",
  description: `Nocturnal is an invitation into dark, considered space. A room designed for sound, not spectacle. Entry is gated. Capacity is fixed.

The lineup is announced 48 hours prior. If you're here, you already know what to expect.`,
  tickets: [{ type: "General Entry", price: "2,500" }],
  status: "available" as "available" | "sold_out" | "approved",
  image: null,
};

// ─── Join handler ─────────────────────────────────────────────────────────────

function JoinHandler() {
  const searchParams = useSearchParams();
  const joinCode = searchParams.get("join_code");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!joinCode || done) return;
    setDone(true);
    const id = toast.loading("Joining couple pass…");
    joinExistingRegistration(joinCode)
      .then(() => toast.success("You've joined the couple pass!", { id }))
      .catch((err: any) => {
        const msg = err?.response?.data?.error ?? err?.message ?? "Something went wrong";
        toast.error(`Couldn't join: ${msg}`, { id });
      });
  }, [joinCode, done]);

  return null;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EventDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  // In production: fetch event by slug from /api/events/:slug
  const event = { ...MOCK_EVENT, slug };

  const ctaLabel =
    event.status === "sold_out"
      ? "Sold Out"
      : event.status === "approved"
      ? "You're In"
      : "Request Access";

  const ctaStyle =
    event.status === "sold_out"
      ? { background: "var(--concrete)", color: "var(--whisper-gray)", cursor: "not-allowed" }
      : event.status === "approved"
      ? { background: "transparent", color: "var(--copper)", border: "1px solid var(--copper)", cursor: "default" }
      : { background: "var(--copper)", color: "var(--void)", cursor: "pointer" };

  return (
    <SiteLayout>
      <Suspense fallback={null}>
        <JoinHandler />
      </Suspense>
      <div style={{ minHeight: "100vh", background: "var(--void)" }}>

        {/* Cover image */}
        <div
          style={{
            width: "100%",
            maxHeight: "480px",
            height: "40vw",
            minHeight: "280px",
            background: event.image
              ? `url(${event.image}) center/cover`
              : "linear-gradient(180deg, #1a1a1c 0%, #111113 100%)",
            position: "relative",
          }}
        >
          {/* Gradient overlay */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "40%",
              background: "linear-gradient(to top, var(--void), transparent)",
            }}
          />

          {/* Event name overlaid */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{
              position: "absolute",
              bottom: "32px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "100%",
              maxWidth: "1200px",
              padding: "0 24px",
            }}
          >
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "clamp(28px, 5vw, 48px)",
                color: "var(--paper)",
                margin: 0,
                letterSpacing: "0.02em",
              }}
            >
              {event.name}
            </h1>
          </motion.div>
        </div>

        {/* Body */}
        <div
          style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px 80px" }}
        >
          <div className="flex flex-col lg:flex-row" style={{ gap: "48px" }}>

            {/* Main content */}
            <div style={{ flex: 1 }}>
              {/* Meta */}
              <div style={{ marginBottom: "8px" }}>
                <Link
                  href={`/organizers/${event.organizerSlug}`}
                  style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 500,
                    fontSize: "16px",
                    color: "var(--whisper-gray)",
                    textDecoration: "none",
                    transition: "color 200ms ease",
                  }}
                  className="whispr-organizer-link"
                >
                  {event.organizer}
                </Link>
              </div>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "16px",
                  color: "var(--copper)",
                  marginBottom: "6px",
                }}
              >
                {event.date} · {event.time}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "15px",
                  color: "var(--whisper-gray)",
                  marginBottom: "40px",
                }}
              >
                {event.venue}
              </p>

              {/* Description */}
              <div style={{ maxWidth: "640px" }}>
                {event.description.split("\n\n").map((para, i) => (
                  <p
                    key={i}
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "16px",
                      color: "var(--paper)",
                      lineHeight: 1.6,
                      marginBottom: "20px",
                    }}
                  >
                    {para}
                  </p>
                ))}
              </div>

              {/* Ticket info */}
              {event.tickets.map((ticket) => (
                <div
                  key={ticket.type}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px 20px",
                    background: "var(--smoke)",
                    border: "1px solid var(--concrete)",
                    borderRadius: "8px",
                    maxWidth: "400px",
                    marginBottom: "32px",
                    marginTop: "32px",
                  }}
                >
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "15px", color: "var(--paper)", margin: 0 }}>
                    {ticket.type}
                  </p>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "15px", color: "var(--copper)", margin: 0 }}>
                    PKR {ticket.price}
                  </p>
                </div>
              ))}

              {/* Mobile CTA */}
              <div className="lg:hidden">
                <button
                  disabled={event.status !== "available"}
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 600,
                    fontSize: "16px",
                    padding: "14px 32px",
                    borderRadius: "6px",
                    border: "none",
                    width: "100%",
                    transition: "background 200ms ease",
                    ...ctaStyle,
                  }}
                  className={event.status === "available" ? "whispr-cta-primary" : ""}
                >
                  {ctaLabel}
                </button>
              </div>
            </div>

            {/* Desktop sticky sidebar */}
            <div
              className="hidden lg:block"
              style={{ width: "300px", flexShrink: 0 }}
            >
              <div
                style={{
                  position: "sticky",
                  top: "84px",
                  background: "var(--smoke)",
                  border: "1px solid var(--concrete)",
                  borderRadius: "12px",
                  padding: "24px",
                }}
              >
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--copper)", marginBottom: "4px" }}>
                  {event.date}
                </p>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--copper)", marginBottom: "16px" }}>
                  {event.time}
                </p>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "var(--whisper-gray)", marginBottom: "20px", lineHeight: 1.5 }}>
                  {event.venue}
                </p>
                {event.tickets.map((ticket) => (
                  <div key={ticket.type} style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "var(--paper)" }}>{ticket.type}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "14px", color: "var(--copper)" }}>PKR {ticket.price}</span>
                  </div>
                ))}
                <button
                  disabled={event.status !== "available"}
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 600,
                    fontSize: "15px",
                    padding: "13px 24px",
                    borderRadius: "6px",
                    border: "none",
                    width: "100%",
                    transition: "background 200ms ease",
                    ...ctaStyle,
                  }}
                  className={event.status === "available" ? "whispr-cta-primary" : ""}
                >
                  {ctaLabel}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .whispr-organizer-link:hover { color: var(--paper) !important; }
        .whispr-cta-primary:hover { background: var(--ember) !important; }
      `}</style>
    </SiteLayout>
  );
}
