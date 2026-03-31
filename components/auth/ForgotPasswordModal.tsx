"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Eye, EyeOff, CheckCircle } from "lucide-react";
import {
  attendeeForgotVerifyMobile,
  attendeeForgotVerifyCnic,
  attendeeForgotVerifyBirthMonth,
  attendeeForgotReset,
} from "@/lib/api";

type Step = "mobile" | "cnic" | "birth_month" | "new_password" | "success";

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const STEP_ORDER: Step[] = ["mobile", "cnic", "birth_month", "new_password", "success"];
const TOTAL_STEPS = 4;

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
  const [step, setStep] = useState<Step>("mobile");
  const [mobile, setMobile] = useState("");
  const [cnic, setCnic] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stepToken, setStepToken] = useState("");
  const [resetToken, setResetToken] = useState("");

  const accent = "#D4A574";

  const currentStepIndex = STEP_ORDER.indexOf(step);
  const progressStep = Math.min(currentStepIndex + 1, TOTAL_STEPS);

  const handleClose = () => {
    setStep("mobile");
    setMobile("");
    setCnic("");
    setBirthMonth("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setStepToken("");
    setResetToken("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  // Step 1: verify mobile
  const handleVerifyMobile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const data = await attendeeForgotVerifyMobile(mobile.trim());
      setStepToken(data.step_token);
      setStep("cnic");
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Could not verify mobile number");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: verify CNIC
  const handleVerifyCnic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const data = await attendeeForgotVerifyCnic(stepToken, cnic.trim());
      setStepToken(data.step_token);
      setStep("birth_month");
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "CNIC verification failed");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: verify birth month
  const handleVerifyBirthMonth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const data = await attendeeForgotVerifyBirthMonth(stepToken, parseInt(birthMonth));
      setResetToken(data.reset_token);
      setStep("new_password");
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Birth month verification failed");
    } finally {
      setLoading(false);
    }
  };

  // Step 4: reset password
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
      await attendeeForgotReset(resetToken, newPassword);
      setStep("success");
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all";

  const labelClass =
    "block text-xs font-medium text-white/50 uppercase tracking-wider mb-2";

  const primaryButton = (label: string, loadingLabel: string) => (
    <button
      type="submit"
      disabled={loading}
      className="w-full py-3.5 px-4 rounded-xl text-sm font-semibold transition-all duration-300"
      style={{
        background: loading ? "rgba(255,255,255,0.05)" : accent,
        color: loading ? "rgba(255,255,255,0.4)" : "#000",
        boxShadow: loading ? "none" : `0 12px 32px -12px ${accent}`,
        cursor: loading ? "not-allowed" : "pointer",
        fontFamily: "var(--font-display)",
      }}
    >
      {loading ? (
        <span className="inline-flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          {loadingLabel}
        </span>
      ) : (
        label
      )}
    </button>
  );

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

            {/* Step progress dots (steps 1–4 only, not success) */}
            {step !== "success" && (
              <div className="flex items-center gap-2 mb-6">
                {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
                  const filled = i < progressStep;
                  return (
                    <div
                      key={i}
                      className="h-1.5 rounded-full transition-all duration-300"
                      style={{
                        flex: filled ? "1.5" : "1",
                        background: filled ? accent : "rgba(255,255,255,0.12)",
                      }}
                    />
                  );
                })}
              </div>
            )}

            {/* ── Step 1: Mobile ── */}
            {step === "mobile" && (
              <>
                <h2
                  className="text-xl font-semibold text-white mb-1"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
                >
                  Forgot Password
                </h2>
                <p className="text-sm text-white/50 mb-6">
                  Enter your registered mobile number to get started
                </p>

                <form onSubmit={handleVerifyMobile} className="space-y-4">
                  <div>
                    <label htmlFor="mobile" className={labelClass} style={{ fontFamily: "var(--font-mono)" }}>
                      Mobile Number
                    </label>
                    <input
                      id="mobile"
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      required
                      placeholder="+923001234567"
                      className={inputClass}
                    />
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                      <p className="text-sm text-red-400 text-center">{error}</p>
                    </div>
                  )}

                  {primaryButton("Continue", "Verifying...")}
                </form>
              </>
            )}

            {/* ── Step 2: CNIC ── */}
            {step === "cnic" && (
              <>
                <h2
                  className="text-xl font-semibold text-white mb-1"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
                >
                  Verify Your Identity
                </h2>
                <p className="text-sm text-white/50 mb-6">
                  Enter your CNIC number linked to your account
                </p>

                <form onSubmit={handleVerifyCnic} className="space-y-4">
                  <div>
                    <label htmlFor="cnic" className={labelClass} style={{ fontFamily: "var(--font-mono)" }}>
                      CNIC Number
                    </label>
                    <input
                      id="cnic"
                      type="text"
                      value={cnic}
                      onChange={(e) => setCnic(e.target.value)}
                      required
                      placeholder="3520212345679"
                      className={inputClass}
                    />
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                      <p className="text-sm text-red-400 text-center">{error}</p>
                    </div>
                  )}

                  {primaryButton("Continue", "Verifying...")}

                  <button
                    type="button"
                    onClick={() => { setStep("mobile"); setError(""); }}
                    className="w-full py-2 text-sm text-white/50 hover:text-white/70 transition-colors"
                  >
                    Back
                  </button>
                </form>
              </>
            )}

            {/* ── Step 3: Birth Month ── */}
            {step === "birth_month" && (
              <>
                <h2
                  className="text-xl font-semibold text-white mb-1"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
                >
                  Verify Birth Month
                </h2>
                <p className="text-sm text-white/50 mb-6">
                  Select the month you were born in
                </p>

                <form onSubmit={handleVerifyBirthMonth} className="space-y-4">
                  <div>
                    <label htmlFor="birthMonth" className={labelClass} style={{ fontFamily: "var(--font-mono)" }}>
                      Birth Month
                    </label>
                    <select
                      id="birthMonth"
                      value={birthMonth}
                      onChange={(e) => setBirthMonth(e.target.value)}
                      required
                      className={`${inputClass} appearance-none`}
                      style={{ colorScheme: "dark" }}
                    >
                      <option value="" disabled className="bg-[#0a0a0a] text-white/50">
                        Select month
                      </option>
                      {MONTHS.map((m) => (
                        <option key={m.value} value={m.value} className="bg-[#0a0a0a] text-white">
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                      <p className="text-sm text-red-400 text-center">{error}</p>
                    </div>
                  )}

                  {primaryButton("Continue", "Verifying...")}

                  <button
                    type="button"
                    onClick={() => { setStep("cnic"); setError(""); }}
                    className="w-full py-2 text-sm text-white/50 hover:text-white/70 transition-colors"
                  >
                    Back
                  </button>
                </form>
              </>
            )}

            {/* ── Step 4: New Password ── */}
            {step === "new_password" && (
              <>
                <h2
                  className="text-xl font-semibold text-white mb-1"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
                >
                  Reset Password
                </h2>
                <p className="text-sm text-white/50 mb-6">
                  Create a new password for your account
                </p>

                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label htmlFor="newPassword" className={labelClass} style={{ fontFamily: "var(--font-mono)" }}>
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
                        className={`${inputClass} pr-12`}
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
                    <label htmlFor="confirmPassword" className={labelClass} style={{ fontFamily: "var(--font-mono)" }}>
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
                        className={`${inputClass} pr-12`}
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

                  {primaryButton("Reset Password", "Resetting...")}

                  <button
                    type="button"
                    onClick={() => { setStep("birth_month"); setError(""); }}
                    className="w-full py-2 text-sm text-white/50 hover:text-white/70 transition-colors"
                  >
                    Back
                  </button>
                </form>
              </>
            )}

            {/* ── Success ── */}
            {step === "success" && (
              <div className="text-center py-4">
                <div
                  className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${accent}20` }}
                >
                  <CheckCircle size={32} style={{ color: accent }} />
                </div>
                <h2
                  className="text-xl font-semibold text-white mb-2"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
                >
                  Password Reset
                </h2>
                <p className="text-sm text-white/50 mb-6">
                  Your password has been successfully reset. You are now signed in.
                </p>
                <button
                  onClick={handleClose}
                  className="w-full py-3.5 px-4 rounded-xl text-sm font-semibold transition-all duration-300"
                  style={{
                    background: accent,
                    color: "#000",
                    boxShadow: `0 12px 32px -12px ${accent}`,
                    fontFamily: "var(--font-display)",
                  }}
                >
                  Done
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
