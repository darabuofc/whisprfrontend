"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle } from "lucide-react";

interface NotificationPreviewCardProps {
  visible: boolean;
  type: "approved" | "rejected";
  attendeeName: string;
  onDismiss: () => void;
}

const MESSAGES = {
  approved: (name: string) =>
    `Hi ${name}! Great news \u2014 your application has been approved. You\u2019re on the list! Check your ticket details below.`,
  rejected: (name: string) =>
    `Hi ${name}, thanks for applying. Unfortunately, we weren\u2019t able to approve your application this time. We hope to see you at a future event.`,
};

export function NotificationPreviewCard({
  visible,
  type,
  attendeeName,
  onDismiss,
}: NotificationPreviewCardProps) {
  // Auto-dismiss after 4s
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [visible, onDismiss]);

  const borderColor = type === "approved" ? "rgba(34,197,94,0.4)" : "rgba(239,68,68,0.4)";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed z-[998] cursor-pointer rounded-lg border border-[#333] overflow-hidden"
          style={{
            right: 24,
            bottom: 120,
            width: 320,
            background: "#1A1A1A",
            borderLeft: `3px solid ${borderColor}`,
          }}
          onClick={onDismiss}
        >
          {/* Header */}
          <div className="flex items-center gap-2 px-4 pt-3 pb-2">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: "#25D366" }}
            >
              <MessageCircle className="w-3 h-3 text-white" />
            </div>
            <span className="text-[12px] text-[#999]">
              This attendee just received this:
            </span>
          </div>

          {/* Message bubble */}
          <div className="px-4 pb-4">
            <div
              className="rounded-lg p-3 text-[13px] text-[#E0E0E0] leading-relaxed"
              style={{
                background: "rgba(255,255,255,0.05)",
              }}
            >
              {MESSAGES[type](attendeeName)}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
