"use client";

import { useState } from "react";
import Link from "next/link";
import type { Organization } from "@/lib/api";
import EditOrganizationModal from "./EditOrganizationModal";

const LINK_ACTIONS = [
  { label: "Edit Profile", href: "/organizers/profile" },
  { label: "Manage Followers", href: "/organizers/followers" },
  { label: "Auto-Approve Rules", href: "/organizers/settings" },
];

interface QuickActionsProps {
  organization?: Organization | null;
  onOrganizationSaved?: () => void;
}

export default function QuickActions({ organization = null, onOrganizationSaved }: QuickActionsProps) {
  const [orgModalOpen, setOrgModalOpen] = useState(false);

  const allItems = [
    LINK_ACTIONS[0],
    { label: "View Organization", isModal: true },
    ...LINK_ACTIONS.slice(1),
  ];

  return (
    <div className="mt-14">
      <div className="h-px bg-[var(--border-subtle)] mb-8" />
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-3">
        {allItems.map((action, i) => (
          <span key={action.label} className="flex items-center">
            {"isModal" in action ? (
              <button
                onClick={() => setOrgModalOpen(true)}
                className="text-[13px] uppercase tracking-[0.06em] text-[var(--text-muted)] hover:text-[var(--copper)] transition-colors duration-200"
                style={{ fontFamily: "var(--font-body-org)" }}
              >
                {action.label}
              </button>
            ) : (
              <Link
                href={action.href}
                className="text-[13px] uppercase tracking-[0.06em] text-[var(--text-muted)] hover:text-[var(--copper)] transition-colors duration-200"
                style={{ fontFamily: "var(--font-body-org)" }}
              >
                {action.label}
              </Link>
            )}
            {i < allItems.length - 1 && (
              <span className="text-[var(--border-subtle)] mx-3 text-[11px]">·</span>
            )}
          </span>
        ))}
      </div>

      <EditOrganizationModal
        isOpen={orgModalOpen}
        onClose={() => setOrgModalOpen(false)}
        organization={organization}
        onSaved={onOrganizationSaved}
      />
    </div>
  );
}
