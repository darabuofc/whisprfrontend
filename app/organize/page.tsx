"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import SiteLayout from "@/components/layout/SiteLayout";

// ─── Fade-in helper ───────────────────────────────────────────────────────────

function FadeIn({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
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
      style={style}
    >
      {children}
    </motion.div>
  );
}

// ─── Value blocks ─────────────────────────────────────────────────────────────

const VALUE_BLOCKS = [
  {
    headline: "Your audience, filtered.",
    body: "Approval workflows, auto-approve rules, and a guest list that reflects your standards. Every name is there because you decided it should be.",
  },
  {
    headline: "Your night, controlled.",
    body: "One dashboard. Registrations, payment tracking, approval queues, door check-in. Nothing you didn't ask for, nothing missing that you need.",
  },
  {
    headline: "Your room, full.",
    body: "Capacity management, waitlists, and no overselling. Exactly the room size you designed — no more, no less.",
  },
];

const HOW_STEPS = [
  {
    label: "01",
    headline: "Create your event.",
    body: "Set details, capacity, ticket types, and visibility. Private or semi-public.",
  },
  {
    label: "02",
    headline: "Set your rules.",
    body: "Define who gets in. Approval criteria, auto-approve toggles, invite-only access.",
  },
  {
    label: "03",
    headline: "Open the door.",
    body: "Go live. Manage your room from one dashboard, communicate with guests via WhatsApp.",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrganizePage() {
  const WHATSAPP_URL = "https://wa.me/923000000000?text=Hey%2C%20I'd%20like%20to%20list%20my%20event%20on%20Whispr.";
  const EMAIL = "hello@whisprglobal.com";

  return (
    <SiteLayout>
      <div style={{ minHeight: "100vh", background: "var(--void)" }}>

        {/* Hero */}
        <section
          style={{
            minHeight: "60vh",
            display: "flex",
            alignItems: "center",
            padding: "120px 24px 80px",
          }}
        >
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "clamp(28px, 5vw, 52px)",
                color: "var(--paper)",
                marginBottom: "20px",
                lineHeight: 1.1,
                letterSpacing: "0.01em",
              }}
            >
              For the ones building the room.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "18px",
                color: "var(--whisper-gray)",
                lineHeight: 1.6,
              }}
            >
              Your event. Your room. Your rules.
            </motion.p>
          </div>
        </section>

        {/* The Problem */}
        <section style={{ padding: "0 24px 80px" }}>
          <div style={{ maxWidth: "640px", margin: "0 auto" }}>
            <FadeIn>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "18px",
                  color: "var(--paper)",
                  lineHeight: 1.7,
                }}
              >
                You&apos;ve been managing guest lists in spreadsheets and group chats.
                Approvals happen over DM. Entry is managed on a phone screen.
                Your events deserve infrastructure.
              </p>
            </FadeIn>
          </div>
        </section>

        {/* Value blocks */}
        <section style={{ padding: "40px 24px 80px" }}>
          <div style={{ maxWidth: "640px", margin: "0 auto" }}>
            <FadeIn style={{ marginBottom: "48px" }}>
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "clamp(20px, 2.5vw, 28px)",
                  color: "var(--copper)",
                }}
              >
                What Whispr gives you.
              </p>
            </FadeIn>

            <div style={{ display: "flex", flexDirection: "column", gap: "56px" }}>
              {VALUE_BLOCKS.map((block, i) => (
                <FadeIn key={block.headline} delay={i * 0.12}>
                  <p
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 600,
                      fontSize: "clamp(18px, 2.2vw, 24px)",
                      color: "var(--paper)",
                      marginBottom: "10px",
                    }}
                  >
                    {block.headline}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "16px",
                      color: "var(--whisper-gray)",
                      lineHeight: 1.6,
                    }}
                  >
                    {block.body}
                  </p>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section style={{ padding: "40px 24px 80px" }}>
          <div style={{ maxWidth: "640px", margin: "0 auto" }}>
            <FadeIn style={{ marginBottom: "48px" }}>
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "clamp(20px, 2.5vw, 28px)",
                  color: "var(--copper)",
                }}
              >
                How it works.
              </p>
            </FadeIn>

            <div style={{ position: "relative" }}>
              {/* Copper connecting line */}
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  left: "0",
                  top: "24px",
                  bottom: "24px",
                  width: "1px",
                  background: "var(--copper)",
                  opacity: 0.3,
                }}
              />

              <div style={{ display: "flex", flexDirection: "column", gap: "48px", paddingLeft: "32px" }}>
                {HOW_STEPS.map((step, i) => (
                  <FadeIn key={step.label} delay={i * 0.12}>
                    <p
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "13px",
                        color: "var(--copper)",
                        marginBottom: "8px",
                      }}
                    >
                      {step.label}
                    </p>
                    <p
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 600,
                        fontSize: "20px",
                        color: "var(--paper)",
                        marginBottom: "8px",
                      }}
                    >
                      {step.headline}
                    </p>
                    <p
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "15px",
                        color: "var(--whisper-gray)",
                        lineHeight: 1.6,
                      }}
                    >
                      {step.body}
                    </p>
                  </FadeIn>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Talk to us */}
        <section style={{ padding: "40px 24px 120px" }}>
          <div style={{ maxWidth: "640px", margin: "0 auto" }}>
            <FadeIn style={{ marginBottom: "32px" }}>
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "clamp(20px, 2.5vw, 28px)",
                  color: "var(--paper)",
                }}
              >
                Ready to bring your night to Whispr?
              </p>
            </FadeIn>

            <FadeIn delay={0.1} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "16px" }}>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
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
                Talk to Us on WhatsApp
              </a>

              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "14px",
                  color: "var(--whisper-gray)",
                }}
              >
                Or reach us at{" "}
                <a
                  href={`mailto:${EMAIL}`}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "13px",
                    color: "var(--whisper-gray)",
                    textDecoration: "none",
                    transition: "color 200ms ease",
                  }}
                  className="whispr-email-link"
                >
                  {EMAIL}
                </a>
              </p>
            </FadeIn>
          </div>
        </section>
      </div>

      <style>{`
        .whispr-cta-primary:hover { background: var(--ember) !important; }
        .whispr-email-link:hover { color: var(--copper) !important; }
      `}</style>
    </SiteLayout>
  );
}
