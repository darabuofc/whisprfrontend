"use client";

import Orb from "@/components/Orb";
import { motion } from "framer-motion";

export default function WhisprHero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#040404] text-white">
      {/* --- BACKGROUND ORB --- */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.55, scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div className="relative h-[120vw] w-[120vw] max-h-[950px] max-w-[950px]">
          <Orb hoverIntensity={1.6} rotateOnHover={true} hue={90} forceHoverState={true} />
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(193,255,114,0.14),transparent_55%)]" />
        </div>
      </motion.div>

      {/* --- OVERLAY GRADIENTS --- */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-30%] top-[-10%] h-[40vh] w-[60vw] rotate-12 bg-[radial-gradient(circle_at_30%_30%,rgba(180,114,255,0.35),transparent_60%)] blur-3xl opacity-70" />
        <div className="absolute right-[-25%] bottom-[-5%] h-[45vh] w-[55vw] bg-[radial-gradient(circle_at_60%_60%,rgba(193,255,114,0.35),transparent_60%)] blur-3xl opacity-70" />
        <div className="absolute inset-0 bg-[radial-gradient(50%_50%_at_50%_50%,rgba(255,255,255,0.04),transparent_60%)]" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-12 px-6 pb-16 pt-20 sm:pt-24 lg:flex-row lg:items-center lg:gap-16 lg:pt-28">
        {/* LEFT COPY */}
        <div className="flex-1 space-y-6 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/70 shadow-[0_0_30px_rgba(193,255,114,0.15)] backdrop-blur"
          >
            Now onboarding select curators
            <span className="h-2 w-2 rounded-full bg-lime-300 shadow-[0_0_12px_#C1FF72]" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1 }}
            className="text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl"
            style={{ textShadow: "0 0 20px rgba(193,255,114,0.25)" }}
          >
            Access the underground without the chaos.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="max-w-xl text-lg leading-relaxed text-white/75 sm:text-xl sm:leading-8 lg:max-w-2xl"
          >
            Whispr bridges the rooms people whisper about—guest lists, payouts, and seamless check-ins
            that feel premium for both attendees and organizers.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.35 }}
            className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4"
          >
            <a
              href="/auth?role=attendee"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-lime-400 px-8 py-3 text-base font-semibold text-black shadow-[0_15px_45px_-15px_rgba(193,255,114,0.7)] transition-transform duration-300 hover:scale-[1.03]"
            >
              For Attendees →
            </a>
            <a
              href="/auth?role=organizer"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-lime-400 px-8 py-3 text-base font-semibold text-lime-300 transition-all duration-300 hover:bg-lime-300 hover:text-black"
            >
              For Organizers →
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="grid gap-4 sm:grid-cols-2 sm:gap-5"
          >
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <p className="text-sm uppercase tracking-[0.2em] text-white/50">For Hosts</p>
              <p className="mt-2 text-base text-white/80">Built-in fraud checks, instant guest list edits, and cashless payouts.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <p className="text-sm uppercase tracking-[0.2em] text-white/50">For Guests</p>
              <p className="mt-2 text-base text-white/80">One tap entries, live ticket wallets, and curated drops before anyone else.</p>
            </div>
          </motion.div>
        </div>

        {/* RIGHT CARD STACK */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.45 }}
          className="flex-1"
        >
          <div className="relative mx-auto w-full max-w-[420px]">
            <div className="absolute -left-8 -top-8 h-24 w-24 rounded-3xl bg-[linear-gradient(135deg,rgba(193,255,114,0.5),rgba(180,114,255,0.4))] blur-3xl opacity-60" />
            <div className="absolute -right-10 bottom-10 h-28 w-28 rounded-3xl bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(193,255,114,0.35))] blur-3xl opacity-70" />

            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_25px_120px_-30px_rgba(0,0,0,0.75)]">
              <div className="border-b border-white/10 px-6 py-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-white/50">Tonight</p>
                    <p className="text-xl font-semibold">After Hours: Neon Vault</p>
                  </div>
                  <span className="rounded-full bg-lime-300/20 px-3 py-1 text-xs font-semibold text-lime-200">
                    92% full
                  </span>
                </div>
                <p className="mt-2 text-sm text-white/60">Brooklyn · 11:30 PM · QR + Face ID</p>
              </div>

              <div className="grid grid-cols-2 gap-3 px-6 py-5">
                <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/50">Live Check-ins</p>
                  <p className="mt-2 text-3xl font-semibold text-white">
                    184<span className="text-sm text-lime-200"> / 220</span>
                  </p>
                  <p className="text-xs text-lime-200/80">+32 in last 10 min</p>
                </div>
                <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/50">Fraud Block</p>
                  <p className="mt-2 text-3xl font-semibold text-white">7</p>
                  <p className="text-xs text-red-200/80">Flagged & stopped</p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-white/10 px-6 py-4 text-sm text-white/70">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-lime-300 shadow-[0_0_10px_#C1FF72]" />
                  Real-time sync to wallets
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/60">
                  Secure
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
