"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Image from "next/image";
import ForgotPasswordModal from "@/components/auth/ForgotPasswordModal";

type AuthMode = "attendee" | "organizer";
type AuthStage = "signin" | "register";

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");
  const stageParam = searchParams.get("mode");
  const redirectParam = searchParams.get("redirect");
  const initialMode: AuthMode = roleParam === "organizer" ? "organizer" : "attendee";
  const initialStage: AuthStage = stageParam === "register" ? "register" : "signin";

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [stage, setStage] = useState<AuthStage>(initialStage);
  const [fullName, setFullName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  useEffect(() => {
    setMode(initialMode);
    setStage(initialStage);
  }, [initialMode, initialStage]);

  const persistSession = useCallback((token: string, role: AuthMode) => {
    localStorage.setItem("whispr_token", token);
    localStorage.setItem("token", token);
    localStorage.setItem("whispr_role", role);
  }, []);

  const submitOrganizerFlow = useCallback(async () => {
    if (stage === "register" && (!fullName.trim() || !organizationName.trim())) {
      throw new Error("Please add your full name and organization.");
    }

    const base = process.env.NEXT_PUBLIC_API_URL;
    if (!base) throw new Error("Configuration error: NEXT_PUBLIC_API_URL is not set.");

    if (stage === "register") {
      const res = await fetch(`${base}/organizer/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName.trim(),
          organization_name: organizationName.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 409) throw new Error("An account with this email already exists");
        if (res.status === 422) throw new Error(data?.message || "Please fix the highlighted fields");
        if (res.status >= 500) throw new Error("Something went wrong. Please try again.");
        throw new Error(data?.message || "Something went wrong. Please try again.");
      }

      const token = data?.token;
      if (!token) throw new Error("Something went wrong. Please try again.");
      persistSession(token, "organizer");
      router.replace(redirectParam || "/organizers/dashboard");
      return;
    }

    const res = await fetch(`${base}/organizers/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 422) throw new Error(data?.message || "Please check your email and password");
      if (res.status >= 500) throw new Error("Something went wrong. Please try again.");
      throw new Error(data?.message || "Something went wrong. Please try again.");
    }
    if (!data?.token) throw new Error("Something went wrong. Please try again.");
    persistSession(data.token, "organizer");
    router.replace(redirectParam || "/organizers/dashboard");
  }, [stage, fullName, organizationName, email, password, router, persistSession, redirectParam]);

  const submitAttendeeFlow = useCallback(async () => {
    const base = process.env.NEXT_PUBLIC_API_URL;
    if (!base) throw new Error("Configuration error: NEXT_PUBLIC_API_URL is not set.");

    const endpoint = stage === "signin" ? "/attendees/login" : "/attendees/register";
    const body =
      stage === "signin"
        ? { email: email.trim(), password }
        : { full_name: fullName.trim(), email: email.trim(), password };

    const res = await fetch(`${base}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "Something went wrong. Please try again.");

    if (stage === "signin") {
      if (data?.token) persistSession(data.token, "attendee");
      if (data.attendee?.is_onboarded) {
        router.replace(redirectParam || "/attendees/dashboard");
      } else {
        if (redirectParam) {
          localStorage.setItem("whispr_post_auth_redirect", redirectParam);
        }
        router.replace("/attendees/onboarding");
      }
    } else {
      if (data?.token) {
        persistSession(data.token, "attendee");
        if (redirectParam) {
          localStorage.setItem("whispr_post_auth_redirect", redirectParam);
        }
        router.replace("/attendees/onboarding");
        return;
      }

      const loginRes = await fetch(`${base}/attendees/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const loginData = await loginRes.json().catch(() => ({}));
      if (!loginRes.ok || !loginData?.token) {
        throw new Error("Account created. Please sign in to continue.");
      }

      persistSession(loginData.token, "attendee");
      if (loginData.attendee?.is_onboarded) {
        router.replace(redirectParam || "/attendees/dashboard");
      } else {
        if (redirectParam) {
          localStorage.setItem("whispr_post_auth_redirect", redirectParam);
        }
        router.replace("/attendees/onboarding");
      }
    }
  }, [stage, fullName, email, password, router, persistSession, redirectParam]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      if (mode === "organizer") await submitOrganizerFlow();
      else await submitAttendeeFlow();
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [loading, mode, submitOrganizerFlow, submitAttendeeFlow]);

  const inputClass =
    "w-full px-4 py-3 bg-[#1C1C1E] border border-[#2C2C2E] rounded-lg text-[#F2F2F7] placeholder:text-[#8E8E93] focus:outline-none focus:border-[#D4A574] transition-all duration-150";

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-4" style={{ fontFamily: "var(--font-body)" }}>
      {/* Ambient glow background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-1/4 -left-1/4 w-[70vw] h-[60vh] rounded-full blur-[100px] opacity-30"
          style={{ background: "radial-gradient(circle, rgba(212,165,116,0.25), transparent 60%)" }}
        />
        <div className="absolute inset-0 bg-[url('/noise.png')] bg-[length:200px_200px] opacity-[0.03] mix-blend-overlay" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Glow ring behind card */}
        <div
          className="absolute -inset-1 rounded-[20px] blur-2xl opacity-40"
          style={{
            background: "conic-gradient(from 180deg, rgba(212,165,116,0.15), rgba(255,255,255,0.02), rgba(212,165,116,0.15))"
          }}
        />

        {/* Glass card */}
        <div className="relative bg-[#1C1C1E]/80 backdrop-blur-2xl rounded-xl border border-[#2C2C2E] p-8 md:p-10 shadow-[0_8px_64px_rgba(0,0,0,0.4)]">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div
                className="absolute -inset-6 rounded-full blur-2xl opacity-40"
                style={{ background: "#D4A574" }}
              />
              <Image
                src="/logo.png"
                alt="Whispr"
                width={64}
                height={64}
                className="relative h-16 w-16 drop-shadow-[0_0_20px_rgba(212,165,116,0.3)]"
                priority
              />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl text-center text-[#F2F2F7] mb-2" style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>
            {stage === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-sm text-center text-[#8E8E93] mb-8" style={{ fontFamily: "var(--font-body)" }}>
            {mode === "attendee"
              ? "Access your tickets and experiences"
              : "Manage your events and guests"}
          </p>

          {/* Role Toggle */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex bg-[#0A0A0A] border border-[#2C2C2E] rounded-lg p-1">
              {(["attendee", "organizer"] as AuthMode[]).map((r) => {
                const active = mode === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setMode(r)}
                    className="relative px-5 py-2 text-sm rounded-md transition-all duration-150"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 500,
                      background: active ? "#D4A574" : "transparent",
                      color: active ? "#0A0A0A" : "#8E8E93",
                    }}
                  >
                    {r === "attendee" ? "Attendee" : "Organizer"}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {stage === "register" && (
              <div>
                <label htmlFor="fullName" className="block text-[11px] uppercase tracking-[0.08em] text-[#8E8E93] mb-2" style={{ fontFamily: "var(--font-mono)" }}>
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Jane Doe"
                  className={inputClass}
                />
              </div>
            )}

            {stage === "register" && mode === "organizer" && (
              <div>
                <label htmlFor="organizationName" className="block text-[11px] uppercase tracking-[0.08em] text-[#8E8E93] mb-2" style={{ fontFamily: "var(--font-mono)" }}>
                  Organization Name
                </label>
                <input
                  id="organizationName"
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  required
                  placeholder="Your Company"
                  className={inputClass}
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-[11px] uppercase tracking-[0.08em] text-[#8E8E93] mb-2" style={{ fontFamily: "var(--font-mono)" }}>
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-[11px] uppercase tracking-[0.08em] text-[#8E8E93] mb-2" style={{ fontFamily: "var(--font-mono)" }}>
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={stage === "signin" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder={stage === "signin" ? "Enter your password" : "Create a password"}
                  className={`${inputClass} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[#8E8E93] hover:text-[#F2F2F7] transition-colors duration-150"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {stage === "signin" && (
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="mt-2 text-xs text-[#D4A574]/70 hover:text-[#D4A574] transition-colors duration-150"
                >
                  Forgot password?
                </button>
              )}
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                <p className="text-sm text-red-400 text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-lg text-sm mt-2 transition-all duration-150"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                background: loading ? "rgba(255,255,255,0.05)" : "#D4A574",
                color: loading ? "rgba(255,255,255,0.4)" : "#0A0A0A",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {stage === "signin" ? "Signing in..." : "Creating account..."}
                </span>
              ) : (
                stage === "signin" ? "Sign In" : "Create Account"
              )}
            </button>
          </form>

          {/* Toggle auth stage */}
          <p className="mt-6 text-center text-sm text-[#8E8E93]">
            {stage === "signin" ? (
              <>
                New here?{" "}
                <button
                  type="button"
                  onClick={() => setStage("register")}
                  className="font-medium text-[#D4A574] hover:text-[#B8785C] transition-colors duration-150"
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setStage("signin")}
                  className="font-medium text-[#D4A574] hover:text-[#B8785C] transition-colors duration-150"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-[#8E8E93]/60">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        mode={mode}
      />
    </div>
  );
}
