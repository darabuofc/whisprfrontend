"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { XCircle } from "lucide-react";

interface EventContext {
  eventName: string;
  eventSlug: string;
  eventDate: string;
  eventLocation: string;
}

export default function PaymentCancelPage() {
  return (
    <Suspense>
      <PaymentCancelContent />
    </Suspense>
  );
}

function PaymentCancelContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registrationId = searchParams.get("reg");
  const [eventContext, setEventContext] = useState<EventContext | null>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("whispr_payment_context");
      if (stored) {
        setEventContext(JSON.parse(stored));
      }
    } catch {
      // sessionStorage may not be available
    }
  }, []);

  const handleTryAgain = () => {
    if (eventContext?.eventSlug) {
      router.push(`/attendees/events/${eventContext.eventSlug}`);
    } else {
      router.push("/attendees/dashboard");
    }
  };

  const handleBackToEvent = () => {
    if (eventContext?.eventSlug) {
      router.push(`/attendees/events/${eventContext.eventSlug}`);
    } else {
      router.push("/attendees/dashboard");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0A0A0A] text-white">
      {/* Background glows */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/5 h-[55vh] w-[70vw] rounded-full blur-[160px] bg-[radial-gradient(circle_at_30%_30%,rgba(44,44,46,0.25),transparent_55%)]" />
        <div className="absolute -right-1/4 bottom-[-10%] h-[60vh] w-[70vw] rounded-full blur-[180px] bg-[radial-gradient(circle_at_70%_60%,rgba(212,165,116,0.3),transparent_60%)]" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-6 text-center max-w-sm"
        >
          <div className="w-16 h-16 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
            <XCircle size={28} className="text-white/40" />
          </div>
          <div>
            <h1
              className="text-xl font-semibold text-white mb-2"
              style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
            >
              Payment not completed.
            </h1>
            <p className="text-sm text-white/40 leading-relaxed">
              Your spot is still reserved. You can pay any time before your deadline.
            </p>
          </div>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            {registrationId && (
              <button
                onClick={handleTryAgain}
                className="w-full py-3 rounded-xl bg-[#D4A574] text-[#0A0A0A] font-semibold text-sm hover:bg-[#B8785C] transition-all"
                style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
              >
                Try Again
              </button>
            )}
            <button
              onClick={handleBackToEvent}
              className="text-sm text-white/40 hover:text-white/60 transition-colors"
            >
              Back to Event
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
