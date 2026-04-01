"use client";

import { motion } from "framer-motion";
import { Eye, Shield } from "lucide-react";
import type { Persona } from "../context/types";

interface ContextBannerProps {
  persona: Persona;
}

export function ContextBanner({ persona }: ContextBannerProps) {
  if (!persona) return null;

  const isAttendee = persona === "attendee";

  return (
    <motion.div
      initial={{ opacity: 0, y: -40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-[999] flex items-center justify-center gap-2 px-4"
      style={{
        height: 40,
        background: isAttendee
          ? "linear-gradient(to right, rgba(212,165,116,0.08), rgba(212,165,116,0))"
          : "#111111",
        borderLeft: !isAttendee ? "2px solid #D4A574" : undefined,
      }}
    >
      {isAttendee ? (
        <Eye className="w-3.5 h-3.5 text-[#CCC]" />
      ) : (
        <Shield className="w-3.5 h-3.5 text-[#CCC]" />
      )}
      <span className="text-[13px] text-[#CCC]" style={{ fontFamily: "system-ui" }}>
        {isAttendee
          ? "You\u2019re viewing Whispr as an attendee"
          : "You\u2019re managing Whispr Demo Night"}
      </span>
    </motion.div>
  );
}
