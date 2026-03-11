"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  MailCheck,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function ThankYou() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("whispr_token") || localStorage.getItem("token")
        : null;
    const role = typeof window !== "undefined" ? localStorage.getItem("whispr_role") : null;

    if (!token) {
      router.replace("/auth?role=organizer");
      return;
    }
    if (role && role !== "organizer") {
      router.replace(role === "attendee" ? "/attendees/dashboard" : "/auth");
      return;
    }

    setAuthorized(true);
  }, [router]);

  if (!authorized) return <div className="p-8 text-white">Checking access...</div>;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0A0A0A] text-white">
      {/* Atmosphere */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-1/3 top-[-12%] h-[55vh] w-[65vw] rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(212,165,116,0.35),transparent_60%)] blur-[140px]" />
        <div className="absolute -right-1/4 bottom-[-8%] h-[60vh] w-[70vw] rounded-full bg-[radial-gradient(circle_at_70%_60%,rgba(142,142,147,0.28),transparent_62%)] blur-[180px]" />
        <div className="absolute inset-0 bg-[radial-gradient(45%_40%_at_50%_40%,rgba(255,255,255,0.05),transparent_65%)]" />
        <div className="absolute inset-0 bg-[url('/noise.png')] bg-[length:240px_240px] opacity-[0.08] mix-blend-overlay" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-10">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 transition hover:border-[#D4A574]/60 hover:text-white"
          >
            <ArrowLeft size={14} />
            Back to home
          </Link>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs uppercase tracking-[0.2em] text-white/60" style={{ fontFamily: "var(--font-mono)" }}>
            <Sparkles size={14} className="text-[#D4A574]" />
            Organizer mode
          </span>
        </div>

        <div className="mt-12 grid items-center gap-8 lg:grid-cols-[1.1fr,0.9fr]">
          {/* Hero card */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-[#0A0A0A] p-8 shadow-[0_25px_140px_-50px_rgba(0,0,0,0.85)] backdrop-blur-xl">
            <div className="absolute inset-0 rounded-3xl border border-white/5 opacity-50" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(212,165,116,0.18),transparent_45%)]" />
            <div className="relative flex flex-col gap-4">
              <div className="inline-flex items-center gap-2 self-start rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs text-white/70">
                <CheckCircle2 size={14} className="text-[#D4A574]" />
                Application received
              </div>
              <h1 className="text-4xl font-semibold leading-tight md:text-[42px]" style={{ fontFamily: "var(--font-display)", fontWeight: 700, textShadow: "0 0 26px rgba(212,165,116,0.25)" }}>
                You’re officially on our radar.
              </h1>
              <p className="max-w-xl text-base text-white/70">
                Thanks for trusting Whispr with your event. Our team is reviewing your
                details now. Expect a welcome email and next steps within a few hours.
              </p>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/organizers/dashboard"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#D4A574] px-5 py-3 text-base font-semibold text-[#0A0A0A] hover:bg-[#B8785C] transition"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
                >
                  Open dashboard
                  <ArrowRight size={16} />
                </Link>
              <Link
                href="/organizers/events"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#2C2C2E] text-[#8E8E93] hover:border-[#D4A574] hover:text-[#D4A574] bg-transparent px-5 py-3 text-sm transition"
                style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
              >
                Plan a new event
              </Link>
              </div>

              <div className="mt-6 grid gap-4 rounded-2xl border border-white/10 bg-black/30 p-4 sm:grid-cols-3">
                {[
                  {
                    icon: MailCheck,
                    title: "Confirmation sent",
                    desc: "Check your inbox for the receipt and onboarding deck.",
                  },
                  {
                    icon: CalendarClock,
                    title: "Setup call",
                    desc: "We’ll offer a timeslot to align on timelines and access.",
                  },
                  {
                    icon: ShieldCheck,
                    title: "Safe & ready",
                    desc: "Your organizer profile is secured with two-step checks.",
                  },
                ].map((item) => (
                  <div key={item.title} className="space-y-2 rounded-xl border border-white/5 bg-white/5 p-3">
                    <item.icon size={18} className="text-[#D4A574]" />
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="text-xs text-white/60 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Status rail */}
          <div className="relative rounded-3xl border border-white/10 bg-white/5 p-7 shadow-[0_25px_120px_-50px_rgba(0,0,0,0.9)] backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/60" style={{ fontFamily: "var(--font-mono)" }}>What happens next</p>
                <h3 className="text-2xl font-semibold mt-1" style={{ fontFamily: "var(--font-display)", fontWeight: 600, textShadow: "0 0 20px rgba(212,165,116,0.2)" }}>
                  Your organizer pipeline
                </h3>
              </div>
              <Sparkles className="text-[#D4A574]" />
            </div>

            <div className="mt-6 space-y-4">
              {[
                {
                  label: "Step 1",
                  title: "Review & verification",
                  desc: "We validate your profile and event intent to activate organizer tools.",
                  status: "done",
                },
                {
                  label: "Step 2",
                  title: "Onboarding call",
                  desc: "Meet your Whispr partner to set goals, ticketing, and access control.",
                  status: "in-progress",
                },
                {
                  label: "Step 3",
                  title: "Launch toolkit",
                  desc: "Go live with branded passes, guest flows, and real-time dashboards.",
                  status: "up-next",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-white/8 via-white/4 to-black/40 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-8 w-8 rounded-full border border-white/15 bg-black/40 flex items-center justify-center text-xs uppercase tracking-[0.18em] text-white/70">
                      {item.label.replace("Step ", "")}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{item.title}</p>
                        {item.status === "done" && (
                          <span className="rounded-full bg-[#D4A574]/20 px-2 py-[2px] text-[11px] font-semibold text-[#D4A574]">
                            Completed
                          </span>
                        )}
                        {item.status === "in-progress" && (
                          <span className="rounded-full bg-[#8E8E93]/20 px-2 py-[2px] text-[11px] font-semibold text-[#8E8E93]">
                            In progress
                          </span>
                        )}
                        {item.status === "up-next" && (
                          <span className="rounded-full bg-white/10 px-2 py-[2px] text-[11px] font-semibold text-white/70">
                            Up next
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/60 leading-relaxed mt-1">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="mailto:hello@whispr.co"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#D4A574]/50 bg-[#D4A574]/10 px-4 py-3 text-sm font-semibold text-[#D4A574] transition hover:bg-[#D4A574]/20"
                style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
              >
                Talk with us
              </Link>
              <Link
                href="/organizers/dashboard"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#2C2C2E] text-[#8E8E93] hover:border-[#D4A574] hover:text-[#D4A574] bg-transparent px-4 py-3 text-sm transition"
                style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
              >
                View my dashboard
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
