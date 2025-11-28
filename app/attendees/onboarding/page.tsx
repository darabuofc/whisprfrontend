"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  sendWhatsappOtp,
  verifyWhatsappOtp,
  saveBasics,
  saveProfile,
  getOnboardingStatus,
} from "@/lib/api";

export default function AttendeesOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [underage, setUnderage] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>(new Array(6).fill(null));

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

  // ---------- Handlers ----------
  const handleSendOtp = async () => {
    try {
      await sendWhatsappOtp(profile.whatsapp);
      setOtpSent(true);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      await verifyWhatsappOtp(profile.whatsapp, otp);
      setProfile({ ...profile, whatsappVerified: true });
      setStep(2);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDobChange = (e: any) => {
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
    // Keep only numbers
    val = val.replace(/\D/g, "");
    // Insert dashes at positions 5 and 12
    if (val.length > 5 && val.length <= 12)
      val = val.slice(0, 5) + "-" + val.slice(5);
    else if (val.length > 12)
      val =
        val.slice(0, 5) + "-" + val.slice(5, 12) + "-" + val.slice(12, 13);
    return val;
  };

  const handleCnicChange = (e: any) => {
    const formatted = formatCnic(e.target.value);
    setProfile({ ...profile, cnic: formatted });
  };

  const handleSaveBasics = async () => {
    try {
      await saveBasics(profile.dob, profile.cnic);
      setStep(3);
    } catch (err: any) {
      alert(err.message);
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
      const form = new FormData();
      form.append("profession", profile.profession);
      if (profile.company) form.append("company", profile.company);
      if (profile.university) form.append("university", profile.university);
      form.append("instagram_handle", profile.instagramHandle.trim());
      if (profile.bio) form.append("bio", profile.bio);
      if (profile.profilePic) form.append("photo", profile.profilePic);

      await saveProfile(form);
      setStep(4);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const finishOnboarding = async () => {
    try {
      const status = await getOnboardingStatus();
      if (status.mustCompleted) {
        router.push("/attendees/dashboard");
      } else {
        alert("Please complete all required fields first.");
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // ---------- OTP Input ----------
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
    // enforce leading @ and strip spaces
    let normalized = val.replace(/\s+/g, "");
    if (!normalized.startsWith("@")) {
      normalized = "@" + normalized.replace(/^@+/, "");
    }
    if (normalized === "@") normalized = "@";
    setProfile({ ...profile, instagramHandle: normalized });
  };

  // ---------- UI ----------
  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#040404] px-6 py-10 text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -left-1/3 -top-1/4 h-[65vh] w-[80vw] rounded-full blur-[180px]"
          style={{
            background: "radial-gradient(circle at 30% 30%, rgba(193,255,114,0.35), transparent 60%)",
          }}
          animate={{ scale: [1, 1.05, 1], opacity: [0.4, 0.65, 0.4] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-1/3 bottom-[-10%] h-[65vh] w-[80vw] rounded-full blur-[200px]"
          style={{
            background: "radial-gradient(circle at 60% 60%, rgba(180,114,255,0.35), transparent 60%)",
          }}
          animate={{ scale: [1, 1.04, 1], opacity: [0.35, 0.6, 0.35] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(45%_40%_at_50%_45%,rgba(255,255,255,0.05),transparent_60%)]" />
        <div className="absolute inset-0 bg-[url('/noise.png')] bg-[length:240px_240px] opacity-[0.08] mix-blend-overlay" />
      </div>

      <div className="relative w-full max-w-3xl overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-[0_30px_120px_-40px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
        <div className="grid gap-0 md:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col gap-6 p-8 md:p-10">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-white/65">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                <span className="h-2 w-2 rounded-full bg-[#C1FF72] shadow-[0_0_12px_#C1FF72]" />
                Whispr Access
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1">Secure</span>
            </div>

            <div>
              <h1 className="text-3xl font-semibold leading-tight sm:text-4xl" style={{ textShadow: "0 0 20px rgba(193,255,114,0.25)" }}>
                Step into Whispr
              </h1>
              <p className="mt-3 text-sm text-white/70 sm:text-base">
                Verify once, and your future nights unlock instantly. Smooth onboarding, zero chaos.
              </p>
            </div>

            <div className="relative rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_15px_60px_-30px_rgba(0,0,0,0.7)]">
              <div
                className="absolute left-0 top-0 h-1 rounded-t-2xl bg-[#C1FF72] transition-all duration-500"
                style={{ width: `${(step / 4) * 100}%` }}
              />
              <AnimatePresence mode="wait">
                {/* STEP 1: WhatsApp */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-5"
                  >
                    <div className="flex items-center justify-between text-xs text-white/60">
                      <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
                        <span className="h-2 w-2 rounded-full bg-[#C1FF72] shadow-[0_0_10px_#C1FF72]" />
                        Step 1 · Verify WhatsApp
                      </span>
                      <span className="text-white/50">OTP</span>
                    </div>

                    {!otpSent ? (
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-[#C1FF72]">WhatsApp Number</label>
                        <input
                          type="text"
                          placeholder="+923001234567"
                          value={profile.whatsapp}
                          onChange={(e) => setProfile({ ...profile, whatsapp: e.target.value })}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/35 transition focus:border-white/20 focus:shadow-[0_0_0_4px_rgba(193,255,114,0.15)]"
                        />
                        <button
                          onClick={handleSendOtp}
                          disabled={!profile.whatsapp}
                          className="inline-flex w-full items-center justify-center rounded-full bg-[#C1FF72] px-4 py-3 text-sm font-semibold text-black shadow-[0_15px_45px_-15px_rgba(193,255,114,0.7)] transition hover:brightness-95 disabled:opacity-60"
                        >
                          Send OTP →
                        </button>
                      </div>
                    ) : !profile.whatsappVerified ? (
                      <div className="space-y-4">
                        <div className="flex justify-center gap-2">
                          {Array.from({ length: 6 }).map((_, i) => (
                            <input
                              key={i}
                              ref={(el) => {
                                inputsRef.current[i] = el;
                              }}
                              type="text"
                              maxLength={1}
                              value={otp[i] || ""}
                              onChange={(e) => handleOtpChange(i, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(i, e)}
                              className="h-12 w-10 rounded-lg border border-white/10 bg-white/5 text-center text-xl font-bold outline-none transition focus:border-white/20 focus:shadow-[0_0_0_3px_rgba(193,255,114,0.25)]"
                            />
                          ))}
                        </div>
                        <button
                          onClick={handleVerifyOtp}
                          disabled={otp.length !== 6}
                          className="inline-flex w-full items-center justify-center rounded-full bg-[#C1FF72] px-4 py-3 text-sm font-semibold text-black shadow-[0_15px_45px_-15px_rgba(193,255,114,0.7)] transition hover:brightness-95 disabled:opacity-60"
                        >
                          Verify →
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setStep(2)}
                        className="inline-flex w-full items-center justify-center rounded-full bg-[#C1FF72] px-4 py-3 text-sm font-semibold text-black shadow-[0_15px_45px_-15px_rgba(193,255,114,0.7)] transition hover:brightness-95"
                      >
                        Continue →
                      </button>
                    )}
                  </motion.div>
                )}

                {/* STEP 2: DOB + CNIC */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between text-xs text-white/60">
                      <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
                        <span className="h-2 w-2 rounded-full bg-[#C1FF72] shadow-[0_0_10px_#C1FF72]" />
                        Step 2 · Basics
                      </span>
                      <span className="text-white/50">Age + ID</span>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-[#C1FF72]">Date of Birth</label>
                      <input
                        type="date"
                        value={profile.dob}
                        onChange={handleDobChange}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-white/20 focus:shadow-[0_0_0_4px_rgba(193,255,114,0.15)]"
                      />
                      {underage && (
                        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                          You need to be 18+ to continue.
                        </p>
                      )}
                      <p className="text-xs text-white/50">We just need to make sure you’re old enough for the night.</p>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-[#C1FF72]">CNIC Number</label>
                      <input
                        type="text"
                        placeholder="42301-9207562-9"
                        value={profile.cnic}
                        onChange={handleCnicChange}
                        maxLength={15}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/35 transition focus:border-white/20 focus:shadow-[0_0_0_4px_rgba(193,255,114,0.15)]"
                      />
                      <p className="text-xs text-white/50">Use your valid national ID number.</p>
                    </div>

                    <button
                      onClick={handleSaveBasics}
                      disabled={!profile.dob || !profile.cnic || underage}
                      className="inline-flex w-full items-center justify-center rounded-full bg-[#C1FF72] px-4 py-3 text-sm font-semibold text-black shadow-[0_15px_45px_-15px_rgba(193,255,114,0.7)] transition hover:brightness-95 disabled:opacity-60"
                    >
                      Next →
                    </button>
                  </motion.div>
                )}

                {/* STEP 3: Profile */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between text-xs text-white/60">
                      <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
                        <span className="h-2 w-2 rounded-full bg-[#C1FF72] shadow-[0_0_10px_#C1FF72]" />
                        Step 3 · Profile
                      </span>
                      <span className="text-white/50">2 mins</span>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-[#C1FF72]">Profession</label>
                      <select
                        value={profile.profession}
                        onChange={(e) => setProfile({ ...profile, profession: e.target.value })}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-white/20 focus:shadow-[0_0_0_4px_rgba(193,255,114,0.15)]"
                      >
                        <option value="">Select Profession</option>
                        <option value="student">Student</option>
                        <option value="employed">Employed</option>
                        <option value="freelancer">Freelancer</option>
                        <option value="entrepreneur">Entrepreneur</option>
                      </select>
                    </div>

                    {profile.profession === "student" && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-[#C1FF72]">University</label>
                        <input
                          type="text"
                          placeholder="University name"
                          value={profile.university}
                          onChange={(e) => setProfile({ ...profile, university: e.target.value })}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/35 transition focus:border-white/20 focus:shadow-[0_0_0_4px_rgba(193,255,114,0.15)]"
                        />
                      </div>
                    )}

                    {profile.profession === "employed" && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-[#C1FF72]">Company</label>
                        <input
                          type="text"
                          placeholder="Company name"
                          value={profile.company}
                          onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/35 transition focus:border-white/20 focus:shadow-[0_0_0_4px_rgba(193,255,114,0.15)]"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[#C1FF72]">Instagram Handle</label>
                      <input
                        type="text"
                        placeholder="@yourhandle"
                        value={profile.instagramHandle}
                        onChange={(e) => handleInstagramChange(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/35 transition focus:border-white/20 focus:shadow-[0_0_0_4px_rgba(193,255,114,0.15)]"
                      />
                      <p className="text-xs text-white/50">Required. Must start with @.</p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[#C1FF72]">Profile Picture</label>
                      <div
                        className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 bg-white/5 px-4 py-6 text-center transition hover:border-[#C1FF72]"
                        onClick={() => document.getElementById("profilePicInput")?.click()}
                      >
                        {profile.profilePicPreview ? (
                          <>
                            <img
                              src={profile.profilePicPreview}
                              alt="Profile Preview"
                              className="h-24 w-24 rounded-full border border-[#C1FF72] object-cover"
                            />
                            <div className="absolute bottom-2 text-xs text-white/60">Tap to change photo</div>
                          </>
                        ) : (
                          <p className="text-sm text-white/60">Tap to upload or drag a photo — your face, your vibe.</p>
                        )}
                        <input
                          id="profilePicInput"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleProfilePic(e.target.files?.[0] || null)}
                          className="hidden"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[#C1FF72]">Short Bio</label>
                      <textarea
                        placeholder="Tell us something about your vibe..."
                        value={profile.bio}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/35 transition focus:border-white/20 focus:shadow-[0_0_0_4px_rgba(193,255,114,0.15)]"
                      />
                      <p className="text-xs text-white/50">1–2 lines are perfect. Keep it you.</p>
                    </div>

                    <button
                      onClick={handleSaveProfile}
                      disabled={!profile.profilePic || profile.instagramHandle.trim() === "@"}
                      className="inline-flex w-full items-center justify-center rounded-full bg-[#C1FF72] px-4 py-3 text-sm font-semibold text-black shadow-[0_15px_45px_-15px_rgba(193,255,114,0.7)] transition hover:brightness-95 disabled:opacity-60"
                    >
                      Next →
                    </button>
                  </motion.div>
                )}

                {/* STEP 4: Done */}
                {step === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-5 text-center"
                  >
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/60">
                      <span className="h-2 w-2 rounded-full bg-[#C1FF72] shadow-[0_0_10px_#C1FF72]" />
                      Step 4 · Done
                    </div>
                    <h2 className="text-3xl font-semibold">
                      You’re <span className="text-[#C1FF72]">All Set!</span> 🎉
                    </h2>
                    <p className="text-white/70">Welcome to the Whispr circle. Step into your next night.</p>
                    <button
                      onClick={finishOnboarding}
                      className="inline-flex w-full items-center justify-center rounded-full bg-[#C1FF72] px-4 py-3 text-sm font-semibold text-black shadow-[0_15px_45px_-15px_rgba(193,255,114,0.7)] transition hover:brightness-95"
                    >
                      Step into Whispr →
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="hidden flex-col justify-between border-t border-white/10 bg-gradient-to-b from-white/5 to-white/0 p-8 md:flex">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.25em] text-white/50">Why verify</p>
              <p className="text-xl font-semibold text-white">
                One clean pass across all your nights, with built-in fraud checks.
              </p>
              <p className="text-sm text-white/65">
                We keep the chaos out so organizers can move fast and you never get stuck at the door.
              </p>
            </div>
            <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between text-sm text-white/70">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#C1FF72] shadow-[0_0_10px_#C1FF72]" />
                  Live sync
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/60">
                  Instant
                </span>
              </div>
              <p className="text-base text-white/80">
                Your pass, bio, and socials stay in lockstep—organizers see what they need, nothing more.
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm text-white/70">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/50">Attendees</p>
                  <p className="mt-1 text-lg font-semibold text-white">Trusted entry</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/50">Organizers</p>
                  <p className="mt-1 text-lg font-semibold text-white">Verified guests</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
