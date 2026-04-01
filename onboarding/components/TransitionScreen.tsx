"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";

interface TransitionScreenProps {
  title: string;
  subtitle?: string;
  /** Duration in ms before auto-advancing. Omit for user-paced. */
  autoAdvanceMs?: number;
  /** CTA button label. Only shown when autoAdvanceMs is not set. */
  ctaLabel?: string;
  /** Whether to show the pulsing loading indicator */
  showPulse?: boolean;
  onAdvance: () => void;
}

export function TransitionScreen({
  title,
  subtitle,
  autoAdvanceMs,
  ctaLabel,
  showPulse = false,
  onAdvance,
}: TransitionScreenProps) {
  // Auto-advance timer
  useEffect(() => {
    if (!autoAdvanceMs) return;
    const timer = setTimeout(onAdvance, autoAdvanceMs);
    return () => clearTimeout(timer);
  }, [autoAdvanceMs, onAdvance]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center min-h-[60vh] px-6"
      style={{ background: "#0A0A0A" }}
    >
      {/* Primary text */}
      <motion.p
        className="text-[20px] text-white text-center max-w-[480px] font-semibold tracking-tight"
        style={{ fontFamily: "var(--font-display-org, 'Space Grotesk', sans-serif)" }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {title}
      </motion.p>

      {/* Subtitle */}
      {subtitle && (
        <motion.p
          className="text-[13px] text-[#666] text-center mt-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          {subtitle}
        </motion.p>
      )}

      {/* Pulsing indicator */}
      {showPulse && (
        <motion.div
          className="mt-6 w-8 h-1 rounded-full"
          style={{ background: "#D4A574" }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* CTA button (only for user-paced screens) */}
      {!autoAdvanceMs && ctaLabel && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          onClick={onAdvance}
          className="mt-8 px-6 py-2.5 rounded-full text-[13px] font-medium text-[#111] transition-opacity hover:opacity-90"
          style={{ background: "#D4A574" }}
        >
          {ctaLabel}
        </motion.button>
      )}
    </motion.div>
  );
}
