"use client";
export const dynamic = "force-dynamic";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  LogIn,
  CheckCircle2,
  Copy,
  Share2,
  Ticket,
  Sparkles,
  Shield,
} from "lucide-react";
import {
  getEventById,
  getEventPasses,
  registerForEvent,
  joinExistingRegistration,
} from "@/lib/api";

interface EventDetail {
  id: string;
  name: string;
  cover?: string;
  date?: string;
  venue?: string;
  description?: string;
  organizer?: string;
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
  const { id } = useParams();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [passes, setPasses] = useState<Pass[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState<"single" | "couple" | "join" | "success">(
    "single"
  );
  const [selectedPass, setSelectedPass] = useState<Pass | null>(null);
  const [joinCode, setJoinCode] = useState("");
  const [createdJoinCode, setCreatedJoinCode] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const passesRef = useRef<HTMLDivElement | null>(null);
  const paymentRef = useRef<HTMLDivElement | null>(null);

  // ─── Fetch event & passes ─────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const data = await getEventById(id as string);
        setEvent(data);
        const passData = await getEventPasses(id as string);
        setPasses(passData);
      } catch (err) {
        console.error("Failed to fetch event:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // ─── Handle registration ─────────────────────────────
  const handleRegister = async (passId: string) => {
    if (!event) return;
    setRegistering(true);
    try {
      const res = await registerForEvent(event.id, passId);
      const joinCode = res?.registration?.join_code || null;
      setCreatedJoinCode(joinCode);

      if (joinCode) {
        setModalStep("success");
        setShowModal(true);
      } else {
        setSuccessMsg("Registration successful!");
        setShowModal(false);
      }

      setEvent((prev) =>
        prev ? { ...prev, user_registered: true, registration: res.registration } : prev
      );
      setShowPayment(false);
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
    setShowPayment(false);
    setSuccessMsg(null);
    setCreatedJoinCode(null);

    const type = pass.type?.toLowerCase() || "";
    const isCouple = type.includes("couple") || pass.joinable || pass.max_members > 1;
    setModalStep(isCouple ? "couple" : "single");
    setShowModal(true);
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

  const scrollToPasses = () => {
    passesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleContinueToPayment = () => {
    if (!selectedPass) return;
    setShowModal(false);
    setShowPayment(true);
    setTimeout(() => paymentRef.current?.scrollIntoView({ behavior: "smooth" }), 120);
  };

  // ─── Loading states ─────────────────────────────
  if (loading)
    return (
      <div className="h-screen flex items-center justify-center text-neutral-400 animate-pulse">
        loading event...
      </div>
    );

  if (!event)
    return (
      <div className="h-screen flex flex-col items-center justify-center text-neutral-500">
        <p>Event not found</p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-[#C1FF72] underline"
        >
          go back
        </button>
      </div>
    );

  // ─── Main Layout ─────────────────────────────
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#040404] text-white font-satoshi">
      {/* Background glows */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/5 h-[55vh] w-[70vw] rounded-full blur-[160px] bg-[radial-gradient(circle_at_30%_30%,rgba(180,114,255,0.4),transparent_55%)]" />
        <div className="absolute -right-1/4 bottom-[-10%] h-[60vh] w-[70vw] rounded-full blur-[180px] bg-[radial-gradient(circle_at_70%_60%,rgba(200,255,90,0.45),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(45%_40%_at_50%_45%,rgba(255,255,255,0.05),transparent_60%)]" />
        <div className="absolute inset-0 bg-[url('/noise.png')] bg-[length:240px_240px] opacity-[0.08] mix-blend-overlay" />
      </div>

      <motion.main
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
        className="relative z-10 mx-auto flex max-w-5xl flex-col gap-8 px-6 pb-12 pt-10"
      >
        {/* Instagram-style post */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_22px_100px_-50px_rgba(0,0,0,0.85)] backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/40 backdrop-blur transition hover:border-[#C8FF5A]/60 hover:text-[#C8FF5A]"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-white/60">Event</p>
                <motion.h1
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-2xl font-semibold sm:text-3xl"
                  style={{ textShadow: "0 0 20px rgba(200,255,90,0.2)" }}
                >
                  {event.name}
                </motion.h1>
              </div>
            </div>
            <button
              onClick={handleShare}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/40 backdrop-blur transition hover:border-[#C8FF5A]/60 hover:text-[#C8FF5A]"
            >
              <Share2 size={18} />
            </button>
          </div>
          <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/30">
            <div className="aspect-square w-full overflow-hidden bg-black/30">
              <img
                src={event.cover || "/event-placeholder.jpg"}
                alt={event.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="space-y-3 px-4 py-4">
              <div className="flex flex-wrap items-center gap-2 text-xs text-white/70">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  <Calendar size={14} /> {event.date || "Date TBA"}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  <MapPin size={14} /> {event.venue || "Venue TBA"}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  <User size={14} /> {event.organizer || "Organizer TBA"}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-white/80">
                {event.description || "Details are being finalized. Check back soon."}
              </p>
              <div className="flex items-center justify-between text-sm text-white/70">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#C8FF5A] shadow-[0_0_10px_rgba(200,255,90,0.8)]" />
                  Tap Get Passes below to join
                </span>
                <Ticket size={16} className="text-[#C8FF5A]" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 shadow-[0_20px_80px_-40px_rgba(0,0,0,0.8)] backdrop-blur">
          {[
            { label: "Get Passes", icon: Ticket, action: scrollToPasses },
            { label: "Venue Map", icon: MapPin, action: () => setSuccessMsg("Map coming soon") },
            { label: "Lineup", icon: Sparkles, action: () => setSuccessMsg("Lineup drops soon") },
            { label: "Event Rules", icon: Shield, action: () => setSuccessMsg("Rules will be shared pre-event") },
          ].map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:border-[#C8FF5A]/60 hover:text-white"
            >
              <item.icon
                size={16}
                className="text-[#C8FF5A] transition group-hover:drop-shadow-[0_0_12px_rgba(200,255,90,0.55)]"
              />
              {item.label}
            </button>
          ))}
        </div>

        {/* Payment sheet */}
        {showPayment && selectedPass && !event.user_registered && (
          <motion.div
            ref={paymentRef}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_25px_120px_-40px_rgba(0,0,0,0.8)] backdrop-blur-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-white/60">Checkout</p>
                <h3 className="mt-1 text-2xl font-semibold" style={{ textShadow: "0 0 18px rgba(200,255,90,0.2)" }}>
                  {selectedPass.name}
                </h3>
                <p className="text-sm text-white/70 capitalize">{selectedPass.type}</p>
              </div>
              <span className="rounded-full bg-[#C8FF5A]/20 px-4 py-1 text-sm font-semibold text-[#C8FF5A] shadow-[0_0_20px_rgba(200,255,90,0.35)]">
                {selectedPass.price ? `PKR ${selectedPass.price}` : "Free"}
              </span>
            </div>

            <div className="mt-4 rounded-2xl border border-white/5 bg-black/30 p-4">
              <div className="flex items-center justify-between text-sm text-white/80">
                <span>Pass total</span>
                <span className="font-semibold text-[#C8FF5A]">
                  {selectedPass.price ? `PKR ${selectedPass.price}` : "Free"}
                </span>
              </div>
              <p className="mt-2 text-xs text-white/60">
                Your Whispr profile will be used. No extra details required.
              </p>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                onClick={() => handleRegister(selectedPass.id)}
                disabled={registering}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#C8FF5A] px-5 py-3 text-base font-semibold text-black shadow-[0_18px_50px_-18px_rgba(200,255,90,0.7)] transition hover:scale-[1.01]"
              >
                {registering ? "Processing..." : "Confirm & Pay"}
              </button>
              <button
                onClick={() => setShowPayment(false)}
                className="text-sm text-white/60 underline underline-offset-4 transition hover:text-white"
              >
                Change pass
              </button>
            </div>
          </motion.div>
        )}

        {/* Pass selection */}
        <div ref={passesRef} className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-white/60">Passes</p>
              <h2 className="text-2xl font-semibold">Choose your entry</h2>
            </div>
            {!event.user_registered && (
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                Live now
              </span>
            )}
          </div>

          {!event.user_registered && passes.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              {passes.map((p) => (
                <motion.button
                  key={p.id}
                  whileHover={{ y: -2, scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handlePassSelect(p)}
                  className="flex h-full flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 text-left shadow-[0_20px_80px_-40px_rgba(0,0,0,0.7)] transition hover:border-[#C8FF5A]/60 hover:shadow-[0_25px_90px_-50px_rgba(200,255,90,0.45)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold">{p.name}</h3>
                      <p className="text-sm text-white/60 capitalize">{p.description || p.type}</p>
                      {p.max_members > 1 && (
                        <p className="text-xs text-white/50">Includes {p.max_members} entries</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="rounded-full bg-[#C8FF5A]/15 px-3 py-1 text-sm font-semibold text-[#C8FF5A]">
                        {p.price ? `PKR ${p.price}` : "Free"}
                      </div>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/50">
                        {p.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-white/70">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#C8FF5A] shadow-[0_0_10px_rgba(200,255,90,0.8)]" />
                      Tap to select
                    </span>
                    <span className="text-[#C8FF5A]">Select →</span>
                  </div>
                </motion.button>
              ))}
            </div>
          )}

          {!event.user_registered && passes.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/70">
              No passes are available yet.
            </div>
          )}
        </div>

        {/* Already registered / Group Info */}
        {event.user_registered && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_25px_90px_-50px_rgba(0,0,0,0.8)] backdrop-blur"
          >
            <h3 className="text-lg font-semibold" style={{ textShadow: "0 0 18px rgba(200,255,90,0.2)" }}>
              You’re in.
            </h3>
            {event.registration ? (
              <div className="mt-3 space-y-3">
                <div className="flex items-center justify-between text-sm text-white/70">
                  <span>Pass</span>
                  <span className="font-semibold text-white">{event.registration.pass?.name}</span>
                </div>

                {event.registration.join_code && (
                  <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/30 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-white/60">Join Code</p>
                        <p
                          onClick={() =>
                            navigator.clipboard.writeText(event.registration?.join_code || "")
                          }
                          className="font-mono text-[#C8FF5A] transition hover:text-white"
                        >
                          {event.registration.join_code}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          navigator.clipboard.writeText(event.registration?.join_code || "")
                        }
                        className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/70 transition hover:border-[#C8FF5A]/60"
                      >
                        <Copy size={12} />
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
              <p className="mt-2 text-sm text-white/70">You’re registered for this event. Enjoy!</p>
            )}
          </motion.div>
        )}

        {/* Success Message */}
        {successMsg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border border-[#C8FF5A]/30 bg-[#C8FF5A]/10 px-4 py-3 text-center text-sm text-[#C8FF5A]"
          >
            {successMsg}
          </motion.div>
        )}
      </motion.main>

      {/* ─── Modal ───────────────────────────── */}
      <AnimatePresence>
        {showModal && selectedPass && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 text-center shadow-[0_25px_120px_-40px_rgba(0,0,0,0.8)] backdrop-blur-xl"
            >
              {modalStep === "single" && (
                <>
                  <h2 className="text-xl font-semibold" style={{ textShadow: "0 0 18px rgba(200,255,90,0.2)" }}>
                    {selectedPass.name}
                  </h2>
                  <p className="mt-2 text-sm text-white/70">
                    Your Whispr profile will be used for this pass.
                  </p>
                  <div className="mt-6 space-y-3">
                    <button
                      onClick={handleContinueToPayment}
                      className="w-full rounded-full bg-[#C8FF5A] px-5 py-3 text-base font-semibold text-black shadow-[0_18px_50px_-18px_rgba(200,255,90,0.7)] transition hover:scale-[1.01]"
                    >
                      Continue to Payment
                    </button>
                    <button
                      onClick={() => setShowModal(false)}
                      className="w-full text-sm text-white/60 underline underline-offset-4 transition hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}

              {modalStep === "couple" && (
                <>
                  <h2 className="text-xl font-semibold" style={{ textShadow: "0 0 18px rgba(200,255,90,0.2)" }}>
                    Couple Pass
                  </h2>
                  <p className="mt-2 text-sm text-white/70">
                    Includes 2 entries. One person starts the pass and invites their partner.
                  </p>
                  <div className="mt-6 space-y-3">
                    <button
                      onClick={() => handleRegister(selectedPass.id)}
                      disabled={registering}
                      className="w-full rounded-full bg-[#C8FF5A] px-5 py-3 text-base font-semibold text-black shadow-[0_18px_50px_-18px_rgba(200,255,90,0.7)] transition hover:scale-[1.01]"
                    >
                      {registering ? "Starting..." : "Start Couple Pass"}
                    </button>
                    <button
                      onClick={() => setModalStep("join")}
                      className="w-full rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm text-white/80 transition hover:border-[#C8FF5A]/60"
                    >
                      Join Partner’s Link
                    </button>
                    <button
                      onClick={() => setShowModal(false)}
                      className="w-full text-sm text-white/60 underline underline-offset-4 transition hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}

              {modalStep === "join" && (
                <>
                  <p className="text-sm text-white/70">Enter your group’s join code.</p>
                  <input
                    type="text"
                    placeholder="REG-COU-XXXXX"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    className="mt-4 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-center text-white focus:outline-none focus:ring-2 focus:ring-[#C8FF5A]"
                  />
                  <div className="mt-5 space-y-3">
                    <button
                      onClick={handleJoin}
                      disabled={registering}
                      className="w-full rounded-full bg-[#C8FF5A] px-5 py-3 text-base font-semibold text-black shadow-[0_18px_50px_-18px_rgba(200,255,90,0.7)] transition hover:scale-[1.01]"
                    >
                      {registering ? "Joining..." : "Join Partner"}
                    </button>
                    <button
                      onClick={() => setModalStep("couple")}
                      className="w-full text-sm text-white/60 underline underline-offset-4 transition hover:text-white"
                    >
                      Back
                    </button>
                  </div>
                </>
              )}

              {modalStep === "success" && (
                <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
                  <CheckCircle2 className="mx-auto mb-3 text-[#C8FF5A]" size={42} />
                  <h3 className="text-xl font-semibold text-white mb-2">Registration successful</h3>
                  {createdJoinCode && (
                    <div className="space-y-3">
                      <p className="text-sm text-white/70">Share this code with your partner:</p>
                      <p
                        onClick={() => navigator.clipboard.writeText(createdJoinCode)}
                        className="font-mono text-[#C8FF5A] transition hover:text-white"
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
                    className="mt-5 w-full rounded-full bg-[#C8FF5A] px-5 py-3 text-base font-semibold text-black shadow-[0_18px_50px_-18px_rgba(200,255,90,0.7)] transition hover:scale-[1.01]"
                  >
                    Done
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
