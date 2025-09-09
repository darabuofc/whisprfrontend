"use client";
import { useState } from "react";
import { register, verifyOtp } from "@/lib/api";

export default function RegisterPage() {
  const [phase, setPhase] = useState<"phone" | "otp" | "done">("phone");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await register(phone, password); // ✅ capture response
      setPhase("otp");
      if (res.otp) {
        setMsg(`OTP (debug): ${res.otp}`);
      } else {
        setMsg(res.message);
      }
        
    }
     
    catch (e: any) {
      setMsg(e?.response?.data?.error || "Failed to register");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await verifyOtp(phone, otp);
      setPhase("done");
      setMsg("Verified! Redirecting…");
      setTimeout(() => (window.location.href = "/"), 1200);
    } catch (e: any) {
      setMsg(e?.response?.data?.error || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12 card p-6">
      <h1 className="text-2xl font-bold bg-gradient-to-r from-accent-blue to-violet-400 bg-clip-text text-transparent mb-4">
        Sign Up
      </h1>

      {msg && <div className="text-sm text-gray-300 mb-3">{msg}</div>}

      {phase === "phone" && (
        <form className="space-y-4" onSubmit={handleRegister}>
          <input
            className="input w-full"
            placeholder="+92300..."
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <input
            className="input w-full"
            type="password"
            placeholder="Password (min 8 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="btn-nav w-full tap-target" disabled={loading}>
            {loading ? "Sending OTP…" : "Sign Up"}
          </button>
        </form>
      )}

      {phase === "otp" && (
        <form className="space-y-4" onSubmit={handleVerify}>
          <input
            className="input w-full"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button className="btn-nav w-full tap-target" disabled={loading}>
            {loading ? "Verifying…" : "Verify OTP"}
          </button>
        </form>
      )}

      {phase === "done" && (
        <div className="text-center text-gray-300">🎉 You’re in! Redirecting…</div>
      )}
    </div>
  );
}
