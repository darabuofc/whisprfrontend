"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import AutoApproveRules from "@/components/organizer/AutoApproveRules";
import { useOnboarding } from "@/onboarding/context/useOnboarding";

export default function SettingsPage() {
  const [reinvoking, setReinvoking] = useState(false);

  let onboarding: ReturnType<typeof useOnboarding> | null = null;
  try {
    onboarding = useOnboarding();
  } catch {
    // Not in onboarding context
  }

  async function handleReinvoke() {
    if (!onboarding || reinvoking) return;
    setReinvoking(true);
    try {
      await onboarding.reinvoke();
    } finally {
      setReinvoking(false);
    }
  }

  return (
    <div className="max-w-[1100px] mx-auto px-6 sm:px-12 py-20">
      <h1
        className="text-[14px] uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-10"
        style={{ fontFamily: "var(--font-display-org)" }}
        data-onboarding="sidebar-settings"
      >
        Settings
      </h1>

      <div>
        <h2
          className="text-[12px] uppercase tracking-[0.15em] text-[var(--text-muted)] mb-6"
          style={{ fontFamily: "var(--font-body-org)" }}
        >
          Auto-Approve Rules
        </h2>

        <AutoApproveRules />
      </div>

      {/* Onboarding re-invocation */}
      {onboarding && !onboarding.isOnboarding && (
        <div className="mt-16 border-t border-[var(--border-subtle)] pt-8">
          <h2
            className="text-[12px] uppercase tracking-[0.15em] text-[var(--text-muted)] mb-4"
            style={{ fontFamily: "var(--font-body-org)" }}
          >
            Onboarding
          </h2>

          <button
            onClick={handleReinvoke}
            disabled={reinvoking}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[var(--border-subtle)] text-[13px] text-[var(--text-secondary)] hover:text-white hover:border-[#D4A574] transition-all disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {reinvoking ? "Restarting..." : "Replay onboarding tour"}
          </button>
        </div>
      )}
    </div>
  );
}
