"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Image from "next/image";

type AuthMode = "attendee" | "organizer";
type AuthStage = "signin" | "register";

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");
  const stageParam = searchParams.get("mode");
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
      router.replace("/organizers/dashboard");
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
    router.replace("/organizers/dashboard");
  }, [stage, fullName, organizationName, email, password, router, persistSession]);

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
      data.attendee?.is_onboarded
        ? router.replace("/attendees/dashboard")
        : router.replace("/attendees/onboarding");
    } else {
      if (data?.token) {
        persistSession(data.token, "attendee");
        router.replace("/attendees/onboarding");
      } else {
        setStage("signin");
      }
    }
  }, [stage, fullName, email, password, router, persistSession]);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
      {/* Subtle background accent */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-100/40 to-purple-100/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-green-100/30 to-blue-100/30 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Glass card */}
        <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-white/60 p-8 md:p-10">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-lg">
                <Image
                  src="/favicon.svg"
                  alt="Whispr"
                  width={32}
                  height={32}
                  className="h-8 w-8 brightness-0 invert"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-semibold text-center text-slate-800 mb-2">
            {stage === "signin" ? "Sign in to Whispr" : "Create your account"}
          </h1>
          <p className="text-sm text-center text-slate-500 mb-8">
            {mode === "attendee"
              ? "Access your tickets and experiences"
              : "Manage your events and guests"}
          </p>

          {/* Role Toggle */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex bg-slate-100/80 rounded-full p-1">
              {(["attendee", "organizer"] as AuthMode[]).map((r) => {
                const active = mode === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setMode(r)}
                    className={`
                      px-5 py-2 text-sm font-medium rounded-full transition-all duration-200
                      ${active
                        ? "bg-white text-slate-800 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"}
                    `}
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
                <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Jane Doe"
                  className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                />
              </div>
            )}

            {stage === "register" && mode === "organizer" && (
              <div>
                <label htmlFor="organizationName" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Organization Name
                </label>
                <input
                  id="organizationName"
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  required
                  placeholder="Your Company"
                  className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
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
                className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
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
                  className="w-full px-4 py-3 pr-12 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                <p className="text-sm text-red-600 text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`
                w-full py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200
                ${loading
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.98] shadow-sm hover:shadow-md"}
              `}
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
          <p className="mt-6 text-center text-sm text-slate-500">
            {stage === "signin" ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => setStage("register")}
                  className="text-blue-600 font-medium hover:text-blue-700 transition-colors"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setStage("signin")}
                  className="text-blue-600 font-medium hover:text-blue-700 transition-colors"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-slate-400">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
