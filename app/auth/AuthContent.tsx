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

  const accent = mode === "attendee" ? "#c1ff72" : "#b472ff";

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
      // Use redirect param if present and user is onboarded, otherwise use default flow
      if (data.attendee?.is_onboarded) {
        router.replace(redirectParam || "/attendees/dashboard");
      } else {
        // Save redirect URL for after onboarding if present
        if (redirectParam) {
          localStorage.setItem("whispr_post_auth_redirect", redirectParam);
        }
        router.replace("/attendees/onboarding");
      }
    } else {
      // Registration succeeded - try to use token if provided, otherwise auto-login
      if (data?.token) {
        persistSession(data.token, "attendee");
        // Save redirect URL for after onboarding if present
        if (redirectParam) {
          localStorage.setItem("whispr_post_auth_redirect", redirectParam);
        }
        router.replace("/attendees/onboarding");
        return;
      }

      // No token in registration response - auto-login with same credentials
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
        // Save redirect URL for after onboarding if present
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

  return (
    <div className="min-h-screen bg-[#040404] text-white flex items-center justify-center p-4">
      {/* Ambient glow background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-1/4 -left-1/4 w-[70vw] h-[60vh] rounded-full blur-[100px] opacity-50"
          style={{ background: "radial-gradient(circle, rgba(180,114,255,0.4), transparent 60%)" }}
        />
        <div
          className="absolute -bottom-1/4 -right-1/4 w-[70vw] h-[60vh] rounded-full blur-[100px] opacity-40"
          style={{ background: "radial-gradient(circle, rgba(193,255,114,0.35), transparent 60%)" }}
        />
        <div className="absolute inset-0 bg-[url('/noise.png')] bg-[length:200px_200px] opacity-[0.03] mix-blend-overlay" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Glow ring behind card */}
        <div
          className="absolute -inset-1 rounded-[32px] blur-2xl opacity-60"
          style={{
            background: mode === "attendee"
              ? "conic-gradient(from 180deg, rgba(193,255,114,0.15), rgba(255,255,255,0.02), rgba(193,255,114,0.15))"
              : "conic-gradient(from 180deg, rgba(180,114,255,0.15), rgba(255,255,255,0.02), rgba(180,114,255,0.15))"
          }}
        />

        {/* Glass card */}
        <div className="relative bg-white/[0.03] backdrop-blur-2xl rounded-3xl border border-white/[0.08] p-8 md:p-10 shadow-[0_8px_64px_rgba(0,0,0,0.4)]">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div
                className="absolute -inset-6 rounded-full blur-2xl opacity-50"
                style={{ background: accent }}
              />
              <Image
                src="/logo.png"
                alt="Whispr"
                width={64}
                height={64}
                className="relative h-16 w-16 drop-shadow-[0_0_20px_rgba(193,255,0,0.3)]"
                priority
              />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-semibold text-center text-white mb-2">
            {stage === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-sm text-center text-white/50 mb-8">
            {mode === "attendee"
              ? "Access your tickets and experiences"
              : "Manage your events and guests"}
          </p>

          {/* Role Toggle */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex bg-white/[0.04] border border-white/[0.08] rounded-full p-1">
              {(["attendee", "organizer"] as AuthMode[]).map((r) => {
                const active = mode === r;
                const btnAccent = r === "attendee" ? "#c1ff72" : "#b472ff";
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setMode(r)}
                    className="relative px-5 py-2 text-sm font-medium rounded-full transition-all duration-300"
                    style={{
                      background: active ? btnAccent : "transparent",
                      color: active ? "#000" : "rgba(255,255,255,0.6)",
                      boxShadow: active ? `0 8px 24px -8px ${btnAccent}` : "none",
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
                <label htmlFor="fullName" className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Jane Doe"
                  className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all"
                />
              </div>
            )}

            {stage === "register" && mode === "organizer" && (
              <div>
                <label htmlFor="organizationName" className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2">
                  Organization Name
                </label>
                <input
                  id="organizationName"
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  required
                  placeholder="Your Company"
                  className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2">
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
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2">
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
                  className="w-full px-4 py-3 pr-12 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-white/40 hover:text-white/70 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {stage === "signin" && (
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="mt-2 text-xs transition-colors"
                  style={{ color: `${accent}99` }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = accent)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = `${accent}99`)}
                >
                  Forgot password?
                </button>
              )}
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <p className="text-sm text-red-400 text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl text-sm font-semibold transition-all duration-300 mt-2"
              style={{
                background: loading ? "rgba(255,255,255,0.05)" : accent,
                color: loading ? "rgba(255,255,255,0.4)" : "#000",
                boxShadow: loading ? "none" : `0 12px 32px -12px ${accent}`,
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
          <p className="mt-6 text-center text-sm text-white/40">
            {stage === "signin" ? (
              <>
                New here?{" "}
                <button
                  type="button"
                  onClick={() => setStage("register")}
                  className="font-medium transition-colors"
                  style={{ color: accent }}
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
                  className="font-medium transition-colors"
                  style={{ color: accent }}
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-white/30">
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
