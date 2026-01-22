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
  Copy,
  Share2,
  Ticket,
  Instagram,
  Users,
  Globe,
  Building2,
  ExternalLink,
} from "lucide-react";
import {
  getEventById,
  getEventPasses,
  registerForEvent,
  joinExistingRegistration,
} from "@/lib/api";
import { extractEventIdFromSlug } from "@/lib/utils";

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
    join_code?: string;
    pass?: { name: string; max_members: number };
    members?: { name: string }[];
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
  const [modalStep, setModalStep] = useState<"couple" | "join" | "success">("couple");
  const [selectedPass, setSelectedPass] = useState<Pass | null>(null);
  const [joinCode, setJoinCode] = useState("");
  const [createdJoinCode, setCreatedJoinCode] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const passesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getEventById(eventId);
        setEvent(data);
        const passData = await getEventPasses(eventId);
        setPasses(passData);
      } catch (err) {
        console.error("Failed to fetch event:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [eventId]);

  const handleRegister = async (passId: string) => {
    if (!event) return;
    setRegistering(true);
    try {
      const res = await registerForEvent(event.id, passId);
      const joinCode = res?.registration?.join_code || null;
      setCreatedJoinCode(joinCode);
      setModalStep("success");
      setShowModal(true);
      setEvent((prev) =>
        prev ? { ...prev, user_registered: true, registration: res.registration } : prev
      );
    } catch (err: any) {
      setSuccessMsg(`Registration failed: ${err.message}`);
      setShowModal(false);
    } finally {
      setRegistering(false);
    }
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    setRegistering(true);
    try {
      await joinExistingRegistration(joinCode.trim());
      setModalStep("success");
      setCreatedJoinCode(null);
      setEvent((prev) => (prev ? { ...prev, user_registered: true } : prev));
    } catch (err: any) {
      setSuccessMsg(`Join failed: ${err.message}`);
      setShowModal(false);
    } finally {
      setRegistering(false);
    }
  };

  const handlePassSelect = (pass: Pass) => {
    if (event?.user_registered) return;
    setSelectedPass(pass);
    setJoinCode("");
    setSuccessMsg(null);
    setCreatedJoinCode(null);

    const type = pass.type?.toLowerCase() || "";
    const isCouple = type.includes("couple") || pass.joinable || pass.max_members > 1;

    if (isCouple) {
      setModalStep("couple");
      setShowModal(true);
    } else {
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
      <div className="h-screen flex items-center justify-center text-neutral-400 animate-pulse bg-[#040404]">
        loading event...
      </div>
    );

  if (!event)
    return (
      <div className="h-screen flex flex-col items-center justify-center text-neutral-500 bg-[#040404]">
        <p>Event not found</p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-[#C1FF72] underline"
        >
          go back
        </button>
      </div>
    );

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#040404] text-white font-satoshi">
      {/* Background glows */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/5 h-[55vh] w-[70vw] rounded-full blur-[160px] bg-[radial-gradient(circle_at_30%_30%,rgba(180,114,255,0.25),transparent_55%)]" />
        <div className="absolute -right-1/4 bottom-[-10%] h-[60vh] w-[70vw] rounded-full blur-[180px] bg-[radial-gradient(circle_at_70%_60%,rgba(200,255,90,0.3),transparent_60%)]" />
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
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/40 backdrop-blur transition hover:border-[#C8FF5A]/60 hover:text-[#C8FF5A]"
          >
            <ArrowLeft size={18} />
          </button>
          <button
            onClick={handleShare}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/40 backdrop-blur transition hover:border-[#C8FF5A]/60 hover:text-[#C8FF5A]"
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
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-4">Presented by</p>

          {/* Organization Info */}
          <div className="flex items-start gap-4">
            {/* Logo */}
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#C1FF72]/20 to-[#6C2DFF]/20 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
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
              <h3 className="text-lg font-bold">
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
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-white/70 hover:text-[#C1FF72] hover:border-[#C1FF72]/30 transition-colors"
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
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-white/70 hover:text-[#C1FF72] hover:border-[#C1FF72]/30 transition-colors"
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
              style={{ textShadow: "0 0 20px rgba(200,255,90,0.15)" }}
            >
              {event.name}
            </h1>

            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/70">
                <Calendar size={14} className="text-[#C8FF5A]" />
                {formatDate(event.date)}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/70">
                <MapPin size={14} className="text-[#C8FF5A]" />
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
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Apply for a Pass</p>
              <h2 className="text-xl font-semibold">Request Entry</h2>
            </div>
            {!event.user_registered && passes.length > 0 && (
              <span className="rounded-full bg-[#C1FF72]/20 border border-[#C1FF72]/30 px-3 py-1 text-xs font-medium text-[#C1FF72]">
                Open
              </span>
            )}
          </div>

          {/* Gated Event Explainer */}
          {!event.user_registered && passes.length > 0 && (
            <div className="rounded-xl bg-white/[0.02] border border-white/5 px-4 py-3">
              <p className="text-xs text-white/50 leading-relaxed">
                This is an invite-only event. Select a pass to apply — the organizer will review your profile and approve your request. Once approved, you'll receive a payment link.
              </p>
            </div>
          )}

          {!event.user_registered && passes.length > 0 && (
            <div className="grid gap-3">
              {passes.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handlePassSelect(p)}
                  disabled={registering}
                  className="group relative flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition-all hover:border-[#C8FF5A]/50 hover:bg-white/[0.05] disabled:opacity-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#C8FF5A]/20 to-[#C8FF5A]/5 border border-[#C8FF5A]/20 group-hover:border-[#C8FF5A]/40 transition-colors">
                      <Ticket size={20} className="text-[#C8FF5A]" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white group-hover:text-[#C8FF5A] transition-colors">{p.type}</h3>
                      {p.max_members > 1 && (
                        <p className="text-xs text-white/50 mt-0.5">Includes {p.max_members} entries</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white group-hover:bg-[#C8FF5A] group-hover:text-black transition-colors">
                      {p.price ? `PKR ${p.price.toLocaleString()}` : "Free"}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {!event.user_registered && passes.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center text-sm text-white/50">
              No passes available yet. Check back soon.
            </div>
          )}
        </motion.section>

        {/* Already Registered */}
        {event.user_registered && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-[#C1FF72]/30 bg-[#C1FF72]/5 p-5 backdrop-blur"
          >
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle2 className="text-[#C1FF72]" size={24} />
              <h3 className="text-lg font-semibold">You're Registered</h3>
            </div>

            {event.registration ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Pass</span>
                  <span className="font-medium">{event.registration.pass?.name}</span>
                </div>

                {event.registration.join_code && event.registration.pass?.max_members && event.registration.pass.max_members > 1 && (
                  <div className="rounded-xl border border-white/10 bg-black/20 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-white/50">Join Code</p>
                        <p
                          onClick={() =>
                            navigator.clipboard.writeText(event.registration?.join_code || "")
                          }
                          className="font-mono text-[#C8FF5A] cursor-pointer hover:text-white transition"
                        >
                          {event.registration.join_code}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          navigator.clipboard.writeText(event.registration?.join_code || "")
                        }
                        className="rounded-full border border-white/15 p-2 text-white/70 transition hover:border-[#C8FF5A]/60 hover:text-[#C8FF5A]"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                    <button
                      onClick={() =>
                        window.open(
                          `https://wa.me/?text=Join%20my%20Whispr%20event%20group%20with%20this%20code:%20${event.registration?.join_code ?? ""}`,
                          "_blank"
                        )
                      }
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#C8FF5A]/40 px-4 py-2 text-sm font-medium text-[#C8FF5A] transition hover:bg-[#C8FF5A]/10"
                    >
                      <Share2 size={14} />
                      Invite via WhatsApp
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-white/60">Your registration is being processed.</p>
            )}
          </motion.section>
        )}

        {/* Success Message Toast */}
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 rounded-full border border-[#C8FF5A]/30 bg-[#C8FF5A]/10 backdrop-blur-lg px-5 py-2 text-sm text-[#C8FF5A]"
            >
              {successMsg}
            </motion.div>
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
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#C8FF5A]/20 to-[#C8FF5A]/5 border border-[#C8FF5A]/20">
                      <Users size={28} className="text-[#C8FF5A]" />
                    </div>
                    <h2 className="text-xl font-semibold">Couple Pass</h2>
                    <p className="mt-2 text-sm text-white/60">
                      Includes {selectedPass.max_members} entries. One person starts the pass and invites their partner.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <button
                      onClick={() => handleRegister(selectedPass.id)}
                      disabled={registering}
                      className="w-full rounded-full bg-[#C8FF5A] px-5 py-3.5 text-base font-semibold text-black shadow-[0_18px_50px_-18px_rgba(200,255,90,0.5)] transition hover:scale-[1.01] disabled:opacity-50"
                    >
                      {registering ? "Processing..." : "Start Couple Pass"}
                    </button>
                    <button
                      onClick={() => setModalStep("join")}
                      className="w-full rounded-full border border-white/15 bg-white/5 px-5 py-3.5 text-sm text-white/80 transition hover:border-[#C8FF5A]/60 hover:bg-white/10"
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
                    <h2 className="text-xl font-semibold">Join Partner</h2>
                    <p className="mt-2 text-sm text-white/60">
                      Enter the join code shared by your partner.
                    </p>
                  </div>
                  <input
                    type="text"
                    placeholder="REG-COU-XXXXX"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-center text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#C8FF5A]/50"
                  />
                  <div className="mt-5 space-y-3">
                    <button
                      onClick={handleJoin}
                      disabled={registering || !joinCode.trim()}
                      className="w-full rounded-full bg-[#C8FF5A] px-5 py-3.5 text-base font-semibold text-black shadow-[0_18px_50px_-18px_rgba(200,255,90,0.5)] transition hover:scale-[1.01] disabled:opacity-50"
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

              {modalStep === "success" && (
                <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="text-center mb-6">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#C8FF5A]/20 border border-[#C8FF5A]/30">
                      <CheckCircle2 className="text-[#C8FF5A]" size={32} />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">You've Registered!</h3>
                    <p className="text-sm text-white/60 leading-relaxed">
                      The organizer will review your details. Once accepted, you'll be able to make the payment. Keep an eye on your WhatsApp for a message from us.
                    </p>
                  </div>

                  {createdJoinCode && selectedPass && selectedPass.max_members > 1 && (
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4 mb-5 space-y-3">
                      <p className="text-sm text-white/60 text-center">Share this code with your partner:</p>
                      <p
                        onClick={() => navigator.clipboard.writeText(createdJoinCode)}
                        className="text-center font-mono text-lg text-[#C8FF5A] cursor-pointer hover:text-white transition"
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
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#C8FF5A]/40 px-4 py-2 text-sm font-medium text-[#C8FF5A] transition hover:bg-[#C8FF5A]/10"
                      >
                        <Share2 size={14} />
                        Share via WhatsApp
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => setShowModal(false)}
                    className="w-full rounded-full bg-[#C8FF5A] px-5 py-3.5 text-base font-semibold text-black shadow-[0_18px_50px_-18px_rgba(200,255,90,0.5)] transition hover:scale-[1.01]"
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
