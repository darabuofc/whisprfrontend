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
    heading: "All Sales Are Final",
    body: "All ticket purchases on Whispr are non-refundable. Once a ticket is purchased, payment cannot be reversed at the buyer's request. We encourage you to review event details carefully before completing your purchase.",
  },
  {
    heading: "Refunds for Organizer-Cancelled Events",
    body: "If an event is cancelled by the organizer, all affected ticket holders will receive a full refund of the ticket price paid. Refunds in this case are processed automatically and credited back to the original payment method within 5–7 business days.",
  },
  {
    heading: "Significantly Changed Events",
    body: "If an event undergoes a material change — such as a significant change in date, time, or venue — ticket holders will be notified. If you are unable to attend as a result of the change, you may contact us at hello@whisprglobal.com within 48 hours of the notification to request a refund. Requests made after this window may not be honoured.",
  },
  {
    heading: "Processing Time",
    body: "Approved refunds are processed within 5–7 business days. The time it takes for the refund to appear in your account depends on your bank or payment provider and may take an additional 2–5 business days after processing.",
  },
  {
    heading: "Platform & Service Fees",
    body: "In cases where a refund is issued, any applicable platform or service fees may be non-refundable. This will be communicated clearly at the time of the refund.",
  },
  {
    heading: "How to Request a Refund",
    body: "To request a refund for an eligible reason, email hello@whisprglobal.com with your booking reference number and a brief description of the issue. Our team will respond within 3 business days.",
  },
  {
    heading: "Contact",
    body: "For refund-related enquiries, contact us at hello@whisprglobal.com.",
  },
];

export default function RefundPage() {
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
            Refund Policy
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
              Tickets are non-refundable. If the organizer cancels the event,
              you will receive a full refund automatically within 5–7 business
              days.
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
