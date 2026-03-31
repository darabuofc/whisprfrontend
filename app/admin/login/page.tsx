"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminLogin } from "@/lib/adminApi";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await adminLogin(username, password);
      router.push("/admin");
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-10">
          <h1
            className="text-[22px] uppercase tracking-[0.35em] text-[var(--text-primary)] font-medium"
            style={{ fontFamily: "var(--font-display-org)" }}
          >
            WHISPR
          </h1>
          <p
            className="text-[11px] uppercase tracking-[0.15em] text-[var(--text-muted)] mt-2"
            style={{ fontFamily: "var(--font-mono-org)" }}
          >
            Admin Panel
          </p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-[#1C1C1E] border border-white/[0.06] rounded-2xl p-8 space-y-5"
        >
          {error && (
            <div className="text-red-400 text-[13px] text-center bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label
              className="text-[11px] uppercase tracking-[0.1em] text-[var(--text-secondary)]"
              style={{ fontFamily: "var(--font-mono-org)" }}
            >
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
              className="w-full bg-black/40 border border-white/[0.06] rounded-lg px-4 py-2.5 text-[var(--text-primary)] text-[14px] placeholder:text-white/20 focus:border-[var(--copper)]/40 focus:outline-none transition-colors"
              style={{ fontFamily: "var(--font-body-org)" }}
              placeholder="Enter username"
            />
          </div>

          <div className="space-y-1.5">
            <label
              className="text-[11px] uppercase tracking-[0.1em] text-[var(--text-secondary)]"
              style={{ fontFamily: "var(--font-mono-org)" }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-black/40 border border-white/[0.06] rounded-lg px-4 py-2.5 text-[var(--text-primary)] text-[14px] placeholder:text-white/20 focus:border-[var(--copper)]/40 focus:outline-none transition-colors"
              style={{ fontFamily: "var(--font-body-org)" }}
              placeholder="Enter password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#D4A574] text-[#0A0A0A] font-semibold text-[13px] uppercase tracking-[0.1em] rounded-lg py-2.5 hover:bg-[#B8785C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: "var(--font-display-org)" }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
