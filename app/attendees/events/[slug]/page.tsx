"use client";
export const dynamic = "force-dynamic";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  CheckCircle2,
  Share2,
  Ticket,
  Instagram,
  Users,
  Globe,
  Building2,
  ExternalLink,
  LogIn,
  X,
  AlertTriangle,
  XCircle,
  Loader2,
} from "lucide-react";
import {
  getEventById,
  getEventPasses,
  registerForEventWithDiscount,
  joinExistingRegistration,
  validateDiscountCode,
  getEventRegistrationQuestions,
  cancelRegistration,
  type DiscountValidationResult,
  type RegistrationQuestion,
} from "@/lib/api";
import { extractEventIdFromSlug } from "@/lib/utils";
import AddPlusOneSection from "@/components/attendees/AddPlusOneSection";
import PaymentSection from "@/components/attendees/PaymentSection";
import { toast } from "sonner";

interface EventOrganization {
  id: string;
  name: string | null;
  logo: string | null;
  instagram_handle: string | null;
  tagline: string | null;
  website: string | null;
}

interface EventDetail {
  id: string;
  name: string;
  cover?: string;
  date?: string;
  venue?: string;
  description?: string;
  organizer?: string;
  organizer_instagram?: string;
  organizer_profile_picture?: string;
  organization?: EventOrganization | null;
  user_registered?: boolean;
  registration?: {
    registration_id?: string;
    join_code?: string;
    pass?: { name: string; max_members: number };
    members?: { name: string }[];
    gender_mismatch?: boolean;
    status?: string;
    is_complete?: boolean;
    remaining_slots?: number;
  };
}

interface Pass {
  id: string;
  name: string;
  price?: number;
  type: string;
  description?: string;
  joinable: boolean;
  max_members: number;
}

export default function EventDetailPage() {
  const router = useRouter();
  const { slug } = useParams();
  const eventId = extractEventIdFromSlug(slug as string);

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [passes, setPasses] = useState<Pass[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState<"couple" | "join" | "discount" | "questions" | "success">("couple");
  const [selectedPass, setSelectedPass] = useState<Pass | null>(null);
  const [joinCode, setJoinCode] = useState("");
  const [createdJoinCode, setCreatedJoinCode] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const passesRef = useRef<HTMLDivElement | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [genderMismatchWarning, setGenderMismatchWarning] = useState(false);

  // Cancel & copy state for registration card
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Discount code state
  const [discountCode, setDiscountCode] = useState("");
  const [discountValidation, setDiscountValidation] = useState<DiscountValidationResult | null>(null);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [validatingDiscount, setValidatingDiscount] = useState(false);

  // Registration questions state
  const [registrationQuestions, setRegistrationQuestions] = useState<RegistrationQuestion[]>([]);
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, string | string[]>>({});
  const [questionErrors, setQuestionErrors] = useState<Record<string, string>>({});


  // Check authentication status on mount
  useEffect(() => {
    const token = localStorage.getItem("whispr_token");
    setIsAuthenticated(!!token);
  }, []);

  const handleSignInRedirect = () => {
    const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
    router.push(`/auth?role=attendee&redirect=${encodeURIComponent(currentPath)}`);
  };

  const handleShareRegistration = async () => {
    if (!event) return;
    const shareText = `Check out ${event.name}!${event.registration?.registration_id ? ` My registration code: ${event.registration.registration_id}` : ""}`;
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";

    if (navigator.share) {
      try {
        await navigator.share({
          title: event.name || "Event Registration",
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // cancelled
      }
    } else {
      window.open(
        `https://wa.me/?text=${encodeURIComponent(shareText + "\n" + shareUrl)}`,
        "_blank"
      );
    }
  };

  const handleCancelRegistration = async () => {
    if (!event?.registration?.registration_id) return;
    setCancelling(true);
    try {
      await cancelRegistration(event.registration.registration_id);
      const data = await getEventById(eventId);
      setEvent(data);
      setSuccessMsg("Registration cancelled");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch {
      setSuccessMsg("Failed to cancel registration");
      setTimeout(() => setSuccessMsg(null), 3000);
    } finally {
      setCancelling(false);
      setCancelConfirmOpen(false);
    }
  };

  const canCancelRegistration = (status?: string) => {
    if (!status) return false;
    const blocked = ["paid", "rejected", "cancelled"];
    return !blocked.includes(status.toLowerCase());
  };

  const registrationStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "text-[#D4A574] bg-[#D4A574]/10 border-[#D4A574]/20";
      case "pending":
      case "pending approval":
        return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case "rejected":
        return "text-red-400 bg-red-500/10 border-red-500/20";
      case "cancelled":
        return "text-neutral-400 bg-neutral-400/10 border-neutral-400/30";
      case "incomplete":
        return "text-orange-400 bg-orange-500/10 border-orange-500/20";
      default:
        return "text-[#D4A574] bg-[#D4A574]/10 border-[#D4A574]/20";
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const data = await getEventById(eventId);
        setEvent(data);
        const passData = await getEventPasses(eventId);
        // Hide guest passes from attendee ticket purchasing view
        const visiblePasses = passData.filter(
          (p: Pass) =>
            !p.type?.toLowerCase().includes("guest") &&
            !p.name?.toLowerCase().includes("guest")
        );
        setPasses(visiblePasses);
        // Fetch registration questions
        try {
          const questions = await getEventRegistrationQuestions(eventId);
          setRegistrationQuestions(questions);
        } catch (qErr) {
          // Questions endpoint might not exist yet or event has no questions
          console.log("No registration questions available");
        }
      } catch (err) {
        console.error("Failed to fetch event:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [eventId]);

  // Validate required questions before registration
  const validateQuestions = (): boolean => {
    const errors: Record<string, string> = {};

    registrationQuestions.forEach((q) => {
      if (q.is_required) {
        const answer = questionAnswers[q.id];
        if (!answer || (Array.isArray(answer) && answer.length === 0) || (typeof answer === "string" && !answer.trim())) {
          errors[q.id] = "This field is required";
        }
      }
    });

    setQuestionErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Convert answers to API format
  const formatAnswersForApi = () => {
    return Object.entries(questionAnswers)
      .filter(([_, value]) => value && (Array.isArray(value) ? value.length > 0 : value.trim()))
      .map(([questionId, answer]) => ({
        question_id: questionId,
        answer: Array.isArray(answer) ? answer.join(", ") : answer,
      }));
  };

  const handleRegister = async (passId: string, withDiscount?: string) => {
    if (!event) return;
    setRegistering(true);
    try {
      const answers = formatAnswersForApi();
      const res = await registerForEventWithDiscount(
        event.id,
        passId,
        withDiscount || (discountValidation ? discountCode : undefined),
        answers.length > 0 ? answers : undefined
      );
      const joinCode = res?.registration?.join_code || null;
      setGenderMismatchWarning(res?.registration?.gender_mismatch === true);
      setCreatedJoinCode(joinCode);
      setModalStep("success");
      setShowModal(true);
      setEvent((prev) =>
        prev ? { ...prev, user_registered: true, registration: res.registration } : prev
      );
      // Reset discount state on success
      setDiscountCode("");
      setDiscountValidation(null);
      setDiscountError(null);
      // Reset question answers on success
      setQuestionAnswers({});
      setQuestionErrors({});
    } catch (err: any) {
      setSuccessMsg(`Registration failed: ${err.message}`);
      setShowModal(false);
    } finally {
      setRegistering(false);
    }
  };

  const handleValidateDiscount = async () => {
    if (!event || !selectedPass || !discountCode.trim()) return;

    setValidatingDiscount(true);
    setDiscountError(null);
    setDiscountValidation(null);

    try {
      const result = await validateDiscountCode(event.id, selectedPass.id, discountCode.trim());
      setDiscountValidation(result);
    } catch (err: any) {
      setDiscountError(err.message || "Invalid discount code");
    } finally {
      setValidatingDiscount(false);
    }
  };

  const clearDiscount = () => {
    setDiscountCode("");
    setDiscountValidation(null);
    setDiscountError(null);
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    setRegistering(true);
    try {
      const res = await joinExistingRegistration(joinCode.trim());
      setGenderMismatchWarning(res?.registration?.gender_mismatch === true);
      setModalStep("success");
      setCreatedJoinCode(null);
      setEvent((prev) =>
        prev
          ? { ...prev, user_registered: true, registration: res?.registration || prev.registration }
          : prev
      );
    } catch (err: any) {
      setSuccessMsg(`Join failed: ${err.message}`);
      setShowModal(false);
    } finally {
      setRegistering(false);
    }
  };

  const clearQuestions = () => {
    setQuestionAnswers({});
    setQuestionErrors({});
  };

  const handlePassSelect = (pass: Pass) => {
    if (event?.user_registered) return;
    setSelectedPass(pass);
    setJoinCode("");
    setSuccessMsg(null);
    setCreatedJoinCode(null);
    clearDiscount();
    clearQuestions();

    const type = pass.type?.toLowerCase() || "";
    const isCouple = type.includes("couple") || pass.joinable || pass.max_members > 1;
    const hasPaidPrice = pass.price && pass.price > 0;
    const hasQuestions = registrationQuestions.length > 0;

    if (isCouple) {
      setModalStep("couple");
      setShowModal(true);
    } else if (hasQuestions) {
      // Show questions step first
      setModalStep("questions");
      setShowModal(true);
    } else if (hasPaidPrice) {
      // Show discount code option for paid passes
      setModalStep("discount");
      setShowModal(true);
    } else {
      // Free pass, register directly
      handleRegister(pass.id);
    }
  };

  const handleShare = async () => {
    if (!event) return;
    const shareData = {
      title: event.name,
      text: event.description || "Join me at this Whispr event.",
      url: typeof window !== "undefined" ? window.location.href : "",
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        setSuccessMsg("Event shared");
      } catch {
        /* ignore */
      }
    } else {
      navigator.clipboard
        .writeText(shareData.url)
        .then(() => setSuccessMsg("Link copied"))
        .catch(() => setSuccessMsg("Unable to copy link"));
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Date TBA";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  if (loading)
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#0A0A0A] text-white">
        {/* Background glows */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-1/4 -top-1/5 h-[55vh] w-[70vw] rounded-full blur-[160px] bg-[radial-gradient(circle_at_30%_30%,rgba(44,44,46,0.25),transparent_55%)]" />
          <div className="absolute -right-1/4 bottom-[-10%] h-[60vh] w-[70vw] rounded-full blur-[180px] bg-[radial-gradient(circle_at_70%_60%,rgba(212,165,116,0.3),transparent_60%)]" />
        </div>

        <div className="relative z-10 mx-auto flex max-w-2xl flex-col gap-6 px-4 pb-12 pt-6 sm:px-6">
          {/* Header skeleton */}
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-full bg-white/5 animate-pulse" />
            <div className="h-10 w-10 rounded-full bg-white/5 animate-pulse" />
          </div>

          {/* Organization skeleton */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="h-3 w-20 bg-white/5 rounded animate-pulse mb-4" />
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-2xl bg-white/5 animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-5 w-32 bg-white/5 rounded animate-pulse" />
                <div className="h-4 w-48 bg-white/5 rounded animate-pulse" />
                <div className="flex gap-2">
                  <div className="h-8 w-24 bg-white/5 rounded-full animate-pulse" />
                  <div className="h-8 w-20 bg-white/5 rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          {/* Event banner skeleton */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
            <div className="aspect-video w-full bg-white/5 animate-pulse" />
            <div className="p-4 space-y-3">
              <div className="h-7 w-3/4 bg-white/5 rounded animate-pulse" />
              <div className="flex gap-2">
                <div className="h-8 w-28 bg-white/5 rounded-full animate-pulse" />
                <div className="h-8 w-32 bg-white/5 rounded-full animate-pulse" />
              </div>
              <div className="space-y-2 pt-1">
                <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-white/5 rounded animate-pulse" />
              </div>
            </div>
          </div>

          {/* Passes skeleton */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="space-y-2">
                <div className="h-3 w-24 bg-white/5 rounded animate-pulse" />
                <div className="h-6 w-32 bg-white/5 rounded animate-pulse" />
              </div>
              <div className="h-7 w-16 bg-white/5 rounded-full animate-pulse" />
            </div>
            <div className="grid gap-3">
              {[1, 2].map((i) => (
                <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-white/5 animate-pulse" />
                      <div className="space-y-2">
                        <div className="h-5 w-24 bg-white/5 rounded animate-pulse" />
                        <div className="h-3 w-20 bg-white/5 rounded animate-pulse" />
                      </div>
                    </div>
                    <div className="h-8 w-20 bg-white/5 rounded-full animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );

  if (!event)
    return (
      <div className="h-screen flex flex-col items-center justify-center text-neutral-500 bg-[#0A0A0A]">
        <p>Event not found</p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-[#D4A574] underline"
        >
          go back
        </button>
      </div>
    );

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0A0A0A] text-white">
      {/* Background glows */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/5 h-[55vh] w-[70vw] rounded-full blur-[160px] bg-[radial-gradient(circle_at_30%_30%,rgba(44,44,46,0.25),transparent_55%)]" />
        <div className="absolute -right-1/4 bottom-[-10%] h-[60vh] w-[70vw] rounded-full blur-[180px] bg-[radial-gradient(circle_at_70%_60%,rgba(212,165,116,0.3),transparent_60%)]" />
        <div className="absolute inset-0 bg-[url('/noise.png')] bg-[length:240px_240px] opacity-[0.08] mix-blend-overlay" />
      </div>

      <motion.main
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
        className="relative z-10 mx-auto flex max-w-2xl flex-col gap-6 px-4 pb-12 pt-6 sm:px-6"
      >
        {/* Header with back button and share */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/40 backdrop-blur transition hover:border-[#D4A574]/60 hover:text-[#D4A574]"
          >
            <ArrowLeft size={18} />
          </button>
          <button
            onClick={handleShare}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/40 backdrop-blur transition hover:border-[#D4A574]/60 hover:text-[#D4A574]"
          >
            <Share2 size={18} />
          </button>
        </div>

        {/* SECTION 1: Organization / Organizer */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur"
        >
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-4" style={{ fontFamily: "var(--font-mono)" }}>Presented by</p>

          {/* Organization Info */}
          <div className="flex items-start gap-4">
            {/* Logo */}
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#D4A574]/20 to-[#2C2C2E]/20 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
              {event.organization?.logo ? (
                <img
                  src={event.organization.logo}
                  alt={event.organization.name || 'Organization'}
                  className="w-full h-full object-cover"
                />
              ) : event.organizer_profile_picture ? (
                <img
                  src={event.organizer_profile_picture}
                  alt={event.organizer || 'Organizer'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building2 size={28} className="text-white/50" />
              )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold" style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>
                {event.organization?.name || event.organizer || "Organizer"}
              </h3>

              {/* Tagline */}
              {event.organization?.tagline && (
                <p className="text-sm text-white/60 mt-1 line-clamp-2">
                  {event.organization.tagline}
                </p>
              )}

              {/* Links Row */}
              <div className="flex flex-wrap items-center gap-3 mt-3">
                {/* Instagram */}
                {(event.organization?.instagram_handle || event.organizer_instagram) && (
                  <a
                    href={`https://instagram.com/${(event.organization?.instagram_handle || event.organizer_instagram || '').replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-white/70 hover:text-[#D4A574] hover:border-[#D4A574]/30 transition-colors"
                  >
                    <Instagram size={14} />
                    <span>
                      {(event.organization?.instagram_handle || event.organizer_instagram || '').startsWith('@')
                        ? (event.organization?.instagram_handle || event.organizer_instagram)
                        : `@${event.organization?.instagram_handle || event.organizer_instagram}`}
                    </span>
                  </a>
                )}

                {/* Website */}
                {event.organization?.website && (
                  <a
                    href={event.organization.website.startsWith('http') ? event.organization.website : `https://${event.organization.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-white/70 hover:text-[#D4A574] hover:border-[#D4A574]/30 transition-colors"
                  >
                    <Globe size={14} />
                    <span>Website</span>
                    <ExternalLink size={12} className="opacity-50" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </motion.section>

        {/* SECTION 2: Event Banner & Info */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden backdrop-blur"
        >
          {/* Event Banner - Smaller, 16:9 aspect ratio */}
          <div className="aspect-video w-full overflow-hidden bg-black/30">
            <img
              src={event.cover || "/event-placeholder.jpg"}
              alt={event.name}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Event Details */}
          <div className="p-4 space-y-3">
            <h1
              className="text-2xl font-bold"
              style={{ fontFamily: "var(--font-display)", fontWeight: 700, textShadow: "0 0 20px rgba(212,165,116,0.15)" }}
            >
              {event.name}
            </h1>

            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/70">
                <Calendar size={14} className="text-[#D4A574]" />
                {formatDate(event.date)}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/70">
                <MapPin size={14} className="text-[#D4A574]" />
                {event.venue || "Venue TBA"}
              </span>
            </div>

            {event.description && (
              <p className="text-sm text-white/60 leading-relaxed pt-1">
                {event.description}
              </p>
            )}
          </div>
        </motion.section>

        {/* SECTION 3: Passes - Main CTA */}
        <motion.section
          ref={passesRef}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between px-1">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40" style={{ fontFamily: "var(--font-mono)" }}>Apply for a Pass</p>
              <h2 className="text-xl font-semibold" style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>Request Entry</h2>
            </div>
            {isAuthenticated && !event.user_registered && passes.length > 0 && (
              <span className="rounded-full bg-[#D4A574]/20 border border-[#D4A574]/30 px-3 py-1 text-xs font-medium text-[#D4A574]">
                Open
              </span>
            )}
          </div>

          {/* Sign in prompt for unauthenticated users */}
          {!isAuthenticated && !event.user_registered && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur">
              <div className="text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#D4A574]/20 to-[#D4A574]/5 border border-[#D4A574]/20">
                  <LogIn size={24} className="text-[#D4A574]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1" style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>Sign in to view passes</h3>
                  <p className="text-sm text-white/50">
                    Create an account or sign in to see available passes and request entry to this event.
                  </p>
                </div>
                <button
                  onClick={handleSignInRedirect}
                  className="w-full rounded-lg bg-[#D4A574] px-5 py-3 text-base font-semibold text-[#0A0A0A] hover:bg-[#B8785C] transition"
                >
                  Sign In or Create Account
                </button>
              </div>
            </div>
          )}

          {/* Gated Event Explainer - only show for authenticated users */}
          {isAuthenticated && !event.user_registered && passes.length > 0 && (
            <div className="rounded-xl bg-white/[0.02] border border-white/5 px-4 py-3">
              <p className="text-xs text-white/50 leading-relaxed">
                This is an invite-only event. Select a pass to apply — the organizer will review your profile and approve your request. Once approved, you'll receive a payment link.
              </p>
            </div>
          )}

          {/* Pass list - only show for authenticated users */}
          {isAuthenticated && !event.user_registered && passes.length > 0 && (
            <div className="grid gap-3">
              {passes.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handlePassSelect(p)}
                  disabled={registering}
                  className="group relative flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition-all hover:border-[#D4A574]/50 hover:bg-white/[0.05] disabled:opacity-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#D4A574]/20 to-[#D4A574]/5 border border-[#D4A574]/20 group-hover:border-[#D4A574]/40 transition-colors">
                      <Ticket size={20} className="text-[#D4A574]" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white group-hover:text-[#D4A574] transition-colors">{p.type}</h3>
                      {p.max_members > 1 && (
                        <p className="text-xs text-white/50 mt-0.5">Includes {p.max_members} entries</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="rounded-lg bg-white/10 px-4 py-1.5 text-sm font-semibold text-white group-hover:bg-[#D4A574] group-hover:text-[#0A0A0A] transition-colors">
                      {p.price ? `PKR ${p.price.toLocaleString()}` : "Free"}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No passes available - only show for authenticated users */}
          {isAuthenticated && !event.user_registered && passes.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center text-sm text-white/50">
              No passes available yet. Check back soon.
            </div>
          )}
        </motion.section>

        {/* Already Registered — Application Card */}
        {event.user_registered && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-[#2C2C2E] bg-[#1C1C1E] overflow-hidden"
          >
            <div className="p-4">
              {/* Header row */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <CheckCircle2 className="text-[#D4A574] flex-shrink-0" size={20} />
                  <h3 className="font-semibold text-sm">You&apos;re Registered</h3>
                </div>

                {event.registration?.status && (
                  <span
                    className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium capitalize border ${registrationStatusColor(event.registration.status)}`}
                  >
                    {event.registration.status}
                  </span>
                )}
              </div>

              {event.registration ? (
                <>
                  {/* Gender mismatch warning */}
                  {event.registration.gender_mismatch && (
                    <div className="mb-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
                      <AlertTriangle size={11} />
                      Gender mismatch
                    </div>
                  )}

                  {/* Pass info row */}
                  {event.registration.pass?.name && (
                    <div className="flex items-center justify-between py-2.5 border-t border-white/[0.06] mb-3">
                      <div>
                        <span className="text-[10px] text-neutral-500 uppercase tracking-wider">
                          Pass
                        </span>
                        <p className="text-xs font-medium">{event.registration.pass.name}</p>
                      </div>
                    </div>
                  )}

                  {/* Member progress for couple/group passes */}
                  {event.registration.pass && event.registration.pass.max_members > 1 && (
                    <div className="space-y-2.5 rounded-xl border border-white/[0.06] bg-black/20 p-3 mb-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-500">Members Joined</span>
                        <span className="font-medium">
                          {event.registration.members?.length ?? 1} / {event.registration.pass.max_members}
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#D4A574] transition-all duration-500"
                          style={{
                            width: `${((event.registration.members?.length ?? 1) / event.registration.pass.max_members) * 100}%`
                          }}
                        />
                      </div>
                      {event.registration.members && event.registration.members.length < event.registration.pass.max_members && (
                        <p className="text-[11px] text-amber-400/80">
                          Waiting for {event.registration.pass.max_members - event.registration.members.length} more {event.registration.pass.max_members - event.registration.members.length === 1 ? "person" : "people"} to join
                        </p>
                      )}
                    </div>
                  )}

                  {/* Add your +1 section */}
                  {event.registration.is_complete === false && (event.registration.remaining_slots ?? 0) > 0 && event.registration.join_code && (
                    <AddPlusOneSection
                      registrationId={event.registration.registration_id!}
                      joinCode={event.registration.join_code}
                      onGuestAdded={async () => {
                        const data = await getEventById(eventId);
                        setEvent(data);
                      }}
                    />
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleShareRegistration}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/[0.04] hover:bg-[#D4A574]/[0.08] border border-white/[0.06] hover:border-[#D4A574]/20 text-xs font-medium transition-all duration-300"
                    >
                      <Share2 size={12} />
                      Share
                    </button>
                    {canCancelRegistration(event.registration.status) && (
                      <button
                        onClick={() => setCancelConfirmOpen(true)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-red-400/70 hover:text-red-400 hover:bg-red-500/5 transition-colors"
                      >
                        <XCircle size={12} />
                        Cancel
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-sm text-white/60">Your registration is being processed.</p>
              )}
            </div>
          </motion.section>
        )}

        {/* Payment Section — shown when approved + unpaid */}
        {event.user_registered &&
          event.registration?.status?.toLowerCase() === "approved" &&
          event.registration?.registration_id && (
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <PaymentSection
                registrationId={event.registration.registration_id}
                eventId={event.id}
              />
            </motion.section>
          )}

        {/* Payment Expired State */}
        {event.user_registered &&
          event.registration?.status?.toLowerCase() === "payment_expired" && (
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/10 bg-[#1C1C1E] p-5"
            >
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
                    Your spot for {event.name} has been released.
                  </p>
                </div>
                <button
                  onClick={() => router.push("/attendees/dashboard")}
                  className="px-6 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-sm text-white/70 hover:bg-white/[0.1] transition-all"
                >
                  Browse Events
                </button>
              </div>
            </motion.section>
          )}

        {/* Success Message Toast */}
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 rounded-full border border-[#D4A574]/30 bg-[#D4A574]/10 backdrop-blur-lg px-5 py-2 text-sm text-[#D4A574]"
            >
              {successMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Gender Mismatch Warning */}
        <AnimatePresence>
          {genderMismatchWarning && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-xl rounded-2xl border border-amber-500/30 bg-amber-500/10 backdrop-blur-lg px-4 py-3 text-sm text-amber-200 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)]"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/20 text-amber-300">
                  <AlertTriangle size={16} />
                </div>
                <div className="flex-1 text-amber-100/90">
                  We noticed your CNIC gender doesn’t match the pass type. Your registration is still valid and will be reviewed.
                </div>
                <button
                  onClick={() => setGenderMismatchWarning(false)}
                  className="text-amber-200/70 hover:text-amber-100 transition-colors"
                  aria-label="Dismiss warning"
                >
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cancel Registration Confirmation Modal */}
        <AnimatePresence>
          {cancelConfirmOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                onClick={() => !cancelling && setCancelConfirmOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
              >
                <div className="w-full max-w-sm rounded-2xl border border-[#2C2C2E] bg-[#1C1C1E]/95 backdrop-blur-xl p-5 shadow-2xl shadow-black/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-red-500/10 flex items-center justify-center">
                      <XCircle size={18} className="text-red-400" />
                    </div>
                    <h3 className="font-semibold">Cancel Registration</h3>
                  </div>
                  <p className="text-sm text-neutral-400 mb-5">
                    Are you sure? You can re-register afterwards if you&apos;d like.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCancelConfirmOpen(false)}
                      disabled={cancelling}
                      className="flex-1 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] border border-[#2C2C2E] text-sm font-medium transition-all disabled:opacity-50"
                    >
                      Keep It
                    </button>
                    <button
                      onClick={handleCancelRegistration}
                      disabled={cancelling}
                      className="flex-1 py-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/20 text-sm font-medium text-red-400 transition-all disabled:opacity-50"
                    >
                      {cancelling ? "Cancelling..." : "Yes, Cancel"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.main>

      {/* Modal */}
      <AnimatePresence>
        {showModal && selectedPass && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm px-4 pb-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0a0a0a] p-6 shadow-[0_25px_120px_-40px_rgba(0,0,0,0.8)]"
            >
              {modalStep === "couple" && (
                <>
                  <div className="text-center mb-6">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D4A574]/20 to-[#D4A574]/5 border border-[#D4A574]/20">
                      <Users size={28} className="text-[#D4A574]" />
                    </div>
                    <h2 className="text-xl font-semibold" style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>Couple Pass</h2>
                    <p className="mt-2 text-sm text-white/60">
                      Includes {selectedPass.max_members} entries. One person starts the pass and invites their partner.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        if (registrationQuestions.length > 0) {
                          setModalStep("questions");
                        } else {
                          handleRegister(selectedPass.id);
                        }
                      }}
                      disabled={registering}
                      className="w-full rounded-lg bg-[#D4A574] px-5 py-3.5 text-base font-semibold text-[#0A0A0A] hover:bg-[#B8785C] transition disabled:opacity-50"
                    >
                      {registering ? "Processing..." : "Start Couple Pass"}
                    </button>
                    <button
                      onClick={() => setModalStep("join")}
                      className="w-full rounded-full border border-white/15 bg-white/5 px-5 py-3.5 text-sm text-white/80 transition hover:border-[#D4A574]/60 hover:bg-white/10"
                    >
                      Join Partner's Link
                    </button>
                    <button
                      onClick={() => setShowModal(false)}
                      className="w-full py-2 text-sm text-white/50 transition hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}

              {modalStep === "join" && (
                <>
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-semibold" style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>Join Partner</h2>
                    <p className="mt-2 text-sm text-white/60">
                      Enter the join code shared by your partner.
                    </p>
                  </div>
                  <input
                    type="text"
                    placeholder="REG-COU-XXXXX"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-center text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#D4A574]/50"
                  />
                  <div className="mt-5 space-y-3">
                    <button
                      onClick={handleJoin}
                      disabled={registering || !joinCode.trim()}
                      className="w-full rounded-lg bg-[#D4A574] px-5 py-3.5 text-base font-semibold text-[#0A0A0A] hover:bg-[#B8785C] transition disabled:opacity-50"
                    >
                      {registering ? "Joining..." : "Join Partner"}
                    </button>
                    <button
                      onClick={() => setModalStep("couple")}
                      className="w-full py-2 text-sm text-white/50 transition hover:text-white"
                    >
                      Back
                    </button>
                  </div>
                </>
              )}

              {modalStep === "discount" && (
                <>
                  <div className="text-center mb-6">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D4A574]/20 to-[#D4A574]/5 border border-[#D4A574]/20">
                      <Ticket size={28} className="text-[#D4A574]" />
                    </div>
                    <h2 className="text-xl font-semibold" style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>{selectedPass.type}</h2>
                    <p className="mt-2 text-sm text-white/60">
                      {selectedPass.price ? `PKR ${selectedPass.price.toLocaleString()}` : "Free"}
                    </p>
                  </div>

                  {/* Discount code input */}
                  <div className="mb-5 space-y-3">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Have a discount code?"
                        value={discountCode}
                        onChange={(e) => {
                          setDiscountCode(e.target.value.toUpperCase());
                          setDiscountError(null);
                          setDiscountValidation(null);
                        }}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder:text-white/30 font-mono tracking-wide focus:outline-none focus:ring-2 focus:ring-[#D4A574]/50 pr-24"
                      />
                      {discountCode && !discountValidation && (
                        <button
                          onClick={handleValidateDiscount}
                          disabled={validatingDiscount}
                          className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-white/10 text-xs font-medium text-white/70 hover:bg-white/20 transition disabled:opacity-50"
                        >
                          {validatingDiscount ? "..." : "Apply"}
                        </button>
                      )}
                      {discountValidation && (
                        <button
                          onClick={clearDiscount}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-white/10 text-white/50 hover:text-white hover:bg-white/20 transition"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>

                    {/* Discount error */}
                    {discountError && (
                      <p className="text-sm text-red-400 text-center">{discountError}</p>
                    )}

                    {/* Discount applied - price breakdown */}
                    {discountValidation && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl border border-[#D4A574]/20 bg-[#D4A574]/5 p-4 space-y-2"
                      >
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/50">Original price</span>
                          <span className="text-white/70">PKR {discountValidation.original_price.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#D4A574]">Discount ({discountCode})</span>
                          <span className="text-[#D4A574]">-PKR {discountValidation.discount_amount.toLocaleString()}</span>
                        </div>
                        <div className="border-t border-white/10 pt-2 flex items-center justify-between">
                          <span className="text-white font-medium">Final price</span>
                          <span className="text-white font-semibold text-lg">
                            {discountValidation.final_price === 0
                              ? "Free"
                              : `PKR ${discountValidation.final_price.toLocaleString()}`}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => handleRegister(selectedPass.id)}
                      disabled={registering}
                      className="w-full rounded-lg bg-[#D4A574] px-5 py-3.5 text-base font-semibold text-[#0A0A0A] hover:bg-[#B8785C] transition disabled:opacity-50"
                    >
                      {registering ? "Processing..." : "Request Entry"}
                    </button>
                    <button
                      onClick={() => {
                        setShowModal(false);
                        clearDiscount();
                      }}
                      className="w-full py-2 text-sm text-white/50 transition hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}

              {modalStep === "questions" && (
                <>
                  <div className="text-center mb-6">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D4A574]/20 to-[#D4A574]/5 border border-[#D4A574]/20">
                      <Ticket size={28} className="text-[#D4A574]" />
                    </div>
                    <h2 className="text-xl font-semibold" style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>Additional Information</h2>
                    <p className="mt-2 text-sm text-white/60">
                      Please answer a few questions to complete your registration
                    </p>
                  </div>

                  {/* Questions form */}
                  <div className="space-y-4 max-h-[40vh] overflow-y-auto mb-5 pr-1">
                    {registrationQuestions.map((question) => (
                      <div key={question.id} className="space-y-2">
                        <label className="block text-sm font-medium text-white/80">
                          {question.question_text}
                          {question.is_required && (
                            <span className="text-amber-400 ml-1">*</span>
                          )}
                        </label>

                        {/* Text input */}
                        {question.question_type === "text" && (
                          <input
                            type="text"
                            value={(questionAnswers[question.id] as string) || ""}
                            onChange={(e) =>
                              setQuestionAnswers({
                                ...questionAnswers,
                                [question.id]: e.target.value,
                              })
                            }
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#D4A574]/50 text-sm"
                            placeholder="Your answer"
                          />
                        )}

                        {/* Textarea */}
                        {question.question_type === "textarea" && (
                          <textarea
                            value={(questionAnswers[question.id] as string) || ""}
                            onChange={(e) =>
                              setQuestionAnswers({
                                ...questionAnswers,
                                [question.id]: e.target.value,
                              })
                            }
                            rows={3}
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#D4A574]/50 text-sm resize-none"
                            placeholder="Your answer"
                          />
                        )}

                        {/* Number input */}
                        {question.question_type === "number" && (
                          <input
                            type="number"
                            value={(questionAnswers[question.id] as string) || ""}
                            onChange={(e) =>
                              setQuestionAnswers({
                                ...questionAnswers,
                                [question.id]: e.target.value,
                              })
                            }
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#D4A574]/50 text-sm"
                            placeholder="0"
                          />
                        )}

                        {/* Select dropdown */}
                        {question.question_type === "select" && question.options_json && (
                          <select
                            value={(questionAnswers[question.id] as string) || ""}
                            onChange={(e) =>
                              setQuestionAnswers({
                                ...questionAnswers,
                                [question.id]: e.target.value,
                              })
                            }
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#D4A574]/50 text-sm appearance-none cursor-pointer"
                          >
                            <option value="" className="bg-[#0a0a0a]">
                              Select an option
                            </option>
                            {question.options_json.map((option, idx) => (
                              <option key={idx} value={option} className="bg-[#0a0a0a]">
                                {option}
                              </option>
                            ))}
                          </select>
                        )}

                        {/* Multi-select checkboxes */}
                        {question.question_type === "multiselect" && question.options_json && (
                          <div className="space-y-2">
                            {question.options_json.map((option, idx) => {
                              const selectedOptions = (questionAnswers[question.id] as string[]) || [];
                              const isChecked = selectedOptions.includes(option);
                              return (
                                <label
                                  key={idx}
                                  className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5 cursor-pointer hover:bg-white/[0.08] transition-colors"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      const newOptions = e.target.checked
                                        ? [...selectedOptions, option]
                                        : selectedOptions.filter((o) => o !== option);
                                      setQuestionAnswers({
                                        ...questionAnswers,
                                        [question.id]: newOptions,
                                      });
                                    }}
                                    className="w-4 h-4 rounded border-white/30 bg-white/10 text-[#D4A574] focus:ring-[#D4A574]/50"
                                  />
                                  <span className="text-sm text-white/80">{option}</span>
                                </label>
                              );
                            })}
                          </div>
                        )}

                        {/* Single checkbox */}
                        {question.question_type === "checkbox" && (
                          <label className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5 cursor-pointer hover:bg-white/[0.08] transition-colors">
                            <input
                              type="checkbox"
                              checked={(questionAnswers[question.id] as string) === "yes"}
                              onChange={(e) =>
                                setQuestionAnswers({
                                  ...questionAnswers,
                                  [question.id]: e.target.checked ? "yes" : "",
                                })
                              }
                              className="w-4 h-4 rounded border-white/30 bg-white/10 text-[#D4A574] focus:ring-[#D4A574]/50"
                            />
                            <span className="text-sm text-white/80">Yes</span>
                          </label>
                        )}

                        {/* Yes/No toggle */}
                        {question.question_type === "yesno" && (
                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                setQuestionAnswers({
                                  ...questionAnswers,
                                  [question.id]: "yes",
                                })
                              }
                              className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${
                                questionAnswers[question.id] === "yes"
                                  ? "bg-[#D4A574]/20 border-[#D4A574]/50 text-[#D4A574]"
                                  : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                              }`}
                            >
                              Yes
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setQuestionAnswers({
                                  ...questionAnswers,
                                  [question.id]: "no",
                                })
                              }
                              className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${
                                questionAnswers[question.id] === "no"
                                  ? "bg-red-500/20 border-red-500/50 text-red-400"
                                  : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                              }`}
                            >
                              No
                            </button>
                          </div>
                        )}

                        {/* File upload note */}
                        {question.question_type === "file" && (
                          <div className="p-4 rounded-xl border border-white/10 bg-white/5 text-center">
                            <p className="text-sm text-white/50">
                              File uploads will be requested after registration approval
                            </p>
                          </div>
                        )}

                        {/* Error message */}
                        {questionErrors[question.id] && (
                          <p className="text-xs text-red-400">{questionErrors[question.id]}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        if (validateQuestions()) {
                          const hasPaidPrice = selectedPass.price && selectedPass.price > 0;
                          if (hasPaidPrice) {
                            setModalStep("discount");
                          } else {
                            handleRegister(selectedPass.id);
                          }
                        }
                      }}
                      disabled={registering}
                      className="w-full rounded-lg bg-[#D4A574] px-5 py-3.5 text-base font-semibold text-[#0A0A0A] hover:bg-[#B8785C] transition disabled:opacity-50"
                    >
                      {registering ? "Processing..." : selectedPass.price && selectedPass.price > 0 ? "Continue" : "Request Entry"}
                    </button>
                    <button
                      onClick={() => {
                        setShowModal(false);
                        clearQuestions();
                      }}
                      className="w-full py-2 text-sm text-white/50 transition hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}

              {modalStep === "success" && (
                <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="text-center mb-6">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#D4A574]/20 border border-[#D4A574]/30">
                      <CheckCircle2 className="text-[#D4A574]" size={32} />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2" style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>You've Registered!</h3>
                    <p className="text-sm text-white/60 leading-relaxed">
                      The organizer will review your details. Once accepted, you'll be able to make the payment. Keep an eye on your WhatsApp for a message from us.
                    </p>
                  </div>

                  {createdJoinCode && selectedPass && (selectedPass.type?.toLowerCase().includes('couple') || selectedPass.joinable) && (
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4 mb-5 space-y-3">
                      <p className="text-sm text-white/60 text-center">Share this code with your partner:</p>
                      <p
                        onClick={() => navigator.clipboard.writeText(createdJoinCode)}
                        className="text-center font-mono text-lg text-[#D4A574] cursor-pointer hover:text-white transition"
                      >
                        {createdJoinCode}
                      </p>
                      <button
                        onClick={() =>
                          window.open(
                            `https://wa.me/?text=Join%20my%20Whispr%20event%20group%20with%20this%20code:%20${createdJoinCode}`,
                            "_blank"
                          )
                        }
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#D4A574]/40 px-4 py-2 text-sm font-medium text-[#D4A574] transition hover:bg-[#D4A574]/10"
                      >
                        <Share2 size={14} />
                        Share via WhatsApp
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => setShowModal(false)}
                    className="w-full rounded-lg bg-[#D4A574] px-5 py-3.5 text-base font-semibold text-[#0A0A0A] hover:bg-[#B8785C] transition"
                  >
                    Got it
                  </button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
