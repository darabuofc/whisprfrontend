"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import { confirmManualPayment } from "@/lib/api";
import { toast } from "sonner";

interface ConfirmManualPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  registrationId: string;
  attendeeName: string;
  passType: string;
  price: number | null;
  onConfirmed: () => void;
}

export default function ConfirmManualPaymentModal({
  isOpen,
  onClose,
  registrationId,
  attendeeName,
  passType,
  price,
  onConfirmed,
}: ConfirmManualPaymentModalProps) {
  const [referenceNote, setReferenceNote] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setConfirming(true);
    setError(null);
    try {
      await confirmManualPayment(registrationId, referenceNote.trim() || undefined);
      toast.success("Payment confirmed. Ticket sent to attendee.");
      setReferenceNote("");
      onConfirmed();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to confirm payment");
    } finally {
      setConfirming(false);
    }
  };

  const handleClose = () => {
    if (confirming) return;
    setReferenceNote("");
    setError(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md bg-[#1C1C1E] border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/40">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
                <h3
                  className="text-base font-semibold text-white"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
                >
                  Confirm manual payment
                </h3>
                <button
                  onClick={handleClose}
                  disabled={confirming}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                {/* Attendee info */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/50">Attendee</span>
                    <span className="text-white/80 font-medium">{attendeeName}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/50">Pass</span>
                    <span className="text-white/80">
                      {passType}
                      {price !== null && price !== undefined && (
                        <span className="ml-1 text-white/50">
                          &mdash; Rs. {price.toLocaleString()}
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Reference note */}
                <div>
                  <label className="block text-sm text-white/50 mb-2">
                    Reference note <span className="text-white/30">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={referenceNote}
                    onChange={(e) => setReferenceNote(e.target.value)}
                    placeholder="e.g. HBL transfer ref #ABC123"
                    disabled={confirming}
                    className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors disabled:opacity-50"
                  />
                </div>

                {/* Info text */}
                <p className="text-xs text-white/30 leading-relaxed">
                  This will mark the payment as received and generate the attendee&apos;s ticket.
                </p>

                {/* Error */}
                {error && (
                  <p className="text-sm text-red-400">{error}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 p-5 border-t border-white/[0.06]">
                <button
                  onClick={handleClose}
                  disabled={confirming}
                  className="px-4 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl text-sm font-medium text-white/60 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={confirming}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#D4A574] text-[#0A0A0A] hover:bg-[#B8785C] rounded-xl text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {confirming ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    "Confirm Payment"
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
