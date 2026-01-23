"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [accentColor, setAccentColor] = useState("#c1ff72");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // detect scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // read accent from CSS var
  useEffect(() => {
    if (typeof window !== "undefined") {
      const accent = getComputedStyle(document.documentElement)
        .getPropertyValue("--accent")
        ?.trim();
      setAccentColor(accent || "#c1ff72");
    }
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 z-50 flex w-full justify-center px-4 md:px-6"
    >
      {/* Floating pill */}
      <div
        className={`relative flex w-full max-w-5xl items-center justify-between rounded-full border px-5 py-2.5 md:px-8 transition-all duration-500
          ${scrolled
            ? "border-white/10 bg-black/40 backdrop-blur-xl shadow-[0_0_20px_-4px_rgba(0,0,0,0.6)]"
            : "border-white/10 bg-black/20 backdrop-blur-md"
          }`}
        style={{
          boxShadow: scrolled ? `0 0 12px -3px ${accentColor}50` : "none",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div
            className="grid h-8 w-8 place-items-center rounded-lg border border-white/15 bg-white/5 font-semibold text-[color:var(--accent)]"
            style={{ boxShadow: `0 0 6px -1px ${accentColor}90` }}
          >
            W
          </div>
          <span className="font-semibold text-white tracking-wide">Whispr</span>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/80">
          <a href="#" className="hover:text-white transition-colors">Discover</a>
          <a href="#" className="hover:text-white transition-colors">Events</a>
          <a href="#" className="hover:text-white transition-colors">Partners</a>
          <a href="#" className="hover:text-white transition-colors">Support</a>
          <button
            className="rounded-full bg-[color:var(--accent)] px-4 py-1.5 text-black font-semibold hover:brightness-95 active:translate-y-[1px] transition"
          >
            Sign In
          </button>
        </nav>

        {/* Mobile toggle */}
        <button
          onClick={() => setMenuOpen((p) => !p)}
          className="md:hidden rounded-lg border border-white/10 p-2 text-white/70 hover:text-white transition"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        {/* Mobile drawer */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="absolute top-full right-0 mt-3 w-56 rounded-2xl border border-white/10 bg-black/60 p-4 backdrop-blur-xl md:hidden"
            >
              <div className="flex flex-col gap-3 text-sm font-medium text-white/80">
                <a href="#" onClick={() => setMenuOpen(false)}>Discover</a>
                <a href="#" onClick={() => setMenuOpen(false)}>Events</a>
                <a href="#" onClick={() => setMenuOpen(false)}>Partners</a>
                <a href="#" onClick={() => setMenuOpen(false)}>Support</a>
                <button
                  className="mt-2 rounded-full bg-[color:var(--accent)] px-4 py-1.5 text-black font-semibold hover:brightness-95 active:translate-y-[1px] transition"
                >
                  Sign In
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
