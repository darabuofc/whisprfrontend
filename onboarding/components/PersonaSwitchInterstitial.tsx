"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";

interface PersonaSwitchInterstitialProps {
  onComplete: () => void;
}

export function PersonaSwitchInterstitial({
  onComplete,
}: PersonaSwitchInterstitialProps) {
  // Auto-dismiss after 2.5s
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[2000] flex flex-col items-center justify-center"
      style={{ background: "#0A0A0A" }}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Primary text */}
      <motion.p
        className="text-[28px] text-white text-center max-w-[520px] px-6 font-semibold tracking-tight"
        style={{ fontFamily: "var(--font-display-org, 'Space Grotesk', sans-serif)" }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        Now let&apos;s see what it looks like from behind the curtain
      </motion.p>

      {/* Subtext */}
      <motion.p
        className="text-[14px] text-[#666] mt-4"
        style={{ fontFamily: "system-ui" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        Switching to organizer view...
      </motion.p>

      {/* Fade out the entire screen */}
      <motion.div
        className="absolute inset-0 bg-[#0A0A0A]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 2.0 }}
      />
    </motion.div>
  );
}
