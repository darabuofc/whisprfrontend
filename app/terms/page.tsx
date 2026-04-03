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
    heading: "1. Acceptance of Terms",
    body: "By accessing or using the Whispr platform (\"Platform\"), you agree to be bound by these Terms & Conditions. If you do not agree, please do not use the Platform. These terms apply to all visitors, registered users, event attendees, and event organizers.",
  },
  {
    heading: "2. Use of the Platform",
    body: "Whispr provides a platform for discovering, registering for, and managing private and semi-public events in Pakistan. You agree to use the Platform only for lawful purposes and in a manner that does not infringe the rights of others or restrict their use and enjoyment of the Platform.",
  },
  {
    heading: "3. Account Registration",
    body: "To access certain features you must create an account and provide accurate, current, and complete information. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Notify us immediately at hello@whisprglobal.com if you suspect any unauthorized use.",
  },
  {
    heading: "4. Ticket Purchases",
    body: "All ticket purchases are subject to availability and our Refund & Cancellation policies. By completing a purchase you confirm that the information provided is accurate. Tickets are non-transferable unless expressly permitted by the event organizer. Whispr uses SafePay as its payment processor; by purchasing a ticket you also agree to SafePay's terms of service.",
  },
  {
    heading: "5. Organizer Responsibilities",
    body: "Event organizers are solely responsible for the accuracy of event details (date, time, venue, capacity), compliance with applicable laws, and the quality and safety of their events. Whispr is not liable for any acts or omissions of organizers. Organizers must not misrepresent their events or engage in fraudulent activity.",
  },
  {
    heading: "6. Prohibited Conduct",
    body: "You may not: (a) use the Platform to facilitate illegal activity; (b) impersonate any person or entity; (c) scrape, crawl, or data-mine the Platform without permission; (d) upload malicious code or interfere with Platform security; (e) resell tickets at inflated prices without organizer consent; or (f) harass, threaten, or harm other users.",
  },
  {
    heading: "7. Intellectual Property",
    body: "All content on the Platform — including the Whispr name, logo, design, and copy — is the property of Whispr or its licensors and is protected under applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without prior written consent.",
  },
  {
    heading: "8. Limitation of Liability",
    body: "To the maximum extent permitted by law, Whispr and its affiliates, directors, employees, and agents shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Platform or attendance at any event. Our total liability for any claim shall not exceed the amount you paid for the relevant ticket.",
  },
  {
    heading: "9. Disclaimer of Warranties",
    body: "The Platform is provided on an \"as is\" and \"as available\" basis. Whispr makes no warranties, express or implied, regarding the Platform's reliability, accuracy, or fitness for a particular purpose. We do not guarantee that the Platform will be uninterrupted or error-free.",
  },
  {
    heading: "10. Governing Law",
    body: "These Terms & Conditions are governed by and construed in accordance with the laws of the Islamic Republic of Pakistan. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts of Karachi, Pakistan.",
  },
  {
    heading: "11. Changes to Terms",
    body: "Whispr reserves the right to modify these Terms & Conditions at any time. We will notify users of material changes by updating the date below or via email. Continued use of the Platform after changes constitutes your acceptance of the revised terms.",
  },
  {
    heading: "12. Contact",
    body: "For questions about these Terms & Conditions, contact us at hello@whisprglobal.com.",
  },
];

export default function TermsPage() {
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
            Terms &amp; Conditions
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
