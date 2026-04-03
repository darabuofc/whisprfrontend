"use client";

import Link from "next/link";

const FOOTER_LINKS = [
  { label: "Instagram", href: "https://instagram.com/whisprglobal" },
  { label: "WhatsApp", href: "https://wa.me/923000000000" },
  { label: "Sign In", href: "/auth" },
  { label: "Organize", href: "/organize" },
];

const LEGAL_LINKS = [
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Refund Policy", href: "/refund" },
  { label: "Cancellation Policy", href: "/cancellation" },
];

export default function Footer() {
  return (
    <footer
      style={{
        background: "var(--void)",
        borderTop: "1px solid var(--concrete)",
        paddingTop: "80px",
        paddingBottom: "40px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 24px",
        }}
      >
        {/* Main row */}
        <div
          className="flex flex-col md:flex-row md:justify-between"
          style={{ gap: "48px", marginBottom: "48px" }}
        >
          {/* Left — brand */}
          <div style={{ maxWidth: "320px" }}>
            <Link
              href="/"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "32px",
                letterSpacing: "0.1em",
                color: "var(--paper)",
                textDecoration: "none",
                display: "block",
                marginBottom: "12px",
                textTransform: "uppercase",
              }}
            >
              WHISPR
            </Link>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "14px",
                color: "var(--whisper-gray)",
                marginBottom: "8px",
                lineHeight: 1.5,
              }}
            >
              The architecture of a night out.
            </p>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "13px",
                color: "var(--concrete)",
              }}
            >
              Events by MKhan.
            </p>
          </div>

          {/* Right — links */}
          <div className="flex flex-col sm:flex-row" style={{ gap: "48px" }}>
            <nav style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {FOOTER_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "14px",
                    color: "var(--whisper-gray)",
                    textDecoration: "none",
                    transition: "color 200ms ease",
                  }}
                  className="whispr-footer-link"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <nav style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--concrete)",
                  marginBottom: "2px",
                }}
              >
                Legal
              </p>
              {LEGAL_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "14px",
                    color: "var(--whisper-gray)",
                    textDecoration: "none",
                    transition: "color 200ms ease",
                  }}
                  className="whispr-footer-link"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Bottom strip */}
        <div
          style={{
            borderTop: "1px solid var(--concrete)",
            paddingTop: "24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", justifyContent: "center" }}>
            {LEGAL_LINKS.map((link, i) => (
              <span key={link.label} style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                <Link
                  href={link.href}
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "11px",
                    color: "var(--concrete)",
                    textDecoration: "none",
                    transition: "color 200ms ease",
                  }}
                  className="whispr-footer-link"
                >
                  {link.label}
                </Link>
                {i < LEGAL_LINKS.length - 1 && (
                  <span style={{ color: "var(--concrete)", fontSize: "11px" }}>·</span>
                )}
              </span>
            ))}
          </div>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "12px",
              color: "var(--concrete)",
            }}
          >
            © 2026 Whispr. Karachi, Pakistan.
          </p>
        </div>
      </div>

      <style>{`
        .whispr-footer-link:hover { color: var(--copper) !important; }
      `}</style>
    </footer>
  );
}
