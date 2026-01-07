"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Eye, EyeOff, Loader2, Ticket, Bell, Sparkles, Shield, Lock } from "lucide-react";
import Image from "next/image";

type AuthMode = "attendee" | "organizer";
type AuthStage = "signin" | "register";

export default function AuthPage() {
  const router = useRouter();
  const prefersReduced = useReducedMotion();
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
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Brand accent by role
  const accent = useMemo(() => (mode === "attendee" ? "#c1ff72" : "#b472ff"), [mode]);
  const accentWeak = useMemo(
    () => (mode === "attendee" ? "rgba(193,255,114,0.16)" : "rgba(180,114,255,0.16)"),
    [mode]
  );

  useEffect(() => {
    document.documentElement.style.setProperty("--accent", accent);
    document.documentElement.style.setProperty("--accent-weak", accentWeak);
  }, [accent, accentWeak]);

  // Sync state with URL params when navigating between roles/modes
  useEffect(() => {
    setMode(initialMode);
    setStage(initialStage);
  }, [initialMode, initialStage]);

  const roleContent = useMemo(
    () =>
      mode === "attendee"
        ? {
            tag: "Discover exclusive experiences",
            h1a: "Find the nights",
            h1b: "that matter.",
            p: "Join gated events, keep your passes in one place, and step into the rooms that aren't for everyone.",
            bullets: [
              { icon: Ticket, text: "Instant access to your tickets & passes" },
              { icon: Bell, text: "Get on lists, stay in the loop" },
              { icon: Sparkles, text: "Unlock hidden experiences" },
            ] as const,
          }
        : {
            tag: "For organizers who care about control",
            h1a: "Build, gate, and run",
            h1b: "unforgettable nights.",
            p: "Own your events end-to-end — ticketing, guest lists, on-site scanning, and payouts without chaos.",
            bullets: [
              { icon: Shield, text: "Fraud-resistant QR validation" },
              { icon: Lock, text: "Role-based access & gating" },
              { icon: Sparkles, text: "Branded, seamless flows" },
            ] as const,
          },
    [mode]
  );

  const persistSession = useCallback((token: string, role: AuthMode) => {
    localStorage.setItem("whispr_token", token);
    // keep legacy key for existing API helper compatibility
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
      setStage("signin");
    }
  }, [stage, fullName, email, password, router, persistSession]);

  // Submit handler
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
      setShake(true);
      setTimeout(() => setShake(false), 420);
    } finally {
      setLoading(false);
    }
  }, [loading, mode, submitOrganizerFlow, submitAttendeeFlow]);

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-[#040404] text-white"
      style={
        {
          ["--accent" as any]: accent,
          ["--accent-weak" as any]: accentWeak,
        } as React.CSSProperties
      }
    >
      {/* ---------- HYBRID BACKGROUND (Glow + Noise) ---------- */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {!prefersReduced ? (
          <>
            <motion.div
              className="absolute -left-1/4 -top-1/5 h-[60vh] w-[70vw] rounded-full blur-[80px]"
              style={{
                background:
                  "radial-gradient(circle at 30% 30%, rgba(180,114,255,0.45), transparent 60%)",
                willChange: "transform, opacity",
              }}
              animate={
                isInputFocused
                  ? { scale: 1, opacity: 0.45 }
                  : { scale: [1, 1.06, 1], opacity: [0.45, 0.7, 0.45] }
              }
              transition={{ duration: 14, repeat: isInputFocused ? 0 : Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute -right-1/3 bottom-[-10%] h-[65vh] w-[75vw] rounded-full blur-[80px]"
              style={{
                background:
                  "radial-gradient(circle at 60% 60%, rgba(193,255,114,0.4), transparent 65%)",
                willChange: "transform, opacity",
              }}
              animate={
                isInputFocused
                  ? { scale: 1, opacity: 0.35 }
                  : { scale: [1, 1.05, 1], opacity: [0.35, 0.6, 0.35] }
              }
              transition={{ duration: 16, repeat: isInputFocused ? 0 : Infinity, ease: "easeInOut" }}
            />
          </>
        ) : (
          <>
            <div
              className="absolute -left-1/4 -top-1/5 h-[60vh] w-[70vw] rounded-full blur-[80px]"
              style={{
                background:
                  "radial-gradient(circle at 30% 30%, rgba(180,114,255,0.35), transparent 60%)",
              }}
            />
            <div
              className="absolute -right-1/3 bottom-[-10%] h-[65vh] w-[75vw] rounded-full blur-[80px]"
              style={{
                background:
                  "radial-gradient(circle at 60% 60%, rgba(193,255,114,0.32), transparent 65%)",
              }}
            />
          </>
        )}
        <div className="absolute inset-0 bg-[radial-gradient(45%_40%_at_50%_40%,rgba(255,255,255,0.04),transparent_60%)]" />
        <div className="absolute inset-0 bg-[url('/noise.png')] bg-[length:240px_240px] opacity-[0.08] mix-blend-overlay" />
      </div>

      {/* ---------- MAIN GRID (starts behind fixed navbar) ---------- */}
      <main className="relative z-10 grid min-h-[100svh] grid-cols-1 overflow-x-hidden md:grid-cols-[1.1fr_0.9fr]">
        {/* LEFT — Marketing copy */}
        <section className="relative hidden items-center pl-10 pr-6 md:flex lg:pl-14 lg:pr-10">
          <div className="relative z-10 max-w-2xl space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-white/70 shadow-[0_0_30px_rgba(193,255,114,0.15)]">
              <Sparkles className="h-3.5 w-3.5" />
              {roleContent.tag}
            </span>

            <div key={mode} className="animate-[fadeSlide_0.5s_ease-out] space-y-6">
              <h1 className="font-semibold tracking-tight text-5xl/tight lg:text-6xl/tight" style={{ textShadow: "0 0 25px rgba(193,255,114,0.22)" }}>
                {roleContent.h1a} <span className="text-[color:var(--accent)]">{roleContent.h1b}</span>
              </h1>
              <p className="max-w-xl text-lg text-white/75">{roleContent.p}</p>

              <ul className="grid gap-3 text-sm text-white/80 sm:grid-cols-2">
                {roleContent.bullets.map(({ icon: Icon, text }, idx) => (
                  <li key={idx} className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 px-3 py-2">
                    <Icon className="h-4 w-4 text-[color:var(--accent)]" />
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* RIGHT — Auth card */}
        <section className="relative flex items-center justify-center px-6 py-12 md:px-10 lg:px-14">
          {/* side glow (stays inside, no spill) */}
          <div aria-hidden className="pointer-events-none absolute inset-0 md:left-1/2">
            <div
              className="absolute inset-0 translate-x-10 blur-3xl opacity-70"
              style={{
                background:
                  "radial-gradient(40% 35% at 65% 50%, var(--accent-weak), transparent 60%)",
              }}
            />
          </div>

          <div
            className={[
              "relative w-full max-w-md",
              shake ? "animate-[shake_0.42s_cubic-bezier(.36,.07,.19,.97)_both]" : "",
            ].join(" ")}
          >
            {/* rim glow */}
            <div
              aria-hidden
              className="absolute -inset-0.5 rounded-[28px] blur-3xl opacity-80"
              style={{
                background:
                  "conic-gradient(from 200deg at 50% 50%, var(--accent-weak), rgba(255,255,255,0.05), var(--accent-weak))",
                filter: "saturate(110%)",
              }}
            />

            {/* card */}
            <div className="relative rounded-[24px] border border-white/10 bg-white/5 p-7 backdrop-blur-xl md:p-8">
              <div className="mb-6 flex items-center justify-between">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/60">
                  <span className="h-2 w-2 rounded-full bg-[color:var(--accent)] shadow-[0_0_12px_var(--accent)]" />
                  Whispr Access
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">
                  Secure
                </span>
              </div>

              {/* logo */}
              <div className="mb-5 flex items-center justify-center">
                <div className="relative">
                  <div
                    className="absolute -inset-3 rounded-xl opacity-30 blur-md"
                    style={{
                      background:
                        "radial-gradient(50% 60% at 50% 50%, var(--accent-weak), transparent)",
                    }}
                  />
                  <div className="relative grid h-12 w-12 place-items-center rounded-xl border border-white/15 bg-white/5">
                    <Image
                      src="/favicon.svg"
                      alt="Whispr"
                      width={28}
                      height={28}
                      className="h-7 w-7"
                      priority
                    />
                  </div>
                </div>
              </div>

              {/* role toggle */}
              <div
                role="tablist"
                aria-label="Choose role"
                className="mb-4 grid grid-cols-2 rounded-full border border-white/10 bg-white/5 p-1"
              >
                {(["attendee", "organizer"] as AuthMode[]).map((r) => {
                  const active = mode === r;
                  return (
                    <button
                      key={r}
                      role="tab"
                      aria-selected={active}
                      aria-controls={`panel-${r}`}
                      type="button"
                      onClick={() => setMode(r)}
                      className={[
                        "relative rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
                        active
                          ? "bg-[color:var(--accent)] text-black shadow-[0_10px_30px_-12px_var(--accent)]"
                          : "text-white/70 hover:text-white",
                      ].join(" ")}
                    >
                      {r === "attendee" ? "Attendee" : "Organizer"}
                    </button>
                  );
                })}
              </div>

              <h2 className="mb-3 text-center text-[13px] text-white/70" id={`panel-${mode}`}>
                {mode === "attendee"
                  ? "Step into your next experience."
                  : "For event organizers & promoters"}
              </h2>

              {/* mode tabs */}
              <div className="mb-4 flex justify-center gap-6" role="tablist" aria-label="Mode">
                {(["signin", "register"] as AuthStage[]).map((m) => {
                  const active = stage === m;
                  return (
                    <button
                      key={m}
                      role="tab"
                      aria-selected={active}
                      aria-controls={`form-${m}`}
                      type="button"
                      onClick={() => setStage(m)}
                      className="relative px-2 py-1 text-sm font-medium text-white/70 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                    >
                      {m === "signin" ? "Sign In" : "Register"}
                      <span
                        className="absolute -bottom-1 left-0 right-0 mx-auto h-[2px] w-10 rounded-full transition-all"
                        style={{ background: active ? "var(--accent)" : "transparent", opacity: active ? 1 : 0 }}
                      />
                    </button>
                  );
                })}
              </div>

              {/* form */}
              <form onSubmit={handleSubmit} id={`form-${stage}`} className="space-y-3">
                {stage === "register" && (
                  <div className="group">
                    <label
                      htmlFor="fullName"
                      className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-white/60"
                    >
                      Full Name
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      onFocus={() => setIsInputFocused(true)}
                      onBlur={() => setIsInputFocused(false)}
                      required
                      placeholder="Jane Doe"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/35 transition-[box-shadow,border-color] focus:border-white/20 focus:shadow-[0_0_0_4px_var(--accent-weak)]"
                    />
                  </div>
                )}
                {stage === "register" && mode === "organizer" && (
                  <div className="group">
                    <label
                      htmlFor="organizationName"
                      className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-white/60"
                    >
                      Organization Name
                    </label>
                    <input
                      id="organizationName"
                      type="text"
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      onFocus={() => setIsInputFocused(true)}
                      onBlur={() => setIsInputFocused(false)}
                      required={mode === "organizer"}
                      placeholder="Club Collective"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/35 transition-[box-shadow,border-color] focus:border-white/20 focus:shadow-[0_0_0_4px_var(--accent-weak)]"
                    />
                  </div>
                )}

                <div className="group">
                  <label
                    htmlFor="email"
                    className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-white/60"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setIsInputFocused(false)}
                    required
                    placeholder="you@domain.com"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/35 transition-[box-shadow,border-color] focus:border-white/20 focus:shadow-[0_0_0_4px_var(--accent-weak)]"
                  />
                </div>

                <div className="group">
                  <label
                    htmlFor="password"
                    className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-white/60"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete={stage === "signin" ? "current-password" : "new-password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setIsInputFocused(true)}
                      onBlur={() => setIsInputFocused(false)}
                      required
                      placeholder={stage === "signin" ? "Your password" : "Create a strong password"}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-11 text-sm outline-none placeholder:text-white/35 transition-[box-shadow,border-color] focus:border-white/20 focus:shadow-[0_0_0_4px_var(--accent-weak)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-white/60 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/40"
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
                    "group relative mt-2 inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-full px-5 py-3 text-sm font-semibold transition",
                    loading
                      ? "cursor-not-allowed bg-white/10 text-white/60"
                      : "bg-[color:var(--accent)] text-black shadow-[0_15px_45px_-15px_rgba(193,255,114,0.7)] hover:brightness-95 active:translate-y-[1px]",
                  ].join(" ")}
                >
                  <span className="relative z-10">
                    {loading
                      ? stage === "signin"
                        ? "Signing you in..."
                        : "Creating account..."
                      : stage === "signin"
                        ? "Sign In"
                        : "Register"}
                  </span>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {!loading && (
                    <span
                      aria-hidden
                      className="absolute inset-0 translate-x-[-110%] bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.5),transparent)] opacity-0 transition duration-700 group-hover:translate-x-[110%] group-hover:opacity-100"
                    />
                  )}
                </button>
              </form>

              {error && (
                <p className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-center text-xs text-red-300">
                  {error}
                </p>
              )}

              <p className="mt-5 text-center text-sm text-white/65">
                {stage === "signin" ? (
                  <>
                    New here?{" "}
                    <button
                      type="button"
                      onClick={() => setStage("register")}
                      className="text-[color:var(--accent)] underline-offset-4 hover:underline"
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
                      className="text-[color:var(--accent)] underline-offset-4 hover:underline"
                    >
                      Sign In
                    </button>
                  </>
                )}
              </p>

              <div className="mt-4 flex items-center justify-between text-xs text-white/55">
                <span className="inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent)] shadow-[0_0_10px_var(--accent)]" />
                  {mode === "attendee" ? "Guest access flow" : "Organizer cockpit"}
                </span>
                <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-white/60">
                  Live
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ---------- Local keyframes ---------- */}
      <style jsx>{`
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
        @keyframes fadeSlide {
          from { opacity: 0; transform: translate3d(0, 10px, 0); }
          to { opacity: 1; transform: translate3d(0, 0, 0); }
        }
      `}</style>
    </div>
  );
}
