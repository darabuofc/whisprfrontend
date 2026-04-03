"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2, Clock } from "lucide-react";
import { getPaymentStatus } from "@/lib/api";

type Status = "polling" | "confirmed" | "timeout";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registrationId = searchParams.get("reg");

  const [status, setStatus] = useState<Status>("polling");
  const [ticketUrl, setTicketUrl] = useState<string | null>(null);
  const [eventName, setEventName] = useState<string | null>(null);
  const attemptsRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const poll = useCallback(async () => {
    if (!registrationId) return;
    try {
      const data = await getPaymentStatus(registrationId);
      if (data.payment_status?.toLowerCase() === "paid") {
        setStatus("confirmed");
        setTicketUrl(data.ticket_url || null);
        return;
      }
    } catch {
      // Continue polling on error
    }

    attemptsRef.current += 1;
    if (attemptsRef.current >= 15) {
      setStatus("timeout");
      return;
    }

    timerRef.current = setTimeout(poll, 2000);
  }, [registrationId]);

  useEffect(() => {
    if (!registrationId) {
      router.replace("/attendees/dashboard");
      return;
    }
    poll();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [registrationId, poll, router]);

  if (!registrationId) return null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0A0A0A] text-white">
      {/* Background glows */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/5 h-[55vh] w-[70vw] rounded-full blur-[160px] bg-[radial-gradient(circle_at_30%_30%,rgba(44,44,46,0.25),transparent_55%)]" />
        <div className="absolute -right-1/4 bottom-[-10%] h-[60vh] w-[70vw] rounded-full blur-[180px] bg-[radial-gradient(circle_at_70%_60%,rgba(212,165,116,0.3),transparent_60%)]" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <AnimatePresence mode="wait">
          {/* Polling state */}
          {status === "polling" && (
            <motion.div
              key="polling"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center gap-6 text-center max-w-sm"
            >
              <div className="w-16 h-16 rounded-full bg-[#D4A574]/10 border border-[#D4A574]/20 flex items-center justify-center">
                <Loader2 size={28} className="text-[#D4A574] animate-spin" />
              </div>
              <div>
                <h1
                  className="text-xl font-semibold text-white mb-2"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
                >
                  Confirming your payment...
                </h1>
                <p className="text-sm text-white/40">
                  This usually takes just a few seconds.
                </p>
              </div>
            </motion.div>
          )}

          {/* Confirmed state */}
          {status === "confirmed" && (
            <motion.div
              key="confirmed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-6 text-center max-w-sm"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center"
              >
                <CheckCircle2 size={32} className="text-emerald-400" />
              </motion.div>
              <div>
                <h1
                  className="text-xl font-semibold text-white mb-2"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
                >
                  You&apos;re locked in.
                </h1>
                {eventName && (
                  <p className="text-sm text-white/60">{eventName}</p>
                )}
              </div>
              {ticketUrl && (
                <button
                  onClick={() => router.push(ticketUrl)}
                  className="w-full max-w-xs py-3.5 rounded-xl bg-[#D4A574] text-[#0A0A0A] font-semibold text-sm hover:bg-[#B8785C] transition-all"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
                >
                  View Your Ticket
                </button>
              )}
              <button
                onClick={() => router.push("/attendees/dashboard")}
                className="text-sm text-white/40 hover:text-white/60 transition-colors"
              >
                Go to Dashboard
              </button>
              <p className="text-xs text-white/30">
                A confirmation has been sent to your WhatsApp.
              </p>
            </motion.div>
          )}

          {/* Timeout state */}
          {status === "timeout" && (
            <motion.div
              key="timeout"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-6 text-center max-w-sm"
            >
              <div className="w-16 h-16 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                <Clock size={28} className="text-white/40" />
              </div>
              <div>
                <h1
                  className="text-lg font-semibold text-white mb-2"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
                >
                  Payment is being confirmed.
                </h1>
                <p className="text-sm text-white/40 leading-relaxed">
                  This usually takes a few seconds but can occasionally take longer.
                  You&apos;ll receive a WhatsApp confirmation once your ticket is ready.
                </p>
              </div>
              <button
                onClick={() => router.push("/attendees/dashboard")}
                className="px-6 py-3 rounded-xl bg-white/[0.06] border border-white/[0.08] text-sm text-white/70 hover:bg-white/[0.1] transition-all"
              >
                Back to Dashboard
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
