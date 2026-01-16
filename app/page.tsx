"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";

// Animated W Mark Component - uses actual Whispr logo
function WhisprMark({ onAnimationComplete }: { onAnimationComplete: () => void }) {
  const strokeControls = useAnimation();
  const fillControls = useAnimation();
  const [isDrawn, setIsDrawn] = useState(false);

  // Actual Whispr W path from icon.svg
  const wPath = "M16 18.5h6.2l5.4 20.6h0.1l5.1-14.6h3.4l5.3 14.6h0.1l5-20.6H52l-6.5 27h-4.9l-5.3-14.2h-0.1L29 45.5h-4.9z";

  useEffect(() => {
    // Sequence: draw outline, then fill
    const animate = async () => {
      // Draw the stroke outline
      await strokeControls.start({
        strokeDashoffset: 0,
        transition: {
          duration: 1.6,
          ease: [0.65, 0, 0.35, 1],
        },
      });

      // Fade in the fill and fade out stroke
      await Promise.all([
        fillControls.start({
          opacity: 1,
          transition: { duration: 0.5, ease: "easeOut" },
        }),
        strokeControls.start({
          opacity: 0,
          transition: { duration: 0.5, ease: "easeOut" },
        }),
      ]);

      setIsDrawn(true);
      onAnimationComplete();
    };

    animate();
  }, [strokeControls, fillControls, onAnimationComplete]);

  return (
    <motion.svg
      width="100"
      height="100"
      viewBox="0 0 64 64"
      fill="none"
      className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28"
    >
      <defs>
        <linearGradient id="wGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c1ff72" />
          <stop offset="100%" stopColor="#b472ff" />
        </linearGradient>
        <linearGradient id="wGradientGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c1ff72" />
          <stop offset="100%" stopColor="#b472ff" />
        </linearGradient>
      </defs>

      {/* Stroke outline - draws first */}
      <motion.path
        d={wPath}
        stroke="url(#wGradient)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ strokeDasharray: 200, strokeDashoffset: 200, opacity: 1 }}
        animate={strokeControls}
      />

      {/* Filled W - fades in after stroke */}
      <motion.path
        d={wPath}
        fill="url(#wGradient)"
        initial={{ opacity: 0 }}
        animate={fillControls}
      />

      {/* Breathing glow effect after animation completes */}
      {isDrawn && (
        <motion.path
          d={wPath}
          fill="url(#wGradientGlow)"
          initial={{ opacity: 0, filter: "blur(0px)" }}
          animate={{
            opacity: [0.2, 0.4, 0.2],
            filter: ["blur(6px)", "blur(12px)", "blur(6px)"],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
    </motion.svg>
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
    <section className="fixed inset-0 flex items-center justify-center overflow-hidden bg-[#0a0a0a]">
      {/* Subtle radial gradient for depth */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(193,255,0,0.015),transparent_70%)]" />

      {/* Grain overlay */}
      <GrainOverlay />

      {/* Main content - centered vertical stack */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6">

        {/* Animated W Mark */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <WhisprMark onAnimationComplete={() => setShowContent(true)} />
        </motion.div>

        {/* Brand name */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 10 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-4xl sm:text-5xl md:text-6xl font-light tracking-[0.2em] text-white lowercase mb-4"
        >
          whispr
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 10 }}
          transition={{ duration: 0.8, delay: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-base sm:text-lg text-white/50 tracking-[0.15em] lowercase mb-12"
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
            className="group relative px-8 py-3 text-sm tracking-[0.15em] uppercase text-black bg-[#c1ff00] transition-all duration-300 hover:bg-[#d4ff4d] hover:shadow-[0_0_30px_rgba(193,255,0,0.4)]"
          >
            Explore Events
          </a>

          <a
            href="/auth?role=organizer"
            className="group relative px-8 py-3 text-sm tracking-[0.15em] uppercase text-white/80 border border-white/20 transition-all duration-300 hover:border-[#c1ff00]/50 hover:text-[#c1ff00]"
          >
            Organize an Event
          </a>
        </motion.div>
      </div>
    </section>
  );
}
