"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import SiteLayout from "@/components/layout/SiteLayout";

function FadeIn({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

const SECTIONS = [
  {
    heading: "Attendee Cancellations",
    body: "Ticket purchases are final. Attendees cannot cancel their ticket once payment has been completed. We recommend reviewing event details — including date, time, venue, and any dress code or requirements — before purchasing.",
  },
  {
    heading: "Organizer Cancellations",
    body: "If an event organizer needs to cancel an event, they must notify Whispr immediately at hello@whisprglobal.com. Upon confirmation of the cancellation, Whispr will notify all registered attendees and process full refunds to each ticket holder within 5–7 business days.",
  },
  {
    heading: "Event Postponements",
    body: "If an organizer postpones an event to a new date, ticket holders will be notified of the new date and their tickets will remain valid. If you are unable to attend the rescheduled event, contact us at hello@whisprglobal.com within 48 hours of receiving the postponement notice to discuss your options.",
  },
  {
    heading: "Partial Cancellations",
    body: "If only part of an event is cancelled (e.g., a specific session or act), refunds may be offered at Whispr's discretion based on the nature and extent of the change. Contact us at hello@whisprglobal.com to enquire.",
  },
  {
    heading: "No-Show Policy",
    body: "Attendees who do not attend an event without prior notice are not entitled to a refund. Tickets are considered used once the event date has passed, regardless of attendance.",
  },
  {
    heading: "How Organizers Cancel an Event",
    body: "Organizers must: (1) email hello@whisprglobal.com with the event name and reason for cancellation; (2) allow Whispr to verify and confirm the cancellation; (3) Whispr will then initiate refunds to all affected attendees and send cancellation notifications on the organizer's behalf.",
  },
  {
    heading: "Contact",
    body: "For cancellation-related enquiries — whether you are an attendee or an organizer — contact us at hello@whisprglobal.com. We aim to respond within 3 business days.",
  },
];

export default function CancellationPage() {
  return (
    <SiteLayout>
      <div
        style={{
          maxWidth: "760px",
          margin: "0 auto",
          padding: "80px 24px 120px",
        }}
      >
        <FadeIn>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--copper)",
              marginBottom: "16px",
            }}
          >
            Legal
          </p>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "clamp(28px, 5vw, 44px)",
              color: "var(--paper)",
              marginBottom: "16px",
              lineHeight: 1.15,
            }}
          >
            Cancellation Policy
          </h1>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "14px",
              color: "var(--whisper-gray)",
              marginBottom: "48px",
            }}
          >
            Last updated: April 2026
          </p>
          <div
            style={{
              borderTop: "1px solid var(--concrete)",
              marginBottom: "48px",
            }}
          />
        </FadeIn>

        {/* Summary callout */}
        <FadeIn delay={0.05}>
          <div
            style={{
              background: "var(--smoke)",
              border: "1px solid var(--concrete)",
              borderLeft: "3px solid var(--copper)",
              borderRadius: "8px",
              padding: "20px 24px",
              marginBottom: "48px",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "14px",
                color: "var(--whisper-gray)",
                lineHeight: 1.65,
              }}
            >
              <span style={{ color: "var(--paper)", fontWeight: 600 }}>
                Short version:
              </span>{" "}
              Attendees cannot cancel tickets. Organizers who cancel an event
              must notify Whispr — all attendees will be fully refunded within
              5–7 business days.
            </p>
          </div>
        </FadeIn>

        <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
          {SECTIONS.map((section, i) => (
            <FadeIn key={section.heading} delay={i * 0.04}>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "18px",
                  color: "var(--paper)",
                  marginBottom: "12px",
                }}
              >
                {section.heading}
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "15px",
                  color: "var(--whisper-gray)",
                  lineHeight: 1.7,
                }}
              >
                {section.body}
              </p>
            </FadeIn>
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}
