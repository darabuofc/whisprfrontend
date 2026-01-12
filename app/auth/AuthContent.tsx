"use client";

import { useEffect, useMemo, useState } from "react";
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

  // UI state
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [stage, setStage] = useState<AuthStage>(initialStage);
  const [fullName, setFullName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  // Brand accent by role
  const accent = useMemo(() => (mode === "attendee" ? "#c1ff72" : "#b472ff"), [mode]);
  const accentRgb = useMemo(
    () => (mode === "attendee" ? "193, 255, 114" : "180, 114, 255"),
    [mode]
  );

  useEffect(() => {
    document.documentElement.style.setProperty("--accent", accent);
    document.documentElement.style.setProperty("--accent-rgb", accentRgb);
  }, [accent, accentRgb]);

  // Sync state with URL params when navigating between roles/modes
  useEffect(() => {
    setMode(initialMode);
    setStage(initialStage);
  }, [initialMode, initialStage]);

  const persistSession = (token: string, role: AuthMode) => {
    localStorage.setItem("whispr_token", token);
    localStorage.setItem("token", token);
    localStorage.setItem("whispr_role", role);
  };

  const submitOrganizerFlow = async () => {
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

    // Organizer sign in
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
  };

  const submitAttendeeFlow = async () => {
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
      setStage("signin");
    }
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      if (mode === "organizer") await submitOrganizerFlow();
      else await submitAttendeeFlow();
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong");
      setShake(true);
      setTimeout(() => setShake(false), 420);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0a0a] px-4 text-white"
      style={
        {
          ["--accent" as any]: accent,
          ["--accent-rgb" as any]: accentRgb,
        } as React.CSSProperties
      }
    >
      {/* Simplified background - subtle gradient only */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle at 50% 0%, rgba(${accentRgb}, 0.15), transparent 70%)`,
          }}
        />
      </div>

      {/* Main auth card */}
      <div
        className={[
          "relative z-10 w-full max-w-[420px] transition-transform duration-300",
          shake ? "animate-[shake_0.42s_cubic-bezier(.36,.07,.19,.97)_both]" : "",
        ].join(" ")}
      >
        {/* Card */}
        <div className="rounded-3xl border border-white/[0.08] bg-[#111]/80 p-8 shadow-2xl backdrop-blur-sm">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <div className="grid h-16 w-16 place-items-center rounded-2xl border border-white/10 bg-white/5">
              <Image
                src="/favicon.svg"
                alt="Whispr"
                width={32}
                height={32}
                className="h-8 w-8"
                priority
              />
            </div>
          </div>

          {/* Title */}
          <h1 className="mb-2 text-center text-2xl font-semibold tracking-tight">
            {stage === "signin" ? "Sign in to Whispr" : "Create your account"}
          </h1>
          <p className="mb-8 text-center text-sm text-white/60">
            {mode === "attendee"
              ? "Access exclusive events and experiences"
              : "Manage your events and guest lists"}
          </p>

          {/* Role toggle */}
          <div className="mb-6 grid grid-cols-2 gap-2">
            {(["attendee", "organizer"] as AuthMode[]).map((r) => {
              const active = mode === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setMode(r)}
                  className={[
                    "rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
                    active
                      ? "bg-[color:var(--accent)] text-black shadow-lg"
                      : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white",
                  ].join(" ")}
                >
                  {r === "attendee" ? "Attendee" : "Organizer"}
                </button>
              );
            })}
          </div>

          {/* Sign in / Register tabs */}
          <div className="mb-6 flex justify-center gap-6">
            {(["signin", "register"] as AuthStage[]).map((m) => {
              const active = stage === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setStage(m)}
                  className={[
                    "relative pb-2 text-sm font-medium transition-colors",
                    active ? "text-white" : "text-white/50 hover:text-white/70",
                  ].join(" ")}
                >
                  {m === "signin" ? "Sign In" : "Register"}
                  {active && (
                    <span
                      className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                      style={{ background: "var(--accent)" }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {stage === "register" && (
              <div>
                <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-white/80">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Jane Doe"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/30 transition-all focus:border-[color:var(--accent)] focus:bg-white/[0.07]"
                />
              </div>
            )}

            {stage === "register" && mode === "organizer" && (
              <div>
                <label htmlFor="organizationName" className="mb-2 block text-sm font-medium text-white/80">
                  Organization Name
                </label>
                <input
                  id="organizationName"
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  required={mode === "organizer"}
                  placeholder="Club Collective"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/30 transition-all focus:border-[color:var(--accent)] focus:bg-white/[0.07]"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-white/80">
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
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/30 transition-all focus:border-[color:var(--accent)] focus:bg-white/[0.07]"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-white/80">
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
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-11 text-sm outline-none placeholder:text-white/30 transition-all focus:border-[color:var(--accent)] focus:bg-white/[0.07]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={[
                "mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all",
                loading
                  ? "cursor-not-allowed bg-white/10 text-white/50"
                  : "bg-[color:var(--accent)] text-black hover:opacity-90 active:scale-[0.98]",
              ].join(" ")}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {stage === "signin" ? "Signing in..." : "Creating account..."}
                </>
              ) : (
                <>{stage === "signin" ? "Sign In" : "Create Account"}</>
              )}
            </button>
          </form>

          {error && (
            <p className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-center text-xs text-red-300">
              {error}
            </p>
          )}

          <p className="mt-6 text-center text-sm text-white/60">
            {stage === "signin" ? (
              <>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setStage("register")}
                  className="font-medium text-[color:var(--accent)] hover:underline"
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
                  className="font-medium text-[color:var(--accent)] hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Minimal keyframes */}
      <style jsx>{`
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
      `}</style>
    </div>
  );
}
