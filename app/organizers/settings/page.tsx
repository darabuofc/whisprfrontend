"use client";

import AutoApproveRules from "@/components/organizer/AutoApproveRules";

export default function SettingsPage() {
  return (
    <div className="max-w-[1100px] mx-auto px-6 sm:px-12 py-20">
      <h1
        className="text-[14px] uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-10"
        style={{ fontFamily: "var(--font-display-org)" }}
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
    </div>
  );
}
