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
    <div className="mt-12">
      <div className="h-px bg-[var(--border-subtle)] mb-6" />
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2">
        {ACTIONS.map((action, i) => (
          <span key={action.href} className="flex items-center">
            <Link
              href={action.href}
              className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)] hover:text-[var(--copper)] transition-colors duration-200"
              style={{ fontFamily: "var(--font-body-org)" }}
            >
              {action.label}
            </Link>
            {i < ACTIONS.length - 1 && (
              <span className="text-[var(--text-muted)] mx-2 text-[10px]">·</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
