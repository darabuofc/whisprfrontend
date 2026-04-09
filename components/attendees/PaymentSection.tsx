"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, Clock, Banknote, ChevronDown, XCircle } from "lucide-react";
import { getPaymentBreakdown, initiatePayment, type PaymentBreakdown } from "@/lib/api";

interface PaymentSectionProps {
  registrationId: string;
  eventId: string;
  eventName?: string;
  eventSlug?: string;
  eventDate?: string;
  eventLocation?: string;
}

function computeHoursRemaining(deadline: string): number {
  const deadlineMs = new Date(deadline).getTime();
  const nowMs = Date.now();
  return (deadlineMs - nowMs) / (1000 * 60 * 60);
}

function formatTimeRemaining(hoursRemaining: number): { text: string; urgent: boolean; critical: boolean } {
  if (hoursRemaining <= 0) {
    return { text: "Expired", urgent: true, critical: true };
  }
  if (hoursRemaining < 2) {
    const minutes = Math.max(1, Math.round(hoursRemaining * 60));
    return { text: `${minutes} minute${minutes !== 1 ? "s" : ""} remaining — pay now`, urgent: true, critical: true };
  }
  if (hoursRemaining < 24) {
    const hours = Math.floor(hoursRemaining);
    return { text: `${hours} hour${hours !== 1 ? "s" : ""} remaining`, urgent: true, critical: false };
  }
  const days = Math.floor(hoursRemaining / 24);
  const remainingHours = Math.floor(hoursRemaining % 24);
  let text = `${days} day${days !== 1 ? "s" : ""}`;
  if (remainingHours > 0) {
    text += `, ${remainingHours} hour${remainingHours !== 1 ? "s" : ""}`;
  }
  text += " remaining";
  return { text, urgent: false, critical: false };
}

export default function PaymentSection({
  registrationId,
  eventId,
  eventName,
  eventSlug,
  eventDate,
  eventLocation,
}: PaymentSectionProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [breakdown, setBreakdown] = useState<PaymentBreakdown | null>(null);
  const [initiating, setInitiating] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [hoursRemaining, setHoursRemaining] = useState<number | null>(null);
  const [manualExpanded, setManualExpanded] = useState(false);
  const [expired, setExpired] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchBreakdown = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPaymentBreakdown(registrationId);
      setBreakdown(data);

      // Compute initial hours remaining from deadline
      if (data.payment_deadline) {
        const hrs = computeHoursRemaining(data.payment_deadline);
        if (hrs <= 0) {
          setExpired(true);
        } else {
          setHoursRemaining(hrs);
        }
      } else {
        setHoursRemaining(data.hours_remaining);
      }
    } catch (err: any) {
      setError(err.message || "Couldn't load payment details");
    } finally {
      setLoading(false);
    }
  }, [registrationId]);

  useEffect(() => {
    fetchBreakdown();
  }, [fetchBreakdown]);

  // Live countdown — update every 60 seconds
  useEffect(() => {
    if (!breakdown?.payment_deadline) return;

    intervalRef.current = setInterval(() => {
      const hrs = computeHoursRemaining(breakdown.payment_deadline);
      if (hrs <= 0) {
        setExpired(true);
        if (intervalRef.current) clearInterval(intervalRef.current);
      } else {
        setHoursRemaining(hrs);
      }
    }, 60_000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [breakdown?.payment_deadline]);

  const handlePay = async () => {
    if (!breakdown) return;
    setInitiating(true);
    setPayError(null);

    // Store event context for success/cancel pages
    try {
      sessionStorage.setItem(
        "whispr_payment_context",
        JSON.stringify({
          eventName: eventName || "",
          eventSlug: eventSlug || "",
          eventDate: eventDate || "",
          eventLocation: eventLocation || "",
        })
      );
    } catch {
      // sessionStorage may not be available
    }

    try {
      const res = await initiatePayment(registrationId);
      window.location.href = res.checkout_url;
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 409) {
        setPayError("This registration has already been paid.");
        setTimeout(() => window.location.reload(), 1500);
      } else if (status === 410) {
        setExpired(true);
      } else if (status === 502) {
        setPayError("Payment service is temporarily unavailable. Please try again in a few minutes.");
        setInitiating(false);
      } else if (status === 403) {
        setPayError("You don't have access to this registration.");
        setInitiating(false);
      } else {
        setPayError("Something went wrong. Please try again.");
        setInitiating(false);
      }
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#1C1C1E] overflow-hidden">
        <div className="p-5 space-y-4">
          <div className="space-y-2">
            <div className="h-6 w-28 bg-white/5 rounded animate-pulse" />
            <div className="h-4 w-56 bg-white/5 rounded animate-pulse" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <div className="h-4 w-32 bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-20 bg-white/5 rounded animate-pulse" />
            </div>
            <div className="flex justify-between">
              <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-20 bg-white/5 rounded animate-pulse" />
            </div>
            <div className="h-px bg-white/[0.06]" />
            <div className="flex justify-between">
              <div className="h-5 w-16 bg-white/5 rounded animate-pulse" />
              <div className="h-5 w-24 bg-white/5 rounded animate-pulse" />
            </div>
          </div>
          <div className="h-12 bg-white/5 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#1C1C1E] p-5">
        <div className="flex items-center gap-3 text-red-400">
          <AlertCircle size={18} />
          <p className="text-sm">{error}</p>
        </div>
        <button
          onClick={fetchBreakdown}
          className="mt-3 text-sm text-[#D4A574] hover:text-[#B8785C] transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!breakdown) return null;

  // Client-side expiry check
  if (expired) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#1C1C1E] p-5">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center">
            <XCircle size={24} className="text-white/30" />
          </div>
          <div>
            <h3
              className="text-base font-semibold text-white mb-1"
              style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
            >
              Your payment window has expired.
            </h3>
            <p className="text-sm text-white/40">
              Your spot{eventName ? ` for ${eventName}` : ""} has been released.
            </p>
          </div>
          <button
            onClick={() => router.push("/attendees/dashboard")}
            className="px-6 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-sm text-white/70 hover:bg-white/[0.1] transition-all"
          >
            Browse Events
          </button>
        </div>
      </div>
    );
  }

  const timeInfo = hoursRemaining !== null
    ? formatTimeRemaining(hoursRemaining)
    : formatTimeRemaining(breakdown.hours_remaining);

  const hasDiscount = breakdown.discount_amount > 0;
  const hasFee = breakdown.processing_fee > 0;
  const showSubtotal = hasDiscount || hasFee;
  const onlyManual = breakdown.accept_manual_payments && !breakdown.accept_online_payments;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#1C1C1E] overflow-hidden">
      <div className="p-5">
        {/* Title */}
        <div className="mb-4">
          <h3
            className="text-lg font-semibold text-white"
            style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
          >
            You&apos;re in.
          </h3>
          <p className="text-sm text-white/50 mt-0.5">
            Complete your payment to lock your spot.
          </p>
        </div>

        {/* Price breakdown */}
        <div className="space-y-2.5">
          {/* Base price */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">{breakdown.pass_type_name}</span>
            <span
              className="text-sm text-white/80 tabular-nums"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {breakdown.base_price_display}
            </span>
          </div>

          {/* Discount row */}
          {hasDiscount && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-emerald-400/80">
                Discount{breakdown.discount_code ? ` (${breakdown.discount_code})` : ""}
              </span>
              <span
                className="text-sm text-emerald-400/80 tabular-nums"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                -{breakdown.discount_amount_display}
              </span>
            </div>
          )}

          {/* Subtotal section — shown when there's a discount or processing fee */}
          {showSubtotal && (
            <>
              <div className="border-t border-white/[0.06]" />

              <div className="flex items-center justify-between">
                <span className="text-sm text-white/50">Subtotal</span>
                <span
                  className="text-sm text-white/70 tabular-nums"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {breakdown.subtotal_display}
                </span>
              </div>

              {/* Processing fee */}
              {hasFee && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/50">Processing fee</span>
                  <span
                    className="text-sm text-white/70 tabular-nums"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    +{breakdown.processing_fee_display}
                  </span>
                </div>
              )}
            </>
          )}

          {/* Divider before total */}
          <div className="border-t border-white/[0.06]" />

          {/* Total */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white">Total</span>
            <span
              className="text-base font-semibold text-[#D4A574] tabular-nums"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {breakdown.total_display}
            </span>
          </div>
        </div>

        {/* Deadline countdown */}
        <div className={`mt-4 flex items-center gap-2 text-sm ${
          timeInfo.critical
            ? "text-[#D4A574] font-medium"
            : timeInfo.urgent
              ? "text-[#D4A574]"
              : "text-white/40"
        }`}>
          <Clock size={14} />
          <span>{timeInfo.text}</span>
        </div>

        {/* Inline error */}
        {payError && (
          <div className="mt-4 flex items-center gap-2.5 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-400">{payError}</p>
          </div>
        )}

        {/* Pay button */}
        {breakdown.accept_online_payments && (
          <button
            onClick={handlePay}
            disabled={initiating}
            className="mt-4 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#D4A574] text-[#0A0A0A] font-semibold text-sm hover:bg-[#B8785C] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
          >
            {initiating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Setting up payment...
              </>
            ) : (
              "Complete Payment"
            )}
          </button>
        )}

        {/* Manual payment option */}
        {breakdown.accept_manual_payments && breakdown.manual_payment_instructions && (
          <div className="mt-4">
            {/* "or" divider — only when both online and manual are available */}
            {breakdown.accept_online_payments && (
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-xs text-white/30">or</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>
            )}

            {/* Collapsible toggle — only when online is also available */}
            {breakdown.accept_online_payments && !onlyManual ? (
              <>
                <button
                  onClick={() => setManualExpanded(!manualExpanded)}
                  className="flex items-center gap-1.5 text-sm text-[#D4A574] hover:text-[#B8785C] transition-colors"
                >
                  <span>Pay via bank transfer</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${manualExpanded ? "rotate-180" : ""}`}
                  />
                </button>
                {manualExpanded && (
                  <div className="mt-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Banknote size={14} className="text-white/40" />
                      <span className="text-xs font-medium text-white/50 uppercase tracking-wider">
                        Transfer Details
                      </span>
                    </div>
                    <p className="text-sm text-white/60 whitespace-pre-line leading-relaxed">
                      {breakdown.manual_payment_instructions}
                    </p>
                    <p className="mt-3 text-xs text-white/30">
                      After transferring, your organizer will confirm your payment and you&apos;ll receive your ticket.
                    </p>
                  </div>
                )}
              </>
            ) : (
              /* Always expanded when manual is the only option */
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Banknote size={14} className="text-white/40" />
                  <span className="text-xs font-medium text-white/50 uppercase tracking-wider">
                    Bank Transfer
                  </span>
                </div>
                <p className="text-sm text-white/60 whitespace-pre-line leading-relaxed">
                  {breakdown.manual_payment_instructions}
                </p>
                <p className="mt-3 text-xs text-white/30">
                  After transferring, your organizer will confirm your payment and you&apos;ll receive your ticket.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Refund policy */}
        {breakdown.refund_policy && (
          <p className="mt-4 text-xs text-white/30 text-center">
            {breakdown.refund_policy}
          </p>
        )}
      </div>
    </div>
  );
}
