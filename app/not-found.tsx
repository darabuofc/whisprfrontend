"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import SiteLayout from "@/components/layout/SiteLayout";

export default function NotFound() {
  return (
    <SiteLayout>
      <div
        style={{
          minHeight: "100vh",
          background: "var(--void)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "0 24px",
        }}
      >
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "48px",
              color: "var(--paper)",
              marginBottom: "16px",
              letterSpacing: "0.02em",
            }}
          >
            Wrong room.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "16px",
              color: "var(--whisper-gray)",
              marginBottom: "40px",
            }}
          >
            This page doesn&apos;t exist. The night is elsewhere.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
          >
            <Link
              href="/events"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: "15px",
                color: "var(--copper)",
                border: "1px solid var(--copper)",
                background: "transparent",
                padding: "12px 28px",
                borderRadius: "6px",
                textDecoration: "none",
                display: "inline-block",
                transition: "background 200ms ease, color 200ms ease",
              }}
              className="whispr-ghost-btn"
            >
              Back to Events
            </Link>
          </motion.div>
        </div>
      </div>

      <style>{`
        .whispr-ghost-btn:hover {
          background: var(--copper) !important;
          color: var(--void) !important;
        }
      `}</style>
    </SiteLayout>
  );
}
