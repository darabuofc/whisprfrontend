"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  saveBasics,
  saveProfile,
  getOnboardingStatus,
  verifyFirebasePhone,
} from "@/lib/api";
import { getAndClearPostAuthRedirect } from "@/lib/oauth";
import {
  setupRecaptcha,
  sendFirebaseOtp,
  verifyFirebaseOtp,
  clearRecaptcha,
} from "@/lib/firebase";
import type { ConfirmationResult } from "firebase/auth";

// Step icons as SVG components for crisp rendering
const PhoneIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Confetti particle component
const Confetti = ({ active }: { active: boolean }) => {
  const colors = ['#C1FF72', '#B472FF', '#72D4FF', '#FF72B4', '#FFD472'];
  const particles = Array.from({ length: 50 });

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 rounded-full"
          style={{
            backgroundColor: colors[i % colors.length],
            left: `${Math.random() * 100}%`,
            top: -20,
          }}
          initial={{ y: -20, rotate: 0, opacity: 1 }}
          animate={{
            y: typeof window !== 'undefined' ? window.innerHeight + 100 : 1000,
            rotate: Math.random() * 720 - 360,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 2.5 + Math.random() * 2,
            delay: Math.random() * 0.5,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        />
      ))}
    </div>
  );
};

// Floating orb background component
const FloatingOrbs = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none">
    <motion.div
      className="absolute w-[800px] h-[800px] rounded-full"
      style={{
        background: 'radial-gradient(circle, rgba(193,255,114,0.15) 0%, transparent 70%)',
        left: '-20%',
        top: '-20%',
      }}
      animate={{
        x: [0, 100, 0],
        y: [0, 50, 0],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
    <motion.div
      className="absolute w-[600px] h-[600px] rounded-full"
      style={{
        background: 'radial-gradient(circle, rgba(180,114,255,0.12) 0%, transparent 70%)',
        right: '-15%',
        bottom: '-15%',
      }}
      animate={{
        x: [0, -80, 0],
        y: [0, -60, 0],
        scale: [1, 1.15, 1],
      }}
      transition={{
        duration: 18,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
    <motion.div
      className="absolute w-[400px] h-[400px] rounded-full"
      style={{
        background: 'radial-gradient(circle, rgba(114,212,255,0.08) 0%, transparent 70%)',
        left: '40%',
        top: '30%',
      }}
      animate={{
        x: [0, 60, 0],
        y: [0, -40, 0],
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration: 15,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  </div>
);

// Step indicator dots
const StepIndicator = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => (
  <div className="flex items-center gap-2">
    {Array.from({ length: totalSteps }).map((_, i) => (
      <motion.div
        key={i}
        className={`rounded-full transition-colors duration-300 ${
          i + 1 === currentStep
            ? 'bg-[#C1FF72] w-8 h-2'
            : i + 1 < currentStep
            ? 'bg-[#C1FF72]/60 w-2 h-2'
            : 'bg-white/20 w-2 h-2'
        }`}
        layoutId={`step-${i}`}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    ))}
  </div>
);

// Main input component with beautiful styling
const OnboardingInput = ({
  label,
  ...props
}: { label?: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className="space-y-2">
    {label && (
      <label className="block text-sm font-medium text-white/60">{label}</label>
    )}
    <input
      {...props}
      className="w-full px-5 py-4 rounded-2xl bg-white/[0.07] border border-white/[0.08] text-white text-lg
                 placeholder:text-white/30 outline-none transition-all duration-300
                 focus:bg-white/[0.1] focus:border-[#C1FF72]/50 focus:shadow-[0_0_0_4px_rgba(193,255,114,0.1)]
                 hover:bg-white/[0.09]"
    />
  </div>
);

// Beautiful select component
const OnboardingSelect = ({
  label,
  options,
  ...props
}: { label?: string; options: { value: string; label: string }[] } & React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <div className="space-y-2">
    {label && (
      <label className="block text-sm font-medium text-white/60">{label}</label>
    )}
    <select
      {...props}
      className="w-full px-5 py-4 rounded-2xl bg-white/[0.07] border border-white/[0.08] text-white text-lg
                 outline-none transition-all duration-300 cursor-pointer appearance-none
                 focus:bg-white/[0.1] focus:border-[#C1FF72]/50 focus:shadow-[0_0_0_4px_rgba(193,255,114,0.1)]
                 hover:bg-white/[0.09]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 1rem center',
        backgroundSize: '1.5rem',
      }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-[#0a0a0a] text-white">
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

// Primary button with glow effect
const PrimaryButton = ({
  children,
  disabled,
  loading,
  onClick,
}: {
  children?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}) => (
  <motion.button
    whileHover={{ scale: disabled ? 1 : 1.02 }}
    whileTap={{ scale: disabled ? 1 : 0.98 }}
    disabled={disabled || loading}
    onClick={onClick}
    className={`w-full py-4 px-8 rounded-2xl text-lg font-semibold transition-all duration-300
               ${disabled || loading
                 ? 'bg-white/10 text-white/40 cursor-not-allowed'
                 : 'bg-[#C1FF72] text-black shadow-[0_0_40px_rgba(193,255,114,0.3)] hover:shadow-[0_0_60px_rgba(193,255,114,0.4)]'
               }`}
  >
    {loading ? (
      <motion.div
        className="w-6 h-6 mx-auto border-2 border-black/30 border-t-black rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    ) : children}
  </motion.button>
);

// Page transition variants
const pageVariants = {
  initial: { opacity: 0, y: 40, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -40, scale: 0.98 },
};

const pageTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
};

export default function AttendeesOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [underage, setUnderage] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>(new Array(6).fill(null));

  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const [profile, setProfile] = useState({
    whatsapp: "",
    whatsappVerified: false,
    dob: "",
    cnic: "",
    profession: "",
    company: "",
    university: "",
    instagramHandle: "@",
    profilePic: null as File | null,
    profilePicPreview: "",
    bio: "",
  });

  // Step metadata
  const steps = [
    { icon: PhoneIcon, title: "Verify your number", subtitle: "We'll send a quick OTP to your WhatsApp" },
    { icon: CalendarIcon, title: "A few basics", subtitle: "Help us make sure you're ready for the night" },
    { icon: UserIcon, title: "Create your profile", subtitle: "Let organizers know who's coming" },
    { icon: CheckIcon, title: "You're all set", subtitle: "Welcome to the Whispr experience" },
  ];

  // Initialize reCAPTCHA on mount
  useEffect(() => {
    return () => {
      clearRecaptcha();
    };
  }, []);

  // Handlers
  const handleSendOtp = async () => {
    try {
      setLoading(true);
      const verifier = setupRecaptcha("recaptcha-container");
      const result = await sendFirebaseOtp(profile.whatsapp);
      setConfirmationResult(result);
      setOtpSent(true);
    } catch (err: any) {
      clearRecaptcha();
      alert(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!confirmationResult) {
      alert("Please request an OTP first.");
      return;
    }
    try {
      setLoading(true);
      const firebaseIdToken = await verifyFirebaseOtp(confirmationResult, otp);
      // Send the Firebase ID token to our backend to verify and link the phone number
      await verifyFirebasePhone(profile.whatsapp, firebaseIdToken);
      setProfile({ ...profile, whatsappVerified: true });
      setStep(2);
    } catch (err: any) {
      alert(err.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setProfile({ ...profile, dob: value });

    if (!value) return;
    const birthDate = new Date(value);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const hasBirthdayPassed =
      today.getMonth() > birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() &&
        today.getDate() >= birthDate.getDate());

    const realAge = hasBirthdayPassed ? age : age - 1;
    setUnderage(realAge < 18);
  };

  const formatCnic = (val: string) => {
    val = val.replace(/\D/g, "");
    if (val.length > 5 && val.length <= 12)
      val = val.slice(0, 5) + "-" + val.slice(5);
    else if (val.length > 12)
      val = val.slice(0, 5) + "-" + val.slice(5, 12) + "-" + val.slice(12, 13);
    return val;
  };

  const handleCnicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCnic(e.target.value);
    setProfile({ ...profile, cnic: formatted });
  };

  const handleSaveBasics = async () => {
    try {
      setLoading(true);
      await saveBasics(profile.dob, profile.cnic);
      setStep(3);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePic = (file: File | null) => {
    if (!file) return;
    setProfile({
      ...profile,
      profilePic: file,
      profilePicPreview: URL.createObjectURL(file),
    });
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const form = new FormData();
      form.append("profession", profile.profession);
      if (profile.company) form.append("company", profile.company);
      if (profile.university) form.append("university", profile.university);
      form.append("instagram_handle", profile.instagramHandle.trim());
      if (profile.bio) form.append("bio", profile.bio);
      if (profile.profilePic) form.append("photo", profile.profilePic);

      await saveProfile(form);
      setStep(4);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const finishOnboarding = async () => {
    try {
      setLoading(true);
      const status = await getOnboardingStatus();
      if (status.mustCompleted) {
        // Check for saved redirect URL (e.g., from event page)
        const savedRedirect = getAndClearPostAuthRedirect();
        router.push(savedRedirect || "/attendees/dashboard");
      } else {
        alert("Please complete all required fields first.");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // OTP input handlers
  const handleOtpChange = (i: number, val: string) => {
    if (/^\d?$/.test(val)) {
      const newOtp = otp.split("");
      newOtp[i] = val;
      setOtp(newOtp.join(""));
      if (val && i < 5) inputsRef.current[i + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      inputsRef.current[i - 1]?.focus();
    }
  };

  const handleInstagramChange = (val: string) => {
    let normalized = val.replace(/\s+/g, "");
    if (!normalized.startsWith("@")) {
      normalized = "@" + normalized.replace(/^@+/, "");
    }
    if (normalized === "@") normalized = "@";
    setProfile({ ...profile, instagramHandle: normalized });
  };

  return (
    <main className="relative min-h-screen w-full bg-[#050505] text-white overflow-hidden">
      <FloatingOrbs />
      <Confetti active={showConfetti} />

      {/* Noise texture overlay */}
      <div className="fixed inset-0 bg-[url('/noise.png')] bg-[length:200px] opacity-[0.03] pointer-events-none" />

      {/* Invisible reCAPTCHA container for Firebase phone auth */}
      <div id="recaptcha-container" />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12">
        {/* Logo/Brand */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.05] border border-white/[0.08]">
            <div className="w-2 h-2 rounded-full bg-[#C1FF72] shadow-[0_0_10px_#C1FF72]" />
            <span className="text-sm font-medium text-white/70">Whispr</span>
          </div>
        </motion.div>

        {/* Step indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <StepIndicator currentStep={step} totalSteps={4} />
        </motion.div>

        {/* Step icon and title */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`header-${step}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="text-center mb-10"
          >
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C1FF72]/20 to-[#C1FF72]/5 border border-[#C1FF72]/20 text-[#C1FF72] mb-6"
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              {step === 1 && <PhoneIcon />}
              {step === 2 && <CalendarIcon />}
              {step === 3 && <UserIcon />}
              {step === 4 && <CheckIcon />}
            </motion.div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3 tracking-tight">
              {steps[step - 1].title}
            </h1>
            <p className="text-lg text-white/50 max-w-md">
              {steps[step - 1].subtitle}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Step content */}
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {/* STEP 1: WhatsApp Verification */}
            {step === 1 && (
              <motion.div
                key="step1"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={pageTransition}
                className="space-y-6"
              >
                {!otpSent ? (
                  <>
                    <OnboardingInput
                      type="tel"
                      placeholder="+923001234567"
                      value={profile.whatsapp}
                      onChange={(e) => setProfile({ ...profile, whatsapp: e.target.value })}
                    />
                    <PrimaryButton
                      onClick={handleSendOtp}
                      disabled={!profile.whatsapp}
                      loading={loading}
                    >
                      Send verification code
                    </PrimaryButton>
                  </>
                ) : !profile.whatsappVerified ? (
                  <>
                    <div className="flex justify-center gap-3">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <motion.input
                          key={i}
                          ref={(el) => { inputsRef.current[i] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={otp[i] || ""}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(i, e)}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="w-12 h-14 sm:w-14 sm:h-16 rounded-xl bg-white/[0.07] border border-white/[0.08]
                                     text-center text-2xl font-bold text-white outline-none transition-all duration-300
                                     focus:bg-white/[0.1] focus:border-[#C1FF72]/50 focus:shadow-[0_0_0_4px_rgba(193,255,114,0.15)]"
                        />
                      ))}
                    </div>
                    <p className="text-center text-sm text-white/40">
                      Didn't receive it?{" "}
                      <button
                        onClick={handleSendOtp}
                        className="text-[#C1FF72] hover:underline"
                      >
                        Resend code
                      </button>
                    </p>
                    <PrimaryButton
                      onClick={handleVerifyOtp}
                      disabled={otp.length !== 6}
                      loading={loading}
                    >
                      Verify
                    </PrimaryButton>
                  </>
                ) : (
                  <PrimaryButton onClick={() => setStep(2)}>
                    Continue
                  </PrimaryButton>
                )}
              </motion.div>
            )}

            {/* STEP 2: Basics (DOB + CNIC) */}
            {step === 2 && (
              <motion.div
                key="step2"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={pageTransition}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <OnboardingInput
                    type="date"
                    label="Date of birth"
                    value={profile.dob}
                    onChange={handleDobChange}
                  />
                  {underage && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm"
                    >
                      You must be 18 or older to continue
                    </motion.p>
                  )}
                </div>

                <OnboardingInput
                  type="text"
                  label="CNIC number"
                  placeholder="42301-9207562-9"
                  value={profile.cnic}
                  onChange={handleCnicChange}
                  maxLength={15}
                />

                <PrimaryButton
                  onClick={handleSaveBasics}
                  disabled={!profile.dob || !profile.cnic || underage}
                  loading={loading}
                >
                  Continue
                </PrimaryButton>
              </motion.div>
            )}

            {/* STEP 3: Profile */}
            {step === 3 && (
              <motion.div
                key="step3"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={pageTransition}
                className="space-y-5"
              >
                {/* Profile picture upload */}
                <motion.div
                  onClick={() => document.getElementById("profilePicInput")?.click()}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative mx-auto w-28 h-28 rounded-full cursor-pointer group"
                >
                  {profile.profilePicPreview ? (
                    <img
                      src={profile.profilePicPreview}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover border-2 border-[#C1FF72]/50"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-white/[0.07] border-2 border-dashed border-white/20
                                    flex items-center justify-center transition-colors group-hover:border-[#C1FF72]/50">
                      <svg className="w-8 h-8 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                              d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#C1FF72] flex items-center justify-center">
                    <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <input
                    id="profilePicInput"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleProfilePic(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </motion.div>
                <p className="text-center text-sm text-white/40">Add a photo</p>

                <OnboardingSelect
                  label="What do you do?"
                  value={profile.profession}
                  onChange={(e) => setProfile({ ...profile, profession: e.target.value })}
                  options={[
                    { value: "", label: "Select your profession" },
                    { value: "student", label: "Student" },
                    { value: "employed", label: "Employed" },
                    { value: "freelancer", label: "Freelancer" },
                    { value: "entrepreneur", label: "Entrepreneur" },
                  ]}
                />

                <AnimatePresence>
                  {profile.profession === "student" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <OnboardingInput
                        type="text"
                        label="University"
                        placeholder="Your university"
                        value={profile.university}
                        onChange={(e) => setProfile({ ...profile, university: e.target.value })}
                      />
                    </motion.div>
                  )}

                  {profile.profession === "employed" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <OnboardingInput
                        type="text"
                        label="Company"
                        placeholder="Your company"
                        value={profile.company}
                        onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <OnboardingInput
                  type="text"
                  label="Instagram"
                  placeholder="@yourhandle"
                  value={profile.instagramHandle}
                  onChange={(e) => handleInstagramChange(e.target.value)}
                />

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/60">Bio</label>
                  <textarea
                    placeholder="Tell us a little about yourself..."
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    rows={3}
                    className="w-full px-5 py-4 rounded-2xl bg-white/[0.07] border border-white/[0.08] text-white text-lg
                               placeholder:text-white/30 outline-none transition-all duration-300 resize-none
                               focus:bg-white/[0.1] focus:border-[#C1FF72]/50 focus:shadow-[0_0_0_4px_rgba(193,255,114,0.1)]
                               hover:bg-white/[0.09]"
                  />
                </div>

                <PrimaryButton
                  onClick={handleSaveProfile}
                  disabled={!profile.profilePic || profile.instagramHandle.trim() === "@" || !profile.profession}
                  loading={loading}
                >
                  Complete profile
                </PrimaryButton>
              </motion.div>
            )}

            {/* STEP 4: Success */}
            {step === 4 && (
              <motion.div
                key="step4"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={pageTransition}
                className="text-center space-y-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
                  className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-[#C1FF72] to-[#8BC34A]"
                >
                  <svg className="w-12 h-12 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <motion.path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                    />
                  </svg>
                </motion.div>

                <div>
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl font-bold mb-3"
                  >
                    Welcome to Whispr
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-lg text-white/50"
                  >
                    You're ready to discover amazing events
                  </motion.p>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <PrimaryButton onClick={finishOnboarding} loading={loading}>
                    Start exploring
                  </PrimaryButton>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer hint */}
        {step < 4 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-sm text-white/30"
          >
            Your information is secure and never shared
          </motion.p>
        )}
      </div>
    </main>
  );
}
