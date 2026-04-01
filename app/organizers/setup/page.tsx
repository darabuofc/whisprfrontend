"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getOrganization, updateOrganization, Organization } from "@/lib/api";
import {
  Building2,
  Image,
  Type,
  Globe,
  Instagram,
  Check,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  X,
} from "lucide-react";
import { useOnboarding } from "@/onboarding/context/useOnboarding";
import { TooltipOverlay } from "@/onboarding/components/TooltipOverlay";
import type { TooltipConfig } from "@/onboarding/context/types";

// Floating orb background component - Purple themed for organizer
const FloatingOrbs = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none">
    <motion.div
      className="absolute w-[800px] h-[800px] rounded-full"
      style={{
        background: 'radial-gradient(circle, rgba(44,44,46,0.15) 0%, transparent 70%)',
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
        background: 'radial-gradient(circle, rgba(212,165,116,0.12) 0%, transparent 70%)',
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
        background: 'radial-gradient(circle, rgba(142,142,147,0.08) 0%, transparent 70%)',
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
            ? 'bg-[#D4A574] w-8 h-2'
            : i + 1 < currentStep
            ? 'bg-[#D4A574]/60 w-2 h-2'
            : 'bg-white/20 w-2 h-2'
        }`}
        layoutId={`org-step-${i}`}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    ))}
  </div>
);

// Main input component with beautiful styling - Purple themed
const OnboardingInput = ({
  label,
  hint,
  prefix,
  ...props
}: { label?: string; hint?: string; prefix?: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className="space-y-2">
    {label && (
      <label className="block text-sm font-medium text-white/60">{label}</label>
    )}
    <div className="relative">
      {prefix && (
        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40 text-lg">
          {prefix}
        </span>
      )}
      <input
        {...props}
        className={`w-full px-5 py-4 rounded-2xl bg-white/[0.07] border border-white/[0.08] text-white text-lg
                   placeholder:text-white/30 outline-none transition-all duration-300
                   focus:bg-white/[0.1] focus:border-[#D4A574]/50 focus:shadow-[0_0_0_4px_rgba(44,44,46,0.1)]
                   hover:bg-white/[0.09] ${prefix ? 'pl-12' : ''}`}
      />
    </div>
    {hint && (
      <p className="text-xs text-white/40">{hint}</p>
    )}
  </div>
);

// Textarea component
const OnboardingTextarea = ({
  label,
  hint,
  ...props
}: { label?: string; hint?: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <div className="space-y-2">
    {label && (
      <label className="block text-sm font-medium text-white/60">{label}</label>
    )}
    <textarea
      {...props}
      className="w-full px-5 py-4 rounded-2xl bg-white/[0.07] border border-white/[0.08] text-white text-lg
                 placeholder:text-white/30 outline-none transition-all duration-300 resize-none
                 focus:bg-white/[0.1] focus:border-[#D4A574]/50 focus:shadow-[0_0_0_4px_rgba(44,44,46,0.1)]
                 hover:bg-white/[0.09]"
    />
    {hint && (
      <p className="text-xs text-white/40">{hint}</p>
    )}
  </div>
);

// Primary button with glow effect - Purple themed
const PrimaryButton = ({
  children,
  disabled,
  loading,
  onClick,
  variant = "primary",
}: {
  children?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  variant?: "primary" | "secondary";
}) => (
  <motion.button
    whileHover={{ scale: disabled ? 1 : 1.02 }}
    whileTap={{ scale: disabled ? 1 : 0.98 }}
    disabled={disabled || loading}
    onClick={onClick}
    className={`py-4 px-8 rounded-2xl text-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2
               ${variant === "secondary"
                 ? 'bg-white/[0.05] text-white/70 hover:bg-white/[0.1] border border-white/[0.08]'
                 : disabled || loading
                   ? 'bg-white/10 text-white/40 cursor-not-allowed'
                   : 'bg-[#D4A574] text-[#0A0A0A] hover:bg-[#B8785C]'
               }`}
  >
    {loading ? (
      <motion.div
        className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    ) : children}
  </motion.button>
);

// Confetti particle component
const Confetti = ({ active }: { active: boolean }) => {
  const colors = ['#D4A574', '#D4A574', '#8E8E93', '#B8785C', '#D4A574'];
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

export default function OrganizationSetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [existingOrg, setExistingOrg] = useState<Organization | null>(null);
  const [s1TooltipIdx, setS1TooltipIdx] = useState(0);

  // Onboarding context (may throw if not wrapped - gracefully handle)
  let onboarding: ReturnType<typeof useOnboarding> | null = null;
  try {
    onboarding = useOnboarding();
  } catch {
    // Not in onboarding context - that's fine
  }

  const isOnboarding = onboarding?.isOnboarding && onboarding?.currentStage === "S1";

  // S1 Tooltip sequence
  const s1Tooltips: TooltipConfig[] = [
    {
      id: "s1_org_name",
      targetSelector: "[data-onboarding='org-logo']",
      title: "First impressions",
      body: "Shows in the event feed and on tickets. Square format, dark backgrounds work best.",
      placement: "right",
      sequence: { group: "s1_org_setup", index: 1, total: 3 },
      onDismiss: () => setS1TooltipIdx(1),
    },
    {
      id: "s1_tagline",
      targetSelector: "[data-onboarding='org-tagline']",
      title: "One line. Make it count.",
      body: "Tells attendees what your events are about. Think editorial, not corporate.",
      placement: "right",
      sequence: { group: "s1_org_setup", index: 2, total: 3 },
      onDismiss: () => setS1TooltipIdx(2),
    },
    {
      id: "s1_links",
      targetSelector: "[data-onboarding='org-links']",
      title: "Your digital footprint",
      body: "Connect your website and Instagram so attendees can discover more about you.",
      placement: "right",
      sequence: { group: "s1_org_setup", index: 3, total: 3 },
      onDismiss: () => setS1TooltipIdx(-1),
    },
  ];

  const activeS1Tooltip =
    isOnboarding && s1TooltipIdx >= 0 ? s1Tooltips[s1TooltipIdx] : null;

  const [formData, setFormData] = useState({
    logo: "",
    tagline: "",
    website: "",
    instagram_handle: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Step metadata - Purple themed icons
  const steps = [
    {
      icon: Image,
      title: "Brand Identity",
      subtitle: "Add your organization's logo",
      fields: ["logo"]
    },
    {
      icon: Type,
      title: "Your Story",
      subtitle: "Tell the world what you're about",
      fields: ["tagline"]
    },
    {
      icon: Globe,
      title: "Online Presence",
      subtitle: "Connect your digital footprint",
      fields: ["website", "instagram_handle"]
    },
    {
      icon: Sparkles,
      title: "All Set!",
      subtitle: "Your organization is ready to shine",
      fields: []
    },
  ];

  // Load existing organization data
  useEffect(() => {
    const loadOrganization = async () => {
      try {
        const org = await getOrganization();
        if (org) {
          setExistingOrg(org);
          setFormData({
            logo: org.logo || "",
            tagline: org.tagline || "",
            website: org.website || "",
            instagram_handle: org.instagram_handle || "",
          });
        }
      } catch (err) {
        console.error("Failed to load organization:", err);
      } finally {
        setInitialLoading(false);
      }
    };
    loadOrganization();
  }, []);

  const validateUrl = (url: string): boolean => {
    if (!url) return true;
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  const handleNext = async () => {
    // Validate current step
    const currentFields = steps[step - 1].fields;
    const newErrors: Record<string, string> = {};

    if (currentFields.includes("logo") && formData.logo && !validateUrl(formData.logo)) {
      newErrors.logo = "Please enter a valid URL";
    }
    if (currentFields.includes("website") && formData.website && !validateUrl(formData.website)) {
      newErrors.website = "Please enter a valid URL";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    if (step < 3) {
      setStep(step + 1);
    } else if (step === 3) {
      // Save all data
      setLoading(true);
      try {
        await updateOrganization({
          logo: formData.logo || undefined,
          tagline: formData.tagline || undefined,
          website: formData.website || undefined,
          instagram_handle: formData.instagram_handle || undefined,
        });
        setStep(4);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000);
      } catch (err: any) {
        alert(err.response?.data?.detail || "Failed to save organization");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleFinish = async () => {
    // Advance onboarding from S1 to S2 if in onboarding mode
    if (onboarding?.isOnboarding && onboarding?.currentStage === "S1") {
      await onboarding.advanceStage("S1", "S2");
    }
    router.push("/organizers/dashboard");
  };

  const handleClose = () => {
    router.push("/organizers/dashboard");
  };

  const handleInstagramChange = (val: string) => {
    let normalized = val.replace(/\s+/g, "").replace(/^@+/, "");
    setFormData({ ...formData, instagram_handle: normalized });
  };

  if (initialLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#0A0A0A]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#D4A574] to-[#2C2C2E] opacity-20 animate-pulse" />
          <p className="text-neutral-500 text-sm tracking-wider">Loading...</p>
        </motion.div>
      </div>
    );
  }

  const CurrentIcon = steps[step - 1].icon;

  return (
    <main className="relative min-h-screen w-full bg-[#0A0A0A] text-white overflow-hidden">
      <FloatingOrbs />
      <Confetti active={showConfetti} />

      {/* Noise texture overlay */}
      <div className="fixed inset-0 bg-[url('/noise.png')] bg-[length:200px] opacity-[0.03] pointer-events-none" />

      {/* Close button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={handleClose}
        className="fixed top-6 right-6 z-50 w-10 h-10 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.1] transition-all"
      >
        <X size={20} />
      </motion.button>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12">
        {/* Logo/Brand */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.05] border border-white/[0.08]">
            <div className="w-2 h-2 rounded-full bg-[#D4A574] shadow-[0_0_10px_#D4A574]" />
            <span className="text-sm font-medium text-white/70" style={{ fontFamily: "var(--font-mono)" }}>Organization Setup</span>
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
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4A574]/20 to-[#D4A574]/5 border border-[#D4A574]/20 text-[#D4A574] mb-6"
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <CurrentIcon size={32} strokeWidth={1.5} />
            </motion.div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3 tracking-tight" style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>
              {steps[step - 1].title}
            </h1>
            <p className="text-lg text-white/50 max-w-md" style={{ fontFamily: "var(--font-body)" }}>
              {steps[step - 1].subtitle}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Step content */}
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {/* STEP 1: Logo */}
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
                {/* Logo Preview */}
                <motion.div
                  data-onboarding="org-logo"
                  className="relative mx-auto w-32 h-32 rounded-2xl bg-white/[0.05] border-2 border-dashed border-white/20 flex items-center justify-center overflow-hidden group"
                  whileHover={{ scale: 1.02 }}
                >
                  {formData.logo ? (
                    <img
                      src={formData.logo}
                      alt="Organization Logo"
                      className="w-full h-full object-contain p-2"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <Building2 size={40} className="text-white/30" />
                  )}
                </motion.div>

                <OnboardingInput
                  label="Logo URL"
                  type="url"
                  placeholder="https://yourcompany.com/logo.png"
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  hint="Enter a URL to your organization's logo image"
                />
                {errors.logo && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm"
                  >
                    {errors.logo}
                  </motion.p>
                )}

                <div className="flex gap-3 pt-4">
                  <PrimaryButton onClick={handleNext} disabled={false}>
                    Continue <ArrowRight size={18} />
                  </PrimaryButton>
                </div>
                <button
                  onClick={handleNext}
                  className="w-full text-center text-sm text-white/40 hover:text-white/60 transition-colors"
                >
                  Skip for now
                </button>
              </motion.div>
            )}

            {/* STEP 2: Tagline */}
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
                <div data-onboarding="org-tagline">
                <OnboardingTextarea
                  label="Tagline"
                  placeholder="Creating unforgettable experiences..."
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  rows={3}
                  hint="A short description that captures your organization's essence"
                />
                </div>

                <div className="flex gap-3 pt-4">
                  <PrimaryButton onClick={handleBack} variant="secondary">
                    <ArrowLeft size={18} />
                  </PrimaryButton>
                  <PrimaryButton onClick={handleNext} disabled={false}>
                    Continue <ArrowRight size={18} />
                  </PrimaryButton>
                </div>
                <button
                  onClick={handleNext}
                  className="w-full text-center text-sm text-white/40 hover:text-white/60 transition-colors"
                >
                  Skip for now
                </button>
              </motion.div>
            )}

            {/* STEP 3: Website & Instagram */}
            {step === 3 && (
              <motion.div
                key="step3"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={pageTransition}
                className="space-y-6"
                data-onboarding="org-links"
              >
                <OnboardingInput
                  label="Website"
                  type="url"
                  placeholder="https://yourcompany.com"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  hint="Your organization's main website"
                />
                {errors.website && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm"
                  >
                    {errors.website}
                  </motion.p>
                )}

                <OnboardingInput
                  label="Instagram Handle"
                  type="text"
                  prefix="@"
                  placeholder="yourhandle"
                  value={formData.instagram_handle}
                  onChange={(e) => handleInstagramChange(e.target.value)}
                  hint="Your Instagram username without the @"
                />

                <div className="flex gap-3 pt-4">
                  <PrimaryButton onClick={handleBack} variant="secondary">
                    <ArrowLeft size={18} />
                  </PrimaryButton>
                  <PrimaryButton onClick={handleNext} loading={loading}>
                    Save & Finish <Check size={18} />
                  </PrimaryButton>
                </div>
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
                  className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-[#D4A574] to-[#2C2C2E]"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Check size={48} className="text-white" strokeWidth={3} />
                  </motion.div>
                </motion.div>

                <div>
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl font-bold mb-3"
                    style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
                  >
                    Organization Updated
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-lg text-white/50"
                  >
                    Your organization is ready to host amazing events
                  </motion.p>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <PrimaryButton onClick={handleFinish}>
                    Go to Dashboard <ArrowRight size={18} />
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
            You can always update these details later
          </motion.p>
        )}
      </div>
      {/* S1 Onboarding tooltips */}
      {isOnboarding && activeS1Tooltip && (
        <TooltipOverlay
          tooltip={activeS1Tooltip}
          onDismiss={() => {
            if (activeS1Tooltip?.onDismiss) activeS1Tooltip.onDismiss();
          }}
        />
      )}
    </main>
  );
}
