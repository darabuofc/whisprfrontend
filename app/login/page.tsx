"use client";
import { useState } from "react";
import { login, register, verifyOtp } from "@/lib/api";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [phase, setPhase] = useState<"login"|"register"|"verify">("login");
  const [msg, setMsg] = useState<string|undefined>();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    try {
      await login(phone, password);
      setMsg("Logged in. Redirecting…");
      setTimeout(() => (window.location.href = "/"), 600);
    } catch (e:any) {
      setMsg(e?.response?.data?.error || "Login failed");
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    try {
      await register(phone, password);
      setPhase("verify");
      setMsg("OTP sent via WhatsApp (or shown in API response if in local dev).");
    } catch (e:any) {
      setMsg(e?.response?.data?.error || "Register failed");
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    try {
      await verifyOtp(phone, otp);
      setMsg("Verified! Redirecting…");
      setTimeout(() => (window.location.href = "/"), 600);
    } catch (e:any) {
      setMsg(e?.response?.data?.error || "Verification failed");
    }
  }

  return (
    <div className="max-w-md mx-auto card p-6">
      <h1 className="text-xl font-semibold mb-4 text-accent-pink">Welcome to Whispr</h1>
      {msg && <div className="text-sm text-gray-300 mb-3">{msg}</div>}

      {phase === "login" && (
        <form className="space-y-3" onSubmit={handleLogin}>
          <input className="input w-full" placeholder="+92300..." value={phone} onChange={e=>setPhone(e.target.value)} />
          <input className="input w-full" type="password" placeholder="password" value={password} onChange={e=>setPassword(e.target.value)} />
          <div className="flex gap-2">
            <button className="btn btn-primary" type="submit">Login</button>
            <button className="btn" type="button" onClick={() => setPhase("register")}>Create account</button>
          </div>
        </form>
      )}

      {phase === "register" && (
        <form className="space-y-3" onSubmit={handleRegister}>
          <input className="input w-full" placeholder="+92300..." value={phone} onChange={e=>setPhone(e.target.value)} />
          <input className="input w-full" type="password" placeholder="password" value={password} onChange={e=>setPassword(e.target.value)} />
          <div className="flex gap-2">
            <button className="btn btn-primary" type="submit">Send OTP</button>
            <button className="btn" type="button" onClick={() => setPhase("login")}>Back</button>
          </div>
        </form>
      )}

      {phase === "verify" && (
        <form className="space-y-3" onSubmit={handleVerify}>
          <input className="input w-full" placeholder="+92300..." value={phone} onChange={e=>setPhone(e.target.value)} />
          <input className="input w-full" placeholder="Enter OTP" value={otp} onChange={e=>setOtp(e.target.value)} />
          <div className="flex gap-2">
            <button className="btn btn-primary" type="submit">Verify OTP</button>
            <button className="btn" type="button" onClick={() => setPhase("login")}>Back</button>
          </div>
        </form>
      )}
    </div>
  );
}
