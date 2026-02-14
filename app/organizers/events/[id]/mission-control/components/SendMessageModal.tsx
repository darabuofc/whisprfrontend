"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, MessageSquare, Send, X } from "lucide-react";
import {
  messageAllOrganizerEventTicketHolders,
  type MessageAllTicketHoldersResponse,
} from "@/lib/api";
import { toast } from "sonner";

interface SendMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
}

export default function SendMessageModal({
  isOpen,
  onClose,
  eventId,
}: SendMessageModalProps) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<MessageAllTicketHoldersResponse | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setMessage("");
      setSending(false);
      setResult(null);
    }
  }, [isOpen]);

  const handleSend = async () => {
    const payload = message.trim();
    if (!payload) {
      toast.error("Message is required");
      return;
    }

    setSending(true);
    try {
      const response = await messageAllOrganizerEventTicketHolders(eventId, payload);
      setResult(response);
      toast.success(response.message || "Message sent");
    } catch (error: any) {
      console.error("Failed to message ticket holders:", error);
      toast.error(error?.response?.data?.message || error?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-xl rounded-2xl border border-white/[0.08] bg-[#111113] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
                <div>
                  <h2 className="text-lg font-semibold text-white/90">Message Ticket Holders</h2>
                  <p className="text-sm text-white/40 mt-0.5">
                    Sends your message to ticket holders with a saved WhatsApp number.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.04] text-white/40 hover:bg-white/[0.08] hover:text-white/60 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <label className="block text-sm font-medium text-white/70" htmlFor="broadcast-message">
                  Message
                </label>
                <textarea
                  id="broadcast-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  placeholder="Doors open at 8 PM. Please bring your QR ticket."
                  className="w-full resize-none rounded-xl bg-white/[0.03] border border-white/[0.08] px-4 py-3 text-sm text-white/90 placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors"
                  disabled={sending}
                />

                {result && (
                  <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-white/40">Recipients</p>
                        <p className="text-white/90 font-medium">{result.recipients}</p>
                      </div>
                      <div>
                        <p className="text-white/40">Sent</p>
                        <p className="text-emerald-300 font-medium">{result.sent}</p>
                      </div>
                      <div>
                        <p className="text-white/40">Skipped</p>
                        <p className="text-amber-300 font-medium">{result.skipped}</p>
                      </div>
                      <div>
                        <p className="text-white/40">Failed</p>
                        <p className="text-rose-300 font-medium">{result.failed}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-white/[0.06] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <MessageSquare size={14} />
                  Holders without numbers are skipped automatically
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg text-sm text-white/70 bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] transition-colors"
                    disabled={sending}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={sending}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-black bg-[#C1FF72] hover:brightness-95 disabled:opacity-60 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
                  >
                    {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                    Send Message
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
