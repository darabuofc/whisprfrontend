"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
  { label: "Events", href: "/events" },
  { label: "Reads", href: "/reads" },
  { label: "Organize", href: "/organize" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close overlay on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center"
        style={{
          height: "64px",
          background: scrolled ? "rgba(28,28,30,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(12px)" : "none",
          transition: "background 300ms ease-out",
        }}
      >
        <div
          className="flex items-center justify-between w-full"
          style={{ maxWidth: "1200px", padding: "0 24px" }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "20px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--paper)",
              textDecoration: "none",
            }}
          >
            WHISPR
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 500,
                    fontSize: "14px",
                    color: active ? "var(--paper)" : "var(--whisper-gray)",
                    textDecoration: "none",
                    position: "relative",
                    paddingBottom: "4px",
                    transition: "color 200ms ease",
                  }}
                  className="whispr-nav-link"
                >
                  {item.label}
                  {active && (
                    <span
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: "2px",
                        background: "var(--copper)",
                        borderRadius: "1px",
                      }}
                    />
                  )}
                </Link>
              );
            })}

            {/* Sign In — JetBrains Mono, intentionally understated */}
            <Link
              href="/auth"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "13px",
                color: isActive("/auth") ? "var(--copper)" : "var(--whisper-gray)",
                textDecoration: "none",
                transition: "color 200ms ease",
              }}
              className="whispr-nav-link"
            >
              Sign In
            </Link>
          </nav>

          {/* Mobile trigger — single thin line */}
          <button
            onClick={() => setMenuOpen(true)}
            className="md:hidden"
            aria-label="Open navigation"
            style={{ background: "none", border: "none", cursor: "pointer", padding: "8px", margin: "-8px" }}
          >
            <span
              style={{
                display: "block",
                width: "24px",
                height: "2px",
                background: "var(--paper)",
              }}
            />
          </button>
        </div>
      </header>

      {/* Mobile full-screen overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 flex flex-col md:hidden"
            style={{
              zIndex: 100,
              background: "rgba(10,10,10,0.98)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            {/* Overlay top bar */}
            <div
              className="flex items-center justify-between"
              style={{ height: "56px", padding: "0 24px", flexShrink: 0 }}
            >
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "20px",
                  letterSpacing: "0.1em",
                  color: "var(--paper)",
                  textTransform: "uppercase",
                }}
              >
                WHISPR
              </span>
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Close navigation"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--paper)",
                  fontSize: "24px",
                  lineHeight: 1,
                  padding: "4px",
                }}
              >
                ×
              </button>
            </div>

            {/* Nav items — vertically centered */}
            <div className="flex flex-col items-center justify-center flex-1" style={{ gap: "48px" }}>
              {NAV_ITEMS.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.3, ease: "easeOut" }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 500,
                      fontSize: "32px",
                      color: "var(--paper)",
                      textDecoration: "none",
                    }}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              {/* Sign In — last, copper, mono */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: NAV_ITEMS.length * 0.08, duration: 0.3, ease: "easeOut" }}
              >
                <Link
                  href="/auth"
                  onClick={() => setMenuOpen(false)}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "18px",
                    color: "var(--copper)",
                    textDecoration: "none",
                  }}
                >
                  Sign In
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .whispr-nav-link:hover { color: var(--copper) !important; }
      `}</style>
    </>
  );
}
