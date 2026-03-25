"use client";

import Link from "next/link";

const ACTIONS = [
  { label: "Edit Profile", href: "/organizers/profile" },
  { label: "Edit Organization", href: "/organizers/organization" },
  { label: "Manage Followers", href: "/organizers/followers" },
  { label: "Auto-Approve Rules", href: "/organizers/settings" },
];

export default function QuickActions() {
  return (
    <div className="mt-14">
      <div className="h-px bg-[var(--border-subtle)] mb-8" />
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-3">
        {ACTIONS.map((action, i) => (
          <span key={action.href} className="flex items-center">
            <Link
              href={action.href}
              className="text-[13px] uppercase tracking-[0.06em] text-[var(--text-muted)] hover:text-[var(--copper)] transition-colors duration-200"
              style={{ fontFamily: "var(--font-body-org)" }}
            >
              {action.label}
            </Link>
            {i < ACTIONS.length - 1 && (
              <span className="text-[var(--border-subtle)] mx-3 text-[11px]">·</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
