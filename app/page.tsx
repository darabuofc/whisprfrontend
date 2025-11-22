"use client";

import Orb from "@/components/Orb";
import { motion } from "framer-motion";

export default function WhisprHero() {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-gradient-to-b from-[#050505] via-[#0a0a0a] to-black text-center px-6">
      {/* --- ORB BACKGROUND --- */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.6, scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute w-[120vw] h-[120vw] max-w-[900px] max-h-[900px] flex items-center justify-center -z-0"
      >
        <Orb
          hoverIntensity={1.4}
          rotateOnHover={true}
          hue={90}
          forceHoverState={true}
        />
      </motion.div>

      {/* --- HEADLINE --- */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-tight"
        style={{ textShadow: "0 0 15px rgba(193,255,114,0.3)" }}
      >
        <span className="text-white">Access the</span>{" "}
        <motion.span
          className="bg-gradient-to-r from-lime-300 via-lime-200 to-lime-400 bg-clip-text text-transparent"
          animate={{ textShadow: ["0 0 25px #C1FF72", "0 0 50px #C1FF72", "0 0 25px #C1FF72"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          underground.
        </motion.span>
      </motion.h1>

      {/* --- SUBHEADLINE --- */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.4 }}
        className="relative z-10 max-w-xl text-gray-300/90 mt-4 text-lg leading-relaxed"
      >
Discover, host, and live the underground.      </motion.p>

      {/* --- CTAs --- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="relative z-10 flex gap-4 mt-10"
      >
        <a
          href="/auth?role=attendee"
          className="bg-lime-400 text-black font-medium px-8 py-3 rounded-full shadow-[0_0_25px_#C1FF72]/30 hover:scale-105 transition-transform duration-300"
        >
          For Attendees →
        </a>
        <a
          href="/auth?role=organizer"
          className="border border-lime-400 text-lime-400 hover:bg-lime-400 hover:text-black font-medium px-8 py-3 rounded-full transition-all duration-300"
        >
          For Organizers →
        </a>
      </motion.div>

      {/* --- SCROLL CUE --- */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 2 }}
        className="absolute bottom-8 text-gray-500/50 z-10"
      >
        <motion.span className="block text-sm tracking-widest">SCROLL</motion.span>
        <motion.div className="w-[1px] h-6 bg-gray-500/50 mx-auto mt-1 rounded-full" />
      </motion.div>
    </section>
  );
}