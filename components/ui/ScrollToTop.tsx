"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 2);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          onClick={scrollToTop}
          aria-label="Scroll to top"
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 40,
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: "var(--smoke)",
            border: "1px solid var(--concrete)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "border-color 200ms ease",
          }}
          className="scroll-top-btn"
        >
          {/* Chevron up */}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M2 9.5L7 4.5L12 9.5"
              stroke="var(--copper)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.button>
      )}
      <style>{`
        .scroll-top-btn:hover { border-color: var(--copper) !important; }
      `}</style>
    </AnimatePresence>
  );
}
