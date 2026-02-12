"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Eye, EyeOff, CheckCircle } from "lucide-react";
import {
  resetAttendeePassword,
  resetOrganizerPassword,
} from "@/lib/api";
import {
  setupRecaptcha,
  sendFirebaseOtp,
  verifyFirebaseOtp,
  clearRecaptcha,
} from "@/lib/firebase";
import type { ConfirmationResult } from "firebase/auth";

type Step = "phone" | "verify" | "reset" | "success";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "attendee" | "organizer";
}

export default function ForgotPasswordModal({
  isOpen,
  onClose,
  mode,
}: ForgotPasswordModalProps) {
  const [step, setStep] = useState<Step>("phone");
  const [whatsapp, setWhatsapp] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [firebaseVerified, setFirebaseVerified] = useState(false);

  const accent = mode === "attendee" ? "#c1ff72" : "#b472ff";

  // Cleanup reCAPTCHA on unmount
  useEffect(() => {
    return () => {
      clearRecaptcha();
    };
  }, []);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const verifier = setupRecaptcha("forgot-recaptcha-container");
      const result = await sendFirebaseOtp(whatsapp.trim());
      setConfirmationResult(result);
      setStep("verify");
    } catch (err: any) {
      clearRecaptcha();
      setError(err?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !confirmationResult) return;

    setLoading(true);
    setError("");

    try {
      await verifyFirebaseOtp(confirmationResult, otp.trim());
      setFirebaseVerified(true);
      setStep("reset");
    } catch (err: any) {
      setError(err?.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const resetPassword =
        mode === "attendee" ? resetAttendeePassword : resetOrganizerPassword;
      await resetPassword(whatsapp.trim(), otp.trim(), newPassword);
      setStep("success");
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep("phone");
    setWhatsapp("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setConfirmationResult(null);
    setFirebaseVerified(false);
    clearRecaptcha();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0a0a0a] p-6 relative"
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 p-2 text-white/40 hover:text-white/70 transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            {/* Invisible reCAPTCHA container */}
            <div id="forgot-recaptcha-container" />

            {step === "phone" && (
              <>
                <h2 className="text-xl font-semibold text-white mb-2">
                  Forgot Password
                </h2>
                <p className="text-sm text-white/50 mb-6">
                  Enter your phone number to receive an SMS verification code
                </p>

                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label
                      htmlFor="whatsapp"
                      className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2"
                    >
                      Phone Number
                    </label>
                    <input
                      id="whatsapp"
                      type="tel"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      required
                      placeholder="+923001234567"
                      className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                      <p className="text-sm text-red-400 text-center">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-4 rounded-xl text-sm font-semibold transition-all duration-300"
                    style={{
                      background: loading ? "rgba(255,255,255,0.05)" : accent,
                      color: loading ? "rgba(255,255,255,0.4)" : "#000",
                      boxShadow: loading ? "none" : `0 12px 32px -12px ${accent}`,
                      cursor: loading ? "not-allowed" : "pointer",
                    }}
                  >
                    {loading ? (
                      <span className="inline-flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending code...
                      </span>
                    ) : (
                      "Send Verification Code"
                    )}
                  </button>
                </form>
              </>
            )}

            {step === "verify" && (
              <>
                <h2 className="text-xl font-semibold text-white mb-2">
                  Verify Your Number
                </h2>
                <p className="text-sm text-white/50 mb-6">
                  Enter the 6-digit code sent to {whatsapp}
                </p>

                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label
                      htmlFor="otp"
                      className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2"
                    >
                      Verification Code
                    </label>
                    <input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all text-center tracking-[0.5em] text-lg"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                      <p className="text-sm text-red-400 text-center">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-4 rounded-xl text-sm font-semibold transition-all duration-300"
                    style={{
                      background: loading ? "rgba(255,255,255,0.05)" : accent,
                      color: loading ? "rgba(255,255,255,0.4)" : "#000",
                      boxShadow: loading ? "none" : `0 12px 32px -12px ${accent}`,
                      cursor: loading ? "not-allowed" : "pointer",
                    }}
                  >
                    {loading ? (
                      <span className="inline-flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Verifying...
                      </span>
                    ) : (
                      "Verify Code"
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep("phone");
                      setOtp("");
                      setError("");
                      clearRecaptcha();
                    }}
                    className="w-full py-2 text-sm text-white/50 hover:text-white/70 transition-colors"
                  >
                    Back to phone number
                  </button>
                </form>
              </>
            )}

            {step === "reset" && (
              <>
                <h2 className="text-xl font-semibold text-white mb-2">
                  Reset Password
                </h2>
                <p className="text-sm text-white/50 mb-6">
                  Create a new password for your account
                </p>

                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label
                      htmlFor="newPassword"
                      className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2"
                    >
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        id="newPassword"
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        placeholder="Create a new password"
                        className="w-full px-4 py-3 pr-12 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-white/40 hover:text-white/70 transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2"
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder="Confirm your new password"
                        className="w-full px-4 py-3 pr-12 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-white/40 hover:text-white/70 transition-colors"
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                      <p className="text-sm text-red-400 text-center">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-4 rounded-xl text-sm font-semibold transition-all duration-300"
                    style={{
                      background: loading ? "rgba(255,255,255,0.05)" : accent,
                      color: loading ? "rgba(255,255,255,0.4)" : "#000",
                      boxShadow: loading ? "none" : `0 12px 32px -12px ${accent}`,
                      cursor: loading ? "not-allowed" : "pointer",
                    }}
                  >
                    {loading ? (
                      <span className="inline-flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Resetting...
                      </span>
                    ) : (
                      "Reset Password"
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep("phone");
                      setError("");
                      clearRecaptcha();
                    }}
                    className="w-full py-2 text-sm text-white/50 hover:text-white/70 transition-colors"
                  >
                    Back to phone number
                  </button>
                </form>
              </>
            )}

            {step === "success" && (
              <div className="text-center py-4">
                <div
                  className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${accent}20` }}
                >
                  <CheckCircle size={32} style={{ color: accent }} />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  Password Reset
                </h2>
                <p className="text-sm text-white/50 mb-6">
                  Your password has been successfully reset. You can now sign in with your new password.
                </p>
                <button
                  onClick={handleClose}
                  className="w-full py-3.5 px-4 rounded-xl text-sm font-semibold transition-all duration-300"
                  style={{
                    background: accent,
                    color: "#000",
                    boxShadow: `0 12px 32px -12px ${accent}`,
                  }}
                >
                  Back to Sign In
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
