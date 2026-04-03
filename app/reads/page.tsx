"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import SiteLayout from "@/components/layout/SiteLayout";

// ─── Mock data (replace with API call) ───────────────────────────────────────

const ALL_READS = [
  {
    slug: "architecture-of-entry",
    title: "The Architecture of Entry",
    excerpt: "What a door communicates before anyone walks through it.",
    readTime: "4 min read",
    date: "March 2026",
    image: null,
    featured: true,
  },
  {
    slug: "guestlist-as-design",
    title: "The Guest List as Design Tool",
    excerpt: "Curation isn't gatekeeping. It's room design with people.",
    readTime: "6 min read",
    date: "March 2026",
    image: null,
    featured: false,
  },
  {
    slug: "sound-before-crowd",
    title: "Sound Before Crowd",
    excerpt: "Why the best nights start with an empty room and a good system.",
    readTime: "5 min read",
    date: "February 2026",
    image: null,
    featured: false,
  },
  {
    slug: "the-room-as-brief",
    title: "The Room as Brief",
    excerpt: "Every venue decision is a design decision. Start there.",
    readTime: "7 min read",
    date: "February 2026",
    image: null,
    featured: false,
  },
];

const featured = ALL_READS.find((r) => r.featured)!;
const grid = ALL_READS.filter((r) => !r.featured);

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReadsPage() {
  return (
    <SiteLayout>
      <div style={{ minHeight: "100vh", background: "var(--void)", paddingBottom: "120px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "80px 24px 0" }}>

          {/* Header */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "clamp(28px, 5vw, 48px)",
              color: "var(--paper)",
              marginBottom: "12px",
            }}
          >
            From the inside.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "16px",
              color: "var(--whisper-gray)",
              marginBottom: "56px",
              lineHeight: 1.6,
            }}
          >
            Dispatches from the dancefloor, the backroom, and everything in between.
          </motion.p>

          {/* Featured post */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
            style={{ marginBottom: "48px" }}
          >
            <Link
              href={`/reads/${featured.slug}`}
              style={{
                display: "block",
                background: "var(--smoke)",
                border: "1px solid var(--concrete)",
                borderRadius: "8px",
                overflow: "hidden",
                textDecoration: "none",
                transition: "border-color 200ms ease",
              }}
              className="whispr-blog-card"
            >
              {/* Featured image */}
              <div
                style={{
                  height: "320px",
                  background: featured.image
                    ? `url(${featured.image}) center/cover`
                    : "linear-gradient(180deg, #1e1e20 0%, #111113 100%)",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "50%",
                    background: "linear-gradient(to top, var(--smoke), transparent)",
                  }}
                />
              </div>

              {/* Content */}
              <div style={{ padding: "24px 28px 28px" }}>
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 600,
                    fontSize: "clamp(20px, 3vw, 28px)",
                    color: "var(--paper)",
                    marginBottom: "10px",
                    lineHeight: 1.3,
                  }}
                >
                  {featured.title}
                </h2>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "15px",
                    color: "var(--whisper-gray)",
                    marginBottom: "16px",
                    lineHeight: 1.6,
                  }}
                >
                  {featured.excerpt}
                </p>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--copper)" }}>
                  {featured.readTime}
                </p>
              </div>
            </Link>
          </motion.div>

          {/* Grid */}
          <div
            className="grid grid-cols-1 md:grid-cols-2"
            style={{ gap: "24px" }}
          >
            {grid.map((read, i) => (
              <motion.div
                key={read.slug}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.1, ease: "easeOut" }}
              >
                <Link
                  href={`/reads/${read.slug}`}
                  style={{
                    display: "block",
                    background: "var(--smoke)",
                    border: "1px solid var(--concrete)",
                    borderRadius: "8px",
                    overflow: "hidden",
                    textDecoration: "none",
                    transition: "border-color 200ms ease",
                    height: "100%",
                  }}
                  className="whispr-blog-card"
                >
                  <div
                    style={{
                      height: "200px",
                      background: read.image
                        ? `url(${read.image}) center/cover`
                        : "linear-gradient(180deg, #1e1e20 0%, #111113 100%)",
                    }}
                  />
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
                        marginBottom: "14px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {read.excerpt}
                    </p>
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--copper)" }}>
                      {read.readTime}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .whispr-blog-card:hover { border-color: var(--copper) !important; }
      `}</style>
    </SiteLayout>
  );
}
