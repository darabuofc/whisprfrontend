"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Eye, EyeOff, Loader2, Ticket, Bell, Sparkles, Shield, Lock } from "lucide-react";
import { useSearchParams } from "next/navigation";


type Role = "attendee" | "organizer";
type Mode = "signin" | "register";

export default function AuthPage() {
  const router = useRouter();
  const prefersReduced = useReducedMotion();
  const searchParams = useSearchParams(); // 👈 added
  const initialRole = (searchParams.get("role") as Role) || "attendee";
  const initialMode = (searchParams.get("mode") as Mode) || "signin";



  // UI state
  const [role, setRole] = useState<Role>("attendee");
  const [mode, setMode] = useState<Mode>("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  // Brand accent by role
  const accent = useMemo(() => (role === "attendee" ? "#c1ff72" : "#b472ff"), [role]);
  const accentWeak = useMemo(
    () => (role === "attendee" ? "rgba(193,255,114,0.16)" : "rgba(180,114,255,0.16)"),
    [role]
  );

  useEffect(() => {
    document.documentElement.style.setProperty("--accent", accent);
    document.documentElement.style.setProperty("--accent-weak", accentWeak);
  }, [accent, accentWeak]);

  const roleContent =
    role === "attendee"
      ? {
          tag: "Discover exclusive experiences",
          h1a: "Find the nights",
          h1b: "that matter.",
          p: "Join gated events, keep your passes in one place, and step into the rooms that aren’t for everyone.",
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
        };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    const endpoint =
      mode === "signin"
        ? `/${role === "attendee" ? "attendees" : "organizers"}/login`
        : `/${role === "attendee" ? "attendees" : "organizers"}/register`;

    const body =
      mode === "signin"
        ? { email: email.trim(), password }
        : { full_name: fullName.trim(), email: email.trim(), password };

    try {
      const base = process.env.NEXT_PUBLIC_API_URL;
      if (!base) throw new Error("Configuration error: NEXT_PUBLIC_API_URL is not set.");

      const res = await fetch(`${base}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Request failed");

      if (mode === "signin") {
        localStorage.setItem("token", data.token);
        if (role === "attendee") {
          data.attendee?.is_onboarded
            ? router.replace("/attendees/dashboard")
            : router.replace("/attendees/onboarding");
        } else {
          router.replace("/organizers/dashboard");
        }
      } else {
        if (role === "attendee") setMode("signin");
        else router.push("/organizers/thank-you");
      }
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
      className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#050505] via-[#0a0015] to-[#1a001a] text-white"
      style={
        {
          ["--accent" as any]: accent,
          ["--accent-weak" as any]: accentWeak,
        } as React.CSSProperties
      }
    >
      {/* ---------- HYBRID BACKGROUND (Glow + Noise) ---------- */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {/* Motion blobs. Clipped to viewport to avoid horizontal scroll. */}
        {!prefersReduced && (
          <>
            <motion.div
              className="absolute left-[-15vw] top-[-20vh] h-[85vw] w-[85vw] rounded-full blur-[180px]"
              style={{
                background:
                  "radial-gradient(50% 50% at 50% 50%, rgba(180,114,255,0.28) 0%, transparent 70%)",
                willChange: "transform, opacity",
              }}
              animate={{ scale: [1, 1.08, 1], opacity: [0.55, 0.75, 0.55] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute right-[-10vw] top-[15vh] h-[70vw] w-[70vw] rounded-full blur-[160px]"
              style={{
                background:
                  "radial-gradient(50% 50% at 50% 50%, rgba(193,255,114,0.22) 0%, transparent 70%)",
                willChange: "transform, opacity",
              }}
              animate={{ scale: [1, 1.05, 1], opacity: [0.4, 0.65, 0.4] }}
              transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
            />
          </>
        )}

        {/* Static fallback for reduced motion users */}
        {prefersReduced && (
          <>
            <div
              className="absolute left-[-15vw] top-[-20vh] h-[85vw] w-[85vw] rounded-full blur-[180px]"
              style={{
                background:
                  "radial-gradient(50% 50% at 50% 50%, rgba(180,114,255,0.25) 0%, transparent 70%)",
              }}
            />
            <div
              className="absolute right-[-10vw] top-[15vh] h-[70vw] w-[70vw] rounded-full blur-[160px]"
              style={{
                background:
                  "radial-gradient(50% 50% at 50% 50%, rgba(193,255,114,0.18) 0%, transparent 70%)",
              }}
            />
          </>
        )}

        {/* Noise overlay */}
        <div className="absolute inset-0 bg-[url('/noise.png')] bg-[length:240px_240px] opacity-[0.07] mix-blend-overlay" />
      </div>

      {/* ---------- MAIN GRID (starts behind fixed navbar) ---------- */}
      <main className="relative z-10 grid min-h-[100svh] grid-cols-1 overflow-x-hidden md:grid-cols-[1.1fr_0.9fr]">
        {/* LEFT — Marketing copy */}
        <section className="relative hidden items-center pl-10 pr-6 md:flex lg:pl-14 lg:pr-10">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] tracking-wide text-white/70">
              <Sparkles className="h-3.5 w-3.5" />
              {roleContent.tag}
            </span>

            <div key={role} className="animate-[fadeSlide_0.5s_ease-out]">
              <h1 className="mt-5 font-extrabold tracking-tight text-5xl/tight lg:text-6xl/tight">
                {roleContent.h1a} <span className="text-[color:var(--accent)]">{roleContent.h1b}</span>
              </h1>
              <p className="mt-4 max-w-xl text-white/70">{roleContent.p}</p>

              <ul className="mt-7 grid gap-3 text-sm text-white/80">
                {roleContent.bullets.map(({ icon: Icon, text }, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-[color:var(--accent)]" />
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* RIGHT — Auth card */}
        <section className="relative flex items-center justify-center px-6 py-10 md:px-10 md:py-8 lg:px-14">
          {/* side glow (stays inside, no spill) */}
          <div aria-hidden className="pointer-events-none absolute inset-0 md:left-1/2">
            <div
              className="absolute inset-0 translate-x-8 blur-2xl opacity-60"
              style={{
                background:
                  "radial-gradient(40% 35% at 65% 50%, var(--accent-weak), transparent 60%)",
              }}
            />
          </div>

          <div
            className={[
              "relative w-full max-w-sm",
              shake ? "animate-[shake_0.42s_cubic-bezier(.36,.07,.19,.97)_both]" : "",
            ].join(" ")}
          >
            {/* rim glow */}
            <div
              aria-hidden
              className="absolute -inset-0.5 rounded-3xl blur-2xl opacity-70"
              style={{
                background:
                  "conic-gradient(from 200deg at 50% 50%, var(--accent-weak), rgba(255,255,255,0.05), var(--accent-weak))",
                filter: "saturate(110%)",
              }}
            />

            {/* card */}
            <div className="relative rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur-xl md:p-8">
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
                  <div className="relative grid h-11 w-11 place-items-center rounded-xl border border-white/15 bg-white/5">
                    <span className="text-base font-bold tracking-wider">W</span>
                  </div>
                </div>
              </div>

              {/* role toggle */}
              <div
                role="tablist"
                aria-label="Choose role"
                className="mb-4 grid grid-cols-2 rounded-xl border border-white/10 bg-white/5 p-1"
              >
                {(["attendee", "organizer"] as Role[]).map((r) => {
                  const active = role === r;
                  return (
                    <button
                      key={r}
                      role="tab"
                      aria-selected={active}
                      aria-controls={`panel-${r}`}
                      type="button"
                      onClick={() => setRole(r)}
                      className={[
                        "relative rounded-lg px-4 py-2 text-xs font-semibold tracking-wide transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
                        active ? "bg-[color:var(--accent)] text-black" : "text-white/70 hover:text-white",
                      ].join(" ")}
                    >
                      {r === "attendee" ? "Attendee" : "Organizer"}
                    </button>
                  );
                })}
              </div>

              <h2 className="mb-3 text-center text-[13px] text-white/70" id={`panel-${role}`}>
                {role === "attendee"
                  ? "Step into your next experience."
                  : "Own every detail of your event."}
              </h2>

              {/* mode tabs */}
              <div className="mb-4 flex justify-center gap-6" role="tablist" aria-label="Mode">
                {(["signin", "register"] as Mode[]).map((m) => {
                  const active = mode === m;
                  return (
                    <button
                      key={m}
                      role="tab"
                      aria-selected={active}
                      aria-controls={`form-${m}`}
                      type="button"
                      onClick={() => setMode(m)}
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
              <form onSubmit={handleSubmit} id={`form-${mode}`} className="space-y-3">
                {mode === "register" && (
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
                      required
                      placeholder="Jane Doe"
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
                      autoComplete={mode === "signin" ? "current-password" : "new-password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder={mode === "signin" ? "Your password" : "Create a strong password"}
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
                    "group relative mt-2 inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl px-4 py-3 text-sm font-semibold transition",
                    loading
                      ? "cursor-not-allowed bg-white/10 text-white/60"
                      : "bg-[color:var(--accent)] text-black hover:brightness-95 active:translate-y-[1px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]",
                  ].join(" ")}
                >
                  <span className="relative z-10">
                    {loading
                      ? mode === "signin"
                        ? "Signing you in..."
                        : "Creating account..."
                      : mode === "signin"
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
                {mode === "signin" ? (
                  <>
                    New here?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("register")}
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
                      onClick={() => setMode("signin")}
                      className="text-[color:var(--accent)] underline-offset-4 hover:underline"
                    >
                      Sign In
                    </button>
                  </>
                )}
              </p>
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
