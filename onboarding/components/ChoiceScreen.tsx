"use client";

import { motion } from "framer-motion";

interface ChoiceScreenProps {
  onGuided: () => void;
  onSkip: () => void;
}

export function ChoiceScreen({ onGuided, onSkip }: ChoiceScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex items-center justify-center min-h-[60vh] px-6"
    >
      <div className="w-full max-w-[600px] text-center">
        <h2
          className="text-[24px] text-white font-semibold tracking-tight"
          style={{ fontFamily: "var(--font-display-org, 'Space Grotesk', sans-serif)" }}
        >
          Ready to create your first event?
        </h2>

        <p className="text-[14px] text-[#999] mt-3">
          We can walk you through it, or you can explore on your own.
        </p>

        <div className="mt-8 space-y-4">
          {/* Option A: Guided */}
          <button
            onClick={onGuided}
            className="w-full py-3.5 rounded-lg text-[14px] font-medium text-[#111] transition-opacity hover:opacity-90"
            style={{ background: "#D4A574" }}
          >
            Yes, guide me through it
          </button>

          {/* Option B: Skip */}
          <button
            onClick={onSkip}
            className="w-full py-3.5 rounded-lg text-[14px] text-[#CCC] border border-[#666] transition-colors hover:border-[#999] hover:text-white"
            style={{ background: "transparent" }}
          >
            Not yet &mdash; let me explore
          </button>
        </div>
      </div>
    </motion.div>
  );
}
