"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  LogIn,
  CheckCircle2,
  Copy,
  Users2,
  Share2,
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
  const [selectedPass, setSelectedPass] = useState<Pass | null>(null);
  const [joinCode, setJoinCode] = useState("");
  const [modalStep, setModalStep] = useState<"select" | "join" | "success">("select");
  const [createdJoinCode, setCreatedJoinCode] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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
      } else {
        setSuccessMsg("Registration successful! 🎉");
        setShowModal(false);
      }

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
    setModalStep("select");

    const type = pass.type?.toLowerCase() || "";
    if (type === "single") handleRegister(pass.id);
    else setShowModal(true);
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
    <div className="min-h-screen bg-gradient-to-b from-[#0b0b0f] via-[#13131a] to-[#0b0b0f] text-white font-satoshi relative">
      {/* Header */}
      <div className="relative">
        <img
          src={event.cover || "/event-placeholder.jpg"}
          alt={event.name}
          className="w-full h-[260px] object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0f] via-[#0b0b0f]/70 to-transparent" />
        <button
          onClick={() => router.back()}
          className="absolute top-5 left-5 bg-black/40 backdrop-blur-md p-2 rounded-full border border-white/10 hover:border-[#C1FF72]/40 transition"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="px-6 py-8 max-w-md mx-auto"
      >
        <h1 className="text-2xl font-semibold mb-2">{event.name}</h1>
        <div className="flex items-center gap-2 text-sm text-neutral-400 mb-1">
          <Calendar size={14} /> <span>{event.date || "Date TBA"}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-neutral-400 mb-4">
          <MapPin size={14} /> <span>{event.venue || "Venue TBA"}</span>
        </div>
        <p className="text-neutral-300 text-sm leading-relaxed mb-6">
          {event.description || "No description provided yet."}
        </p>
        <div className="flex items-center gap-2 text-sm text-neutral-400 mb-10">
          <User size={14} /> <span>{event.organizer || "Organizer TBA"}</span>
        </div>

        {/* Pass selection */}
        {!event.user_registered && passes.length > 0 && (
          <div className="space-y-3 mb-10">
            {passes.map((p) => (
              <motion.button
                key={p.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => handlePassSelect(p)}
                className="w-full p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-left hover:border-[#C1FF72]/40 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{p.name}</h3>
                    <p className="text-xs text-neutral-400 capitalize">
                      {p.type}
                    </p>
                  </div>
                  <span className="text-[#C1FF72] text-sm">
                    {p.price ? `Rs ${p.price}` : "Free"}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        )}

        {/* Already registered / Group Info */}
        {event.user_registered && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-white/10 rounded-xl p-5 mb-8 bg-white/[0.02]"
          >
            <h3 className="text-white font-semibold text-lg mb-3">
              You’re Registered
            </h3>

            {event.registration ? (
              <>
                <p className="text-sm text-neutral-400 mb-2">
                  Pass:{" "}
                  <span className="text-white">
                    {event.registration.pass?.name}
                  </span>
                </p>

                {event.registration.join_code && (
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs text-neutral-400">Join Code</p>
                      <p
                        onClick={() =>
                          navigator.clipboard.writeText(
                            event.registration?.join_code || ""
                          )
                        }
                        className="font-mono text-[#C1FF72] cursor-pointer hover:text-lime-400 transition"
                      >
                        {event.registration.join_code}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(
                          event.registration?.join_code || ""
                        )
                      }
                      className="flex items-center gap-1 text-xs text-neutral-400 border border-white/10 rounded-md px-3 py-1 hover:border-[#C1FF72]/40 transition"
                    >
                      <Copy size={12} /> Copy
                    </button>
                  </div>
                )}


                {event.registration.join_code && (
                  <button
                    onClick={() =>
                      window.open(
`https://wa.me/?text=Join%20my%20Whispr%20event%20group%20with%20this%20code:%20${event.registration?.join_code ?? ''}`
                      )
                    }
                    className="w-full bg-[#C1FF72]/10 border border-[#C1FF72]/30 text-[#C1FF72] py-2 rounded-lg text-sm hover:bg-[#C1FF72]/20 transition flex items-center justify-center gap-1"
                  >
                    <Share2 size={14} /> Invite via WhatsApp
                  </button>
                )}
              </>
            ) : (
              <p className="text-sm text-neutral-400">
                You’re registered for this event. Enjoy!
              </p>
            )}
          </motion.div>
        )}

        {/* Success Message */}
        {successMsg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 p-4 rounded-lg bg-[#C1FF72]/10 border border-[#C1FF72]/30 text-center text-[#C1FF72] text-sm"
          >
            {successMsg}
          </motion.div>
        )}
      </motion.div>

      {/* ─── Modal ───────────────────────────── */}
      <AnimatePresence>
        {showModal && selectedPass && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-[#0b0b0f] border border-white/10 rounded-2xl p-6 w-80 text-center"
            >
              {/* STEP: SELECT */}
              {modalStep === "select" && (
                <>
                  <h2 className="text-lg font-semibold mb-2 text-white">
                    {selectedPass.name}
                  </h2>
                  <p className="text-sm text-neutral-400 mb-5">
                    This is a {selectedPass.type.toLowerCase()} pass.
                  </p>
                  <p className="text-xs text-neutral-500 mb-4">
                    Would you like to create a new group or join an existing one?
                  </p>
                  <button
                    onClick={() => handleRegister(selectedPass.id)}
                    disabled={registering}
                    className="w-full bg-[#C1FF72] text-black font-medium py-2 rounded-lg hover:bg-[#b3ff5f] transition"
                  >
                    {registering ? "Registering..." : "Create New"}
                  </button>
                  <button
                    onClick={() => setModalStep("join")}
                    className="w-full mt-3 flex items-center justify-center gap-1 text-sm text-neutral-300 hover:text-white"
                  >
                    <LogIn size={14} /> Join Existing
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="mt-5 text-xs text-neutral-500 underline"
                  >
                    Cancel
                  </button>
                </>
              )}

              {/* STEP: JOIN */}
              {modalStep === "join" && (
                <>
                  <p className="text-sm text-neutral-400 mb-3">
                    Enter your group’s join code below.
                  </p>
                  <input
                    type="text"
                    placeholder="REG-COU-XXXXX"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-center text-white mb-4 focus:outline-none focus:ring-1 focus:ring-[#C1FF72]"
                  />
                  <button
                    onClick={handleJoin}
                    disabled={registering}
                    className="w-full bg-[#C1FF72] text-black font-medium py-2 rounded-lg hover:bg-[#b3ff5f] transition"
                  >
                    {registering ? "Joining..." : "Join Group"}
                  </button>
                  <button
                    onClick={() => setModalStep("select")}
                    className="w-full text-sm text-neutral-400 mt-3 underline"
                  >
                    Back
                  </button>
                </>
              )}

              {/* STEP: SUCCESS */}
              {modalStep === "success" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <CheckCircle2
                    className="mx-auto mb-3 text-[#C1FF72]"
                    size={40}
                  />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Registration Successful!
                  </h3>
                  {createdJoinCode && (
                    <>
                      <p className="text-sm text-neutral-400 mb-1">
                        Share this code with your group:
                      </p>
                      <p
                        onClick={() =>
                          navigator.clipboard.writeText(createdJoinCode)
                        }
                        className="font-mono text-[#C1FF72] mb-4 cursor-pointer hover:text-lime-400 transition"
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
                        className="flex items-center justify-center gap-1 w-full text-sm text-[#C1FF72] border border-[#C1FF72]/30 rounded-lg py-2 hover:bg-[#C1FF72]/10 transition mb-3"
                      >
                        <Share2 size={14} /> Share via WhatsApp
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-full bg-[#C1FF72] text-black font-medium py-2 rounded-lg hover:bg-[#b3ff5f] transition"
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
