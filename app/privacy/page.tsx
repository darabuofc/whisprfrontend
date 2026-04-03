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
    heading: "1. Information We Collect",
    body: "We collect information you provide directly when you create an account or purchase a ticket: name, email address, phone number, and payment details (processed securely by SafePay — we do not store card numbers). We also collect usage data such as pages visited, event views, and device/browser information.",
  },
  {
    heading: "2. How We Use Your Information",
    body: "We use your information to: (a) create and manage your account; (b) process ticket purchases and send booking confirmations; (c) communicate event updates, reminders, and changes; (d) provide customer support; (e) improve the Platform through aggregated analytics; and (f) comply with legal obligations.",
  },
  {
    heading: "3. Sharing of Information",
    body: "We do not sell your personal information. We share your data only with: (a) event organizers — limited to the information needed to manage attendance (name, booking status); (b) SafePay — our payment processor, bound by its own privacy policy; (c) service providers who assist in operating the Platform (e.g., email delivery, hosting), under confidentiality obligations; and (d) law enforcement or regulatory authorities when required by law.",
  },
  {
    heading: "4. Cookies & Tracking",
    body: "We use essential cookies to keep you logged in and maintain session state. We may use analytics cookies (e.g., Google Analytics) to understand how users interact with the Platform. You can disable non-essential cookies in your browser settings, though some features may be affected.",
  },
  {
    heading: "5. Data Storage & Security",
    body: "Your data is stored on secure servers. We implement industry-standard technical and organisational measures to protect your information against unauthorised access, alteration, disclosure, or destruction. No method of transmission over the internet is 100% secure; we cannot guarantee absolute security.",
  },
  {
    heading: "6. Data Retention",
    body: "We retain your personal data for as long as your account is active or as needed to provide services. If you delete your account, we will delete or anonymise your personal data within 30 days, except where retention is required by law (e.g., financial records).",
  },
  {
    heading: "7. Your Rights",
    body: "You may request access to, correction of, or deletion of your personal data by emailing hello@whisprglobal.com. We will respond within 14 business days. You may also object to processing or request data portability where applicable.",
  },
  {
    heading: "8. Third-Party Links",
    body: "The Platform may contain links to third-party websites (e.g., venue websites, social media). We are not responsible for the privacy practices of those sites and encourage you to review their privacy policies.",
  },
  {
    heading: "9. Children's Privacy",
    body: "The Platform is not directed at children under the age of 18. We do not knowingly collect personal information from minors. If you believe we have inadvertently collected such information, please contact us and we will delete it promptly.",
  },
  {
    heading: "10. Changes to This Policy",
    body: "We may update this Privacy Policy periodically. We will notify you of material changes by updating the date below or via email. Continued use of the Platform after changes constitutes your acceptance of the revised policy.",
  },
  {
    heading: "11. Contact",
    body: "For privacy-related questions or requests, contact us at hello@whisprglobal.com or write to us at Karachi, Pakistan.",
  },
];

export default function PrivacyPage() {
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
            Privacy Policy
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
