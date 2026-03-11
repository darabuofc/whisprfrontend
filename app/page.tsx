"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Image from "next/image";

// Animated Logo Component with glow effect
function WhisprLogo({ onAnimationComplete }: { onAnimationComplete: () => void }) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="relative">
      {/* Breathing glow effect behind logo */}
      <motion.div
        className="absolute inset-0 rounded-full"
        initial={{ opacity: 0 }}
        animate={isLoaded ? {
          opacity: [0.4, 0.7, 0.4],
          scale: [1, 1.1, 1],
        } : { opacity: 0 }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          background: "radial-gradient(circle, rgba(212,165,116,0.4) 0%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />

      {/* The logo image */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 1.2,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
        onAnimationComplete={() => {
          setIsLoaded(true);
          onAnimationComplete();
        }}
      >
        <Image
          src="/logo.png"
          alt="Whispr"
          width={120}
          height={120}
          className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 relative z-10 drop-shadow-[0_0_30px_rgba(212,165,116,0.3)]"
          priority
        />
      </motion.div>
    </div>
  );
}

// Subtle animated grain overlay
function GrainOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-20 opacity-[0.03]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat",
      }}
    />
  );
}

export default function WhisprHero() {
  const [showContent, setShowContent] = useState(false);

  return (
    <section className="fixed inset-0 flex items-center justify-center overflow-hidden bg-[#0A0A0A]">
      {/* Subtle radial gradient for depth */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,165,116,0.015),transparent_70%)]" />

      {/* Grain overlay */}
      <GrainOverlay />

      {/* Main content - centered vertical stack */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6">

        {/* Animated Logo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <WhisprLogo onAnimationComplete={() => setShowContent(true)} />
        </motion.div>

        {/* Brand name */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 10 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-4xl sm:text-5xl md:text-6xl tracking-[0.1em] text-[#FAFAFA] uppercase mb-4"
          style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
        >
          WHISPR
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 10 }}
          transition={{ duration: 0.8, delay: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-base sm:text-lg text-[#8E8E93] tracking-[0.15em] lowercase mb-12"
          style={{ fontFamily: "var(--font-body)" }}
        >
          hear the sound.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 10 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <a
            href="/auth?role=attendee"
            className="group relative px-8 py-3 text-sm tracking-[0.15em] uppercase text-[#0A0A0A] bg-[#D4A574] rounded-md transition-all duration-150 hover:bg-[#B8785C] hover:shadow-[0_0_30px_rgba(212,165,116,0.4)]"
            style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
          >
            Explore Events
          </a>

          <a
            href="/auth?role=organizer"
            className="group relative px-8 py-3 text-sm tracking-[0.15em] uppercase text-[#8E8E93] border border-[#2C2C2E] rounded-md transition-all duration-150 hover:border-[#D4A574] hover:text-[#D4A574]"
            style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
          >
            Organize an Event
          </a>
        </motion.div>
      </div>
    </section>
  );
}
