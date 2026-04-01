"use client";

import { use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import SiteLayout from "@/components/layout/SiteLayout";

// ─── Mock data (replace with API call using slug) ─────────────────────────────

const MOCK_ARTICLE = {
  title: "The Architecture of Entry",
  readTime: "4 min read",
  date: "March 2026",
  author: "Saad",
  image: null,
  body: [
    {
      type: "paragraph",
      text: "A door is not a neutral object. It communicates something before anyone decides to open it — about what's inside, about who's expected, about whether you belong.",
    },
    {
      type: "paragraph",
      text: "The best rooms understand this. The worst ones don't. And the difference shows up not in the music or the lighting or the crowd, but in the moment before entry — in the design of the threshold.",
    },
    {
      type: "subheading",
      text: "The threshold as intention.",
    },
    {
      type: "paragraph",
      text: "When you graft a name onto a guest list, you're making an editorial decision. You're saying: this room is not for everyone, and that is precisely what makes it worth being in.",
    },
    {
      type: "pullquote",
      text: "Scarcity is not exclusion. It's design.",
    },
    {
      type: "paragraph",
      text: "Infrastructure follows intention. The tools you use to manage entry communicate your values just as clearly as the music you book or the room you choose.",
    },
    {
      type: "subheading",
      text: "What Whispr is for.",
    },
    {
      type: "paragraph",
      text: "We built Whispr because the tools organizers were using — spreadsheets, WhatsApp groups, Instagram DMs — were not designed for the intent they were serving. Managing a curated room with a grocery list app is a mismatch. It produces friction. It degrades the experience before the first person walks in.",
    },
    {
      type: "paragraph",
      text: "The architecture of a night out begins at the door. Design it accordingly.",
    },
  ],
};

const RELATED = [
  {
    slug: "guestlist-as-design",
    title: "The Guest List as Design Tool",
    readTime: "6 min read",
    image: null,
  },
  {
    slug: "sound-before-crowd",
    title: "Sound Before Crowd",
    readTime: "5 min read",
    image: null,
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReadDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  // In production: fetch article by slug from /api/reads/:slug
  const article = { ...MOCK_ARTICLE, slug };

  return (
    <SiteLayout>
      <div style={{ minHeight: "100vh", background: "var(--void)", paddingBottom: "80px" }}>
        <div style={{ maxWidth: "720px", margin: "0 auto", padding: "80px 24px 0", textAlign: "center" }}>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "clamp(28px, 5vw, 48px)",
              color: "var(--paper)",
              lineHeight: 1.2,
              letterSpacing: "0.02em",
              marginBottom: "20px",
            }}
          >
            {article.title}
          </motion.h1>

          {/* Meta */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "13px",
              color: "var(--copper)",
              marginBottom: article.author ? "8px" : "40px",
            }}
          >
            {article.readTime} · {article.date}
          </motion.p>

          {article.author && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.25, ease: "easeOut" }}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "14px",
                color: "var(--whisper-gray)",
                marginBottom: "40px",
              }}
            >
              {article.author}
            </motion.p>
          )}
        </div>

        {/* Feature image */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          style={{
            maxWidth: "1200px",
            margin: "0 auto 60px",
            padding: "0 24px",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "clamp(200px, 35vw, 400px)",
              background: article.image
                ? `url(${article.image}) center/cover`
                : "linear-gradient(180deg, #1e1e20 0%, #111113 100%)",
              borderRadius: "8px",
            }}
          />
        </motion.div>

        {/* Article body */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35, ease: "easeOut" }}
          style={{ maxWidth: "680px", margin: "0 auto", padding: "0 24px" }}
        >
          {article.body.map((block, i) => {
            if (block.type === "paragraph") {
              return (
                <p
                  key={i}
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "17px",
                    color: "var(--paper)",
                    lineHeight: 1.7,
                    marginBottom: "24px",
                  }}
                >
                  {block.text}
                </p>
              );
            }
            if (block.type === "subheading") {
              return (
                <h2
                  key={i}
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 600,
                    fontSize: "24px",
                    color: "var(--paper)",
                    marginTop: "48px",
                    marginBottom: "20px",
                    letterSpacing: "0.01em",
                  }}
                >
                  {block.text}
                </h2>
              );
            }
            if (block.type === "pullquote") {
              return (
                <blockquote
                  key={i}
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "22px",
                    color: "var(--copper)",
                    textAlign: "center",
                    padding: "80px 0",
                    margin: 0,
                    borderLeft: "none",
                    position: "relative",
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      width: "2px",
                      height: "100%",
                      background: "var(--copper)",
                      position: "absolute",
                      left: 0,
                      top: 0,
                      opacity: 0.6,
                    }}
                  />
                  {block.text}
                </blockquote>
              );
            }
            return null;
          })}

          {/* End rule */}
          <div
            style={{
              borderTop: "1px solid var(--concrete)",
              marginTop: "48px",
              marginBottom: "48px",
            }}
          />

          {/* Share */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "56px" }}>
            <button
              onClick={() => {
                if (typeof navigator !== "undefined" && navigator.share) {
                  navigator.share({ title: article.title, url: window.location.href });
                }
              }}
              style={{
                background: "none",
                border: "1px solid var(--concrete)",
                borderRadius: "6px",
                padding: "8px 16px",
                cursor: "pointer",
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                color: "var(--whisper-gray)",
                transition: "border-color 200ms ease, color 200ms ease",
              }}
              className="whispr-share-btn"
            >
              Share
            </button>
          </div>

          {/* More from the inside */}
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "20px",
              color: "var(--paper)",
              marginBottom: "24px",
            }}
          >
            More from the inside.
          </p>

          <div
            className="grid grid-cols-1 md:grid-cols-2"
            style={{ gap: "24px" }}
          >
            {RELATED.map((r) => (
              <Link
                key={r.slug}
                href={`/reads/${r.slug}`}
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
                <div
                  style={{
                    height: "160px",
                    background: r.image
                      ? `url(${r.image}) center/cover`
                      : "linear-gradient(180deg, #1e1e20 0%, #111113 100%)",
                  }}
                />
                <div style={{ padding: "16px" }}>
                  <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "16px", color: "var(--paper)", marginBottom: "8px" }}>
                    {r.title}
                  </p>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--copper)" }}>
                    {r.readTime}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      <style>{`
        .whispr-blog-card:hover { border-color: var(--copper) !important; }
        .whispr-share-btn:hover { border-color: var(--copper) !important; color: var(--copper) !important; }
      `}</style>
    </SiteLayout>
  );
}
