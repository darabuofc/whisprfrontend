"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, AlertCircle, Globe, Banknote, Check } from "lucide-react";
import { api } from "@/lib/api";

interface PaymentSettingsTabProps {
  eventId: string;
}

interface PaymentSettings {
  payment_mode: "online" | "manual";
  manual_payment_account: string | null;
}

export default function PaymentSettingsTab({ eventId }: PaymentSettingsTabProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [paymentMode, setPaymentMode] = useState<"online" | "manual">("online");
  const [manualPaymentAccount, setManualPaymentAccount] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  // Store original values to detect changes
  const [originalMode, setOriginalMode] = useState<"online" | "manual">("online");
  const [originalAccount, setOriginalAccount] = useState("");

  const fetchPaymentSettings = useCallback(async () => {
    try {
      setError(null);
      const res = await api.get(`/organizers/events/${eventId}`);
      const event = res.data.event;
      const fields = event.fields ?? {};

      const mode = fields.payment_mode === "manual" ? "manual" : "online";
      const account = fields.manual_payment_account ?? "";

      setPaymentMode(mode);
      setManualPaymentAccount(account);
      setOriginalMode(mode);
      setOriginalAccount(account);
    } catch (err: any) {
      setError(err.message || "Failed to load payment settings");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchPaymentSettings();
  }, [fetchPaymentSettings]);

  // Detect changes
  useEffect(() => {
    const modeChanged = paymentMode !== originalMode;
    const accountChanged = manualPaymentAccount !== originalAccount;
    setHasChanges(modeChanged || accountChanged);
  }, [paymentMode, manualPaymentAccount, originalMode, originalAccount]);

  const isValid = () => {
    if (paymentMode === "manual" && !manualPaymentAccount.trim()) {
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!isValid()) {
      setError("Please provide payment account details for manual payments.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await api.post(`/organizers/events/${eventId}/update`, {
        payment_mode: paymentMode,
        ...(paymentMode === "manual" && { manual_payment_account: manualPaymentAccount.trim() }),
      });

      setOriginalMode(paymentMode);
      setOriginalAccount(manualPaymentAccount);
      setHasChanges(false);
      setSuccess("Payment settings saved successfully");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save payment settings");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setPaymentMode(originalMode);
    setManualPaymentAccount(originalAccount);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-white/90">Payment Settings</h2>
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
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-400/60 hover:text-red-400"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Success banner */}
      {success && (
        <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <Check size={18} className="text-emerald-400 flex-shrink-0" />
          <p className="text-sm text-emerald-400">{success}</p>
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
          <div className="p-6 space-y-6">
            {/* Info Box */}
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-400">How payment modes work</p>
                  <ul className="text-xs text-white/50 mt-2 space-y-1">
                    <li><strong className="text-white/70">Online:</strong> Approved attendees receive an Abhipay payment link via WhatsApp</li>
                    <li><strong className="text-white/70">Manual:</strong> Approved attendees receive your custom payment instructions via WhatsApp</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Payment Mode Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-white/60">Payment Mode</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Online Option */}
                <button
                  onClick={() => setPaymentMode("online")}
                  className={`p-5 rounded-xl border transition-all duration-300 text-left ${
                    paymentMode === "online"
                      ? "bg-white/[0.08] border-white/20"
                      : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      paymentMode === "online"
                        ? "bg-emerald-500/20 border border-emerald-500/30"
                        : "bg-white/[0.04] border border-white/[0.06]"
                    }`}>
                      <Globe size={22} className={paymentMode === "online" ? "text-emerald-400" : "text-white/40"} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${paymentMode === "online" ? "text-white" : "text-white/70"}`}>
                          Online Payment
                        </span>
                        {paymentMode === "online" && (
                          <span className="px-2 py-0.5 text-[10px] font-medium bg-emerald-500/20 text-emerald-400 rounded-full">
                            Selected
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/40 mt-1">
                        Attendees receive an Abhipay payment link via WhatsApp after approval
                      </p>
                    </div>
                  </div>
                </button>

                {/* Manual Option */}
                <button
                  onClick={() => setPaymentMode("manual")}
                  className={`p-5 rounded-xl border transition-all duration-300 text-left ${
                    paymentMode === "manual"
                      ? "bg-white/[0.08] border-white/20"
                      : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      paymentMode === "manual"
                        ? "bg-amber-500/20 border border-amber-500/30"
                        : "bg-white/[0.04] border border-white/[0.06]"
                    }`}>
                      <Banknote size={22} className={paymentMode === "manual" ? "text-amber-400" : "text-white/40"} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${paymentMode === "manual" ? "text-white" : "text-white/70"}`}>
                          Manual Payment
                        </span>
                        {paymentMode === "manual" && (
                          <span className="px-2 py-0.5 text-[10px] font-medium bg-amber-500/20 text-amber-400 rounded-full">
                            Selected
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/40 mt-1">
                        Attendees receive your custom payment instructions via WhatsApp
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Manual Payment Account Details */}
            {paymentMode === "manual" && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <label className="block text-sm font-medium text-white/60">
                  Payment Account Details <span className="text-amber-400">*</span>
                </label>
                <textarea
                  value={manualPaymentAccount}
                  onChange={(e) => setManualPaymentAccount(e.target.value)}
                  placeholder="Enter bank account details, UPI ID, JazzCash/Easypaisa number, or other payment instructions...

Example:
Bank: ABC Bank
Account Title: John Doe
Account Number: 1234567890
IBAN: PK00ABCD1234567890123456"
                  rows={6}
                  className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors resize-none"
                />
                <p className="text-xs text-white/40">
                  This information will be sent to attendees on WhatsApp when their registration is approved.
                  Make sure to include all necessary details for them to complete the payment.
                </p>
              </div>
            )}

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
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-black rounded-xl text-sm font-semibold hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Additional Info */}
      <div className="p-5 bg-white/[0.02] border border-white/[0.04] rounded-xl">
        <p className="text-xs text-white/40 leading-relaxed">
          <span className="text-white/60 font-medium">Note:</span> Payment settings affect how approved registrations
          are handled. When you approve a registration, the system will automatically send the appropriate payment
          information to the attendee via WhatsApp based on your selected payment mode.
        </p>
      </div>
    </div>
  );
}
