"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, AlertCircle, Clock, Banknote } from "lucide-react";
import { getPaymentBreakdown, initiatePayment, type PaymentBreakdown } from "@/lib/api";
import { toast } from "sonner";

interface PaymentSectionProps {
  registrationId: string;
  eventId: string;
}

function formatTimeRemaining(hoursRemaining: number): { text: string; urgent: boolean; critical: boolean } {
  if (hoursRemaining <= 0) {
    return { text: "Expired", urgent: true, critical: true };
  }
  if (hoursRemaining < 1) {
    const minutes = Math.max(1, Math.round(hoursRemaining * 60));
    return { text: `Pay within ${minutes} minute${minutes !== 1 ? "s" : ""}`, urgent: true, critical: true };
  }
  if (hoursRemaining < 24) {
    const hours = Math.floor(hoursRemaining);
    return { text: `Pay within ${hours} hour${hours !== 1 ? "s" : ""}`, urgent: true, critical: false };
  }
  const days = Math.floor(hoursRemaining / 24);
  const remainingHours = Math.floor(hoursRemaining % 24);
  let text = `Pay within ${days} day${days !== 1 ? "s" : ""}`;
  if (remainingHours > 0) {
    text += `, ${remainingHours} hour${remainingHours !== 1 ? "s" : ""}`;
  }
  return { text, urgent: false, critical: false };
}

export default function PaymentSection({ registrationId, eventId }: PaymentSectionProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [breakdown, setBreakdown] = useState<PaymentBreakdown | null>(null);
  const [initiating, setInitiating] = useState(false);

  const fetchBreakdown = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPaymentBreakdown(registrationId);
      setBreakdown(data);
    } catch (err: any) {
      setError(err.message || "Couldn't load payment details");
    } finally {
      setLoading(false);
    }
  }, [registrationId]);

  useEffect(() => {
    fetchBreakdown();
  }, [fetchBreakdown]);

  const handlePay = async () => {
    if (!breakdown) return;
    setInitiating(true);
    try {
      const res = await initiatePayment(registrationId);
      window.location.href = res.checkout_url;
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 409) {
        toast.error("This registration has already been paid.");
        window.location.reload();
      } else if (status === 410) {
        toast.error("Payment window has expired.");
        window.location.reload();
      } else if (status === 502) {
        toast.error("Payment service is temporarily unavailable. Please try again.");
        setInitiating(false);
      } else {
        toast.error(err.message || "Failed to initiate payment");
        setInitiating(false);
      }
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#1C1C1E] overflow-hidden">
        <div className="p-5 space-y-4">
          <div className="h-5 w-48 bg-white/5 rounded animate-pulse" />
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

  const timeInfo = formatTimeRemaining(breakdown.hours_remaining);

  return (
    <div className="rounded-2xl border border-white/10 bg-[#1C1C1E] overflow-hidden">
      <div className="p-5">
        {/* Title */}
        <h3
          className="text-base font-semibold text-white mb-4"
          style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
        >
          Complete Your Payment
        </h3>

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
          {breakdown.discount_amount > 0 && (
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

          {/* Divider */}
          <div className="border-t border-white/[0.06]" />

          {/* Subtotal */}
          {breakdown.processing_fee > 0 && (
            <>
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
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/50">Processing fee</span>
                <span
                  className="text-sm text-white/70 tabular-nums"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  +{breakdown.processing_fee_display}
                </span>
              </div>

              <div className="border-t border-white/[0.06]" />
            </>
          )}

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

        {/* Deadline */}
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
          <div className={breakdown.accept_online_payments ? "mt-4" : "mt-4"}>
            {breakdown.accept_online_payments && (
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-xs text-white/30">or pay manually</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>
            )}
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
