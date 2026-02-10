"use client";

import Image from "next/image";

export default function MaintenancePage() {
  return (
    <section className="fixed inset-0 flex items-center justify-center overflow-hidden bg-[#0a0a0a]">
      {/* Subtle radial gradient for depth */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(193,255,0,0.015),transparent_70%)]" />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center max-w-lg">
        {/* Logo */}
        <div className="relative mb-8">
          <div
            className="absolute inset-0 rounded-full animate-pulse-glow"
            style={{
              background:
                "radial-gradient(circle, rgba(193,255,0,0.3) 0%, transparent 70%)",
              filter: "blur(20px)",
            }}
          />
          <Image
            src="/logo.png"
            alt="Whispr"
            width={100}
            height={100}
            className="w-20 h-20 sm:w-24 sm:h-24 relative z-10 drop-shadow-[0_0_30px_rgba(193,255,0,0.3)]"
            priority
          />
        </div>

        {/* Brand name */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-[0.2em] text-white lowercase mb-6">
          whispr
        </h1>

        {/* Divider */}
        <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#c1ff00]/40 to-transparent mb-8" />

        {/* Maintenance message */}
        <h2 className="text-xl sm:text-2xl font-light text-white/90 mb-4 tracking-wide">
          OOPS! Our service is down
        </h2>

        <p className="text-sm sm:text-base text-white/50 leading-relaxed tracking-wide">
          We are working on getting it up.
          <br />
          Thank you for your patience.
        </p>

        {/* Animated status indicator */}
        <div className="mt-10 flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c1ff00]/60 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#c1ff00]/80" />
          </span>
          <span className="text-xs text-white/40 tracking-[0.15em] uppercase">
            Maintenance in progress
          </span>
        </div>
      </div>
    </section>
  );
}
