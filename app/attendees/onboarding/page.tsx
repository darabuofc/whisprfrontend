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
      if (profile.bio) form.append("bio", profile.bio);
      if (profile.profilePic) form.append("profile_pic", profile.profilePic);

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

  // ---------- UI ----------
  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#0b0b0f] to-[#1a0b1f] text-white font-satoshi p-6">
      <div className="w-full max-w-md p-6 sm:p-8 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl relative">
        {/* Step indicator */}
        <div
          className="absolute top-0 left-0 h-1 rounded-t-2xl bg-[#C1FF72] transition-all duration-500"
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
              className="text-center space-y-6"
            >
              <h2 className="text-3xl font-bold">
                Verify <span className="text-[#C1FF72]">WhatsApp</span>
              </h2>
              <p className="text-neutral-400 text-sm">
                We’ll send a one-time code to confirm it’s really you.
              </p>

              {!otpSent ? (
                <>
                  <label className="block text-left text-sm mb-1 text-[#C1FF72] font-medium">
                    WhatsApp Number
                  </label>
                  <input
                    type="text"
                    placeholder="+923001234567"
                    value={profile.whatsapp}
                    onChange={(e) =>
                      setProfile({ ...profile, whatsapp: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:ring-1 focus:ring-[#C1FF72] outline-none placeholder-neutral-400"
                  />
                  <button
                    onClick={handleSendOtp}
                    disabled={!profile.whatsapp}
                    className="w-full py-3 rounded-lg font-semibold bg-[#C1FF72] text-black hover:opacity-90 disabled:opacity-50"
                  >
                    Send OTP →
                  </button>
                </>
              ) : !profile.whatsappVerified ? (
                <>
                  <div className="flex justify-center gap-2 mb-4">
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
                        className="w-10 h-12 text-center text-xl font-bold rounded-lg bg-white/5 border border-white/10 focus:ring-1 focus:ring-[#C1FF72] outline-none"
                      />
                    ))}
                  </div>
                  <button
                    onClick={handleVerifyOtp}
                    disabled={otp.length !== 6}
                    className="w-full py-3 rounded-lg font-semibold bg-[#C1FF72] text-black hover:opacity-90 disabled:opacity-50"
                  >
                    Verify →
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setStep(2)}
                  className="w-full py-3 bg-[#C1FF72] text-black rounded-lg font-semibold hover:opacity-90"
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
              <h2 className="text-3xl font-bold">
                Your <span className="text-[#C1FF72]">Basics</span>
              </h2>

              <div>
                <label className="block text-sm mb-1 text-[#C1FF72] font-medium">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={profile.dob}
                  onChange={handleDobChange}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:ring-1 focus:ring-[#C1FF72] outline-none text-white"
                />
                {underage && (
                  <p className="mt-2 text-sm bg-red-500/10 border border-red-500/30 text-red-400 rounded-md py-2 px-3 text-center">
                    Stop right there little one! You’re underage — you’ll have
                    to wait!
                  </p>
                )}
                <p className="text-xs text-neutral-500 mt-1">
                  We just need to make sure you’re old enough for the night.
                </p>
              </div>

              <div>
                <label className="block text-sm mb-1 text-[#C1FF72] font-medium">
                  CNIC Number
                </label>
                <input
                  type="text"
                  placeholder="42301-9207562-9"
                  value={profile.cnic}
                  onChange={handleCnicChange}
                  maxLength={15}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:ring-1 focus:ring-[#C1FF72] outline-none text-white placeholder-neutral-400"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Use your valid national ID number.
                </p>
              </div>

              <button
                onClick={handleSaveBasics}
                disabled={!profile.dob || !profile.cnic || underage}
                className="w-full py-3 rounded-lg font-semibold bg-[#C1FF72] text-black hover:opacity-90 disabled:opacity-50"
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
              <h2 className="text-3xl font-bold">
                Build Your <span className="text-[#C1FF72]">Profile</span>
              </h2>

              <div>
                <label className="block text-sm mb-1 text-[#C1FF72] font-medium">
                  Profession
                </label>
                <select
                  value={profile.profession}
                  onChange={(e) =>
                    setProfile({ ...profile, profession: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:ring-1 focus:ring-[#C1FF72] outline-none"
                >
                  <option value="">Select Profession</option>
                  <option value="student">Student</option>
                  <option value="employed">Employed</option>
                  <option value="freelancer">Freelancer</option>
                  <option value="entrepreneur">Entrepreneur</option>
                </select>
              </div>

              {profile.profession === "student" && (
                <div>
                  <label className="block text-sm mb-1 text-[#C1FF72] font-medium">
                    University
                  </label>
                  <input
                    type="text"
                    placeholder="University name"
                    value={profile.university}
                    onChange={(e) =>
                      setProfile({ ...profile, university: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:ring-1 focus:ring-[#C1FF72] outline-none placeholder-neutral-400"
                  />
                </div>
              )}

              {profile.profession === "employed" && (
                <div>
                  <label className="block text-sm mb-1 text-[#C1FF72] font-medium">
                    Company
                  </label>
                  <input
                    type="text"
                    placeholder="Company name"
                    value={profile.company}
                    onChange={(e) =>
                      setProfile({ ...profile, company: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:ring-1 focus:ring-[#C1FF72] outline-none placeholder-neutral-400"
                  />
                </div>
              )}

              {/* Profile Picture Upload */}
              <div>
                <label className="block text-sm mb-2 text-[#C1FF72] font-medium">
                  Profile Picture
                </label>
                <div
                  className="relative border-2 border-dashed border-white/10 hover:border-[#C1FF72] transition-all rounded-xl flex flex-col items-center justify-center py-6 cursor-pointer"
                  onClick={() =>
                    document.getElementById("profilePicInput")?.click()
                  }
                >
                  {profile.profilePicPreview ? (
                    <>
                      <img
                        src={profile.profilePicPreview}
                        alt="Profile Preview"
                        className="w-24 h-24 object-cover rounded-full border border-[#C1FF72]"
                      />
                      <div className="absolute bottom-2 text-xs text-neutral-400">
                        Tap to change photo
                      </div>
                    </>
                  ) : (
                    <p className="text-neutral-400 text-sm">
                      Tap to upload or drag a photo — your face, your vibe.
                    </p>
                  )}
                  <input
                    id="profilePicInput"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleProfilePic(e.target.files?.[0] || null)
                    }
                    className="hidden"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm mb-1 text-[#C1FF72] font-medium">
                  Short Bio
                </label>
                <textarea
                  placeholder="Tell us something about your vibe..."
                  value={profile.bio}
                  onChange={(e) =>
                    setProfile({ ...profile, bio: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:ring-1 focus:ring-[#C1FF72] outline-none placeholder-neutral-400"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  1–2 lines are perfect. Keep it you.
                </p>
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={!profile.profilePic}
                className="w-full py-3 rounded-lg font-semibold bg-[#C1FF72] text-black hover:opacity-90 disabled:opacity-50"
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
              className="text-center space-y-6"
            >
              <h2 className="text-3xl font-bold">
                You’re <span className="text-[#C1FF72]">All Set!</span> 🎉
              </h2>
              <p className="text-neutral-400">
                Welcome to the Whispr circle. Step into your next night.
              </p>
              <button
                onClick={finishOnboarding}
                className="w-full py-3 rounded-lg font-semibold bg-[#C1FF72] text-black hover:opacity-90"
              >
                Step into Whispr →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
