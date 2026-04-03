"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Loader2, AlertCircle, Check, Globe, Banknote, Info } from "lucide-react";
import { getPaymentConfig, updatePaymentConfig, type PaymentConfig } from "@/lib/api";
import { toast } from "sonner";

interface PaymentSettingsTabProps {
  eventId: string;
}

const REFUND_OPTIONS = [
  { value: "no_refunds", label: "No refunds" },
  { value: "full_refund_before_event", label: "Full refund before event" },
  { value: "partial_refund", label: "Partial refund" },
  { value: "custom", label: "Custom" },
];

function FeePreview({ ticketPrice, feeHandling }: { ticketPrice: number; feeHandling: string }) {
  if (ticketPrice <= 0 || feeHandling !== "pass_to_attendee") return null;

  const gatewayFee = Math.round(ticketPrice * 0.025 + 10);
  const total = ticketPrice + gatewayFee;

  const fmt = (n: number) => `PKR ${n.toLocaleString()}`;

  return (
    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
      <p className="text-xs font-medium text-white/50 mb-3 uppercase tracking-wider">Attendee will see</p>
      <div className="space-y-1.5" style={{ fontFamily: "var(--font-mono)" }}>
        <div className="flex justify-between text-sm">
          <span className="text-white/50">Ticket price</span>
          <span className="text-white/70 tabular-nums">{fmt(ticketPrice)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-white/50">Processing fee</span>
          <span className="text-white/70 tabular-nums">+{fmt(gatewayFee)}</span>
        </div>
        <div className="border-t border-white/[0.06] pt-1.5 flex justify-between text-sm font-medium">
          <span className="text-white/70">Total</span>
          <span className="text-[#D4A574] tabular-nums">{fmt(total)}</span>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSettingsTab({ eventId }: PaymentSettingsTabProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [acceptOnline, setAcceptOnline] = useState(false);
  const [acceptManual, setAcceptManual] = useState(false);
  const [manualInstructions, setManualInstructions] = useState("");
  const [feeHandling, setFeeHandling] = useState<"absorb" | "pass_to_attendee">("pass_to_attendee");
  const [paymentWindowDays, setPaymentWindowDays] = useState(7);
  const [autoRelease, setAutoRelease] = useState(true);
  const [refundPolicy, setRefundPolicy] = useState("no_refunds");
  const [refundPolicyText, setRefundPolicyText] = useState("");

  // Store original values for change detection
  const [original, setOriginal] = useState<PaymentConfig | null>(null);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const config = await getPaymentConfig(eventId);
      setAcceptOnline(config.accept_online_payments);
      setAcceptManual(config.accept_manual_payments);
      setManualInstructions(config.manual_payment_instructions || "");
      setFeeHandling(config.fee_handling);
      setPaymentWindowDays(Math.round(config.payment_window_hours / 24) || 7);
      setAutoRelease(config.auto_release);
      setRefundPolicy(config.refund_policy || "no_refunds");
      setRefundPolicyText(config.refund_policy_text || "");
      setOriginal(config);
    } catch (err: any) {
      setError(err.message || "Failed to load payment settings");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const hasChanges = useMemo(() => {
    if (!original) return false;
    return (
      acceptOnline !== original.accept_online_payments ||
      acceptManual !== original.accept_manual_payments ||
      manualInstructions !== (original.manual_payment_instructions || "") ||
      feeHandling !== original.fee_handling ||
      paymentWindowDays !== Math.round(original.payment_window_hours / 24) ||
      autoRelease !== original.auto_release ||
      refundPolicy !== (original.refund_policy || "no_refunds") ||
      refundPolicyText !== (original.refund_policy_text || "")
    );
  }, [acceptOnline, acceptManual, manualInstructions, feeHandling, paymentWindowDays, autoRelease, refundPolicy, refundPolicyText, original]);

  const isValid = () => {
    if (acceptManual && !manualInstructions.trim()) return false;
    if (paymentWindowDays < 1 || paymentWindowDays > 30) return false;
    return true;
  };

  const handleSave = async () => {
    if (!isValid()) {
      toast.error("Please fix validation errors before saving.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const updated = await updatePaymentConfig(eventId, {
        accept_online_payments: acceptOnline,
        accept_manual_payments: acceptManual,
        manual_payment_instructions: acceptManual ? manualInstructions.trim() : null,
        fee_handling: feeHandling,
        payment_window_hours: paymentWindowDays * 24,
        auto_release: autoRelease,
        refund_policy: refundPolicy,
        refund_policy_text: refundPolicy === "custom" ? refundPolicyText.trim() : null,
      });
      setOriginal(updated);
      toast.success("Payment settings saved successfully");
    } catch (err: any) {
      setError(err.message || "Failed to save payment settings");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!original) return;
    setAcceptOnline(original.accept_online_payments);
    setAcceptManual(original.accept_manual_payments);
    setManualInstructions(original.manual_payment_instructions || "");
    setFeeHandling(original.fee_handling);
    setPaymentWindowDays(Math.round(original.payment_window_hours / 24) || 7);
    setAutoRelease(original.auto_release);
    setRefundPolicy(original.refund_policy || "no_refunds");
    setRefundPolicyText(original.refund_policy_text || "");
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-white/90" style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>Payment Settings</h2>
          <p className="text-sm text-white/40 mt-1">
            Configure how attendees will pay after their registration is approved
          </p>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-400/60 hover:text-red-400">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Settings Card */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-4">
            <Loader2 size={24} className="text-white/40 animate-spin" />
            <p className="text-sm text-white/40">Loading payment settings...</p>
          </div>
        ) : (
          <div className="p-6 space-y-8">
            {/* Payment Methods */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-white/60">Payment Methods</label>

              {/* Online toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    acceptOnline ? "bg-emerald-500/20 border border-emerald-500/30" : "bg-white/[0.04] border border-white/[0.06]"
                  }`}>
                    <Globe size={18} className={acceptOnline ? "text-emerald-400" : "text-white/40"} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/80">Accept online payments</p>
                    <p className="text-xs text-white/40">Attendees pay via Safepay checkout</p>
                  </div>
                </div>
                <button
                  onClick={() => setAcceptOnline(!acceptOnline)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    acceptOnline ? "bg-emerald-500" : "bg-white/10"
                  }`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    acceptOnline ? "translate-x-[22px]" : "translate-x-0.5"
                  }`} />
                </button>
              </div>

              {/* Manual toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    acceptManual ? "bg-amber-500/20 border border-amber-500/30" : "bg-white/[0.04] border border-white/[0.06]"
                  }`}>
                    <Banknote size={18} className={acceptManual ? "text-amber-400" : "text-white/40"} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/80">Accept manual payments</p>
                    <p className="text-xs text-white/40">Bank transfer, cash, etc.</p>
                  </div>
                </div>
                <button
                  onClick={() => setAcceptManual(!acceptManual)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    acceptManual ? "bg-amber-500" : "bg-white/10"
                  }`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    acceptManual ? "translate-x-[22px]" : "translate-x-0.5"
                  }`} />
                </button>
              </div>
            </div>

            {/* Manual payment instructions */}
            {acceptManual && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <label className="block text-sm font-medium text-white/60">
                  Manual payment instructions <span className="text-amber-400">*</span>
                </label>
                <textarea
                  value={manualInstructions}
                  onChange={(e) => setManualInstructions(e.target.value)}
                  placeholder={"Bank: HBL\nAccount Title: Events by MKhan\nAccount Number: 1234567890"}
                  rows={5}
                  className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors resize-none"
                />
                <p className="text-xs text-white/40">
                  This will be shown to attendees who choose to pay manually.
                </p>
              </div>
            )}

            {/* Fee handling */}
            {acceptOnline && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <label className="block text-sm font-medium text-white/60">Who pays the processing fee?</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] cursor-pointer hover:bg-white/[0.04] transition-colors">
                    <input
                      type="radio"
                      name="feeHandling"
                      checked={feeHandling === "absorb"}
                      onChange={() => setFeeHandling("absorb")}
                      className="w-4 h-4 accent-[#D4A574]"
                    />
                    <div>
                      <p className="text-sm text-white/80">I&apos;ll absorb it</p>
                      <p className="text-xs text-white/40">Attendee pays ticket price only</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] cursor-pointer hover:bg-white/[0.04] transition-colors">
                    <input
                      type="radio"
                      name="feeHandling"
                      checked={feeHandling === "pass_to_attendee"}
                      onChange={() => setFeeHandling("pass_to_attendee")}
                      className="w-4 h-4 accent-[#D4A574]"
                    />
                    <div>
                      <p className="text-sm text-white/80">Pass it to the attendee</p>
                      <p className="text-xs text-white/40">Fee is added on top of the ticket price</p>
                    </div>
                  </label>
                </div>

                {/* Fee preview */}
                <FeePreview ticketPrice={5000} feeHandling={feeHandling} />
              </div>
            )}

            {/* Payment window */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-white/60">Payment window</label>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={paymentWindowDays}
                    onChange={(e) => setPaymentWindowDays(Math.max(1, Math.min(30, parseInt(e.target.value) || 1)))}
                    className="w-20 px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm text-center focus:outline-none focus:border-white/20 transition-colors"
                  />
                </div>
                <span className="text-sm text-white/50">days after approval</span>
              </div>

              {/* Auto-release toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <div>
                  <p className="text-sm text-white/70">Auto-release spot if unpaid</p>
                  <p className="text-xs text-white/40">Automatically expire registration after deadline</p>
                </div>
                <button
                  onClick={() => setAutoRelease(!autoRelease)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    autoRelease ? "bg-[#D4A574]" : "bg-white/10"
                  }`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    autoRelease ? "translate-x-[22px]" : "translate-x-0.5"
                  }`} />
                </button>
              </div>
            </div>

            {/* Refund policy */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-white/60">Refund policy</label>
              <select
                value={refundPolicy}
                onChange={(e) => setRefundPolicy(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:border-white/20 transition-colors appearance-none cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em", paddingRight: "2.5rem" }}
              >
                {REFUND_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-[#1C1C1E]">
                    {opt.label}
                  </option>
                ))}
              </select>

              {/* Custom policy text */}
              {refundPolicy === "custom" && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                  <label className="block text-xs text-white/40 mb-2">
                    Policy text (shown to attendees)
                  </label>
                  <textarea
                    value={refundPolicyText}
                    onChange={(e) => setRefundPolicyText(e.target.value)}
                    placeholder="All sales are final. No refunds."
                    rows={3}
                    className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors resize-none"
                  />
                </div>
              )}
            </div>

            {/* Save Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
              <div className="text-sm text-white/40">
                {hasChanges ? (
                  <span className="text-amber-400">You have unsaved changes</span>
                ) : (
                  <span>No changes to save</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {hasChanges && (
                  <button
                    onClick={handleReset}
                    className="px-4 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl text-sm font-medium text-white/60 transition-all"
                  >
                    Reset
                  </button>
                )}
                <button
                  onClick={handleSave}
                  disabled={!hasChanges || !isValid() || saving}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#D4A574] text-[#0A0A0A] hover:bg-[#B8785C] rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
