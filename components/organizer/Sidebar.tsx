"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Organization } from "@/lib/api";
import NotificationBell from "./NotificationBell";

interface Organizer {
  id: string;
  name: string;
  email: string;
  role: string;
  approval_status: string;
}

interface SidebarProps {
  organizer: Organizer | null;
  organization: Organization | null;
  onSignOut: () => void;
}

const NAV_ITEMS: { label: string; href: string; disabled?: boolean }[] = [
  { label: "Dashboard", href: "/organizers/dashboard" },
  { label: "Events", href: "/organizers/events" },
  { label: "Applications", href: "/organizers/applications" },
  { label: "Followers", href: "/organizers/followers" },
  { label: "Directory", href: "/organizers/directory" },
  { label: "Settings", href: "/organizers/settings" },
];

export default function Sidebar({ organizer, organization, onSignOut }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/organizers/dashboard") return pathname === "/organizers/dashboard";
    return pathname.startsWith(href);
  };

  const navContent = (
    <>
      {/* Wordmark + Notification Bell */}
      <div className="px-5 pt-8 pb-1 flex items-start justify-between">
        <div>
          <h1
            className="text-[18px] uppercase tracking-[0.3em] text-[var(--text-primary)] font-medium"
            style={{ fontFamily: "var(--font-display-org)" }}
          >
            WHISPR
          </h1>
          <p
            className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)] mt-1.5"
            style={{ fontFamily: "var(--font-mono-org)" }}
          >
            Organizer
          </p>
        </div>
        <div className="mt-0.5">
          <NotificationBell />
        </div>
      </div>

      {/* Spacer */}
      <div className="h-10" />

      {/* Navigation */}
      <nav className="flex-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <button
              key={item.href}
              onClick={() => {
                if (!item.disabled) {
                  router.push(item.href);
                  setMobileOpen(false);
                }
              }}
              disabled={item.disabled}
              className={`w-full text-left px-5 py-[11px] text-[13px] uppercase tracking-[0.06em] transition-colors duration-200 block border-l-2 ${
                active
                  ? "text-[var(--text-primary)] border-[var(--copper)] bg-[var(--copper-dim)]"
                  : item.disabled
                  ? "text-[var(--text-muted)] opacity-40 cursor-not-allowed border-transparent"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] border-transparent"
              }`}
              style={{ fontFamily: "var(--font-body-org)" }}
            >
              {item.label}
              {item.disabled && (
                <span className="ml-2 text-[10px] opacity-60">Soon</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Organizer identity block */}
      <div className="mt-auto border-t border-[var(--border-subtle)] px-5 py-5">
        <button
          onClick={() => {
            router.push("/organizers/profile");
            setMobileOpen(false);
          }}
          className="w-full text-left group"
        >
          <p
            className="text-[13px] text-[var(--text-primary)] truncate font-medium"
            style={{ fontFamily: "var(--font-body-org)" }}
          >
            {organizer?.name || "Organizer"}
          </p>
          <p
            className="text-[12px] text-[var(--text-muted)] truncate mt-1"
            style={{ fontFamily: "var(--font-body-org)" }}
          >
            {organization?.name || ""}
          </p>
          <div className="flex items-center gap-2 mt-2.5">
            {organizer?.approval_status === "Approved" && (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--status-live)]" />
                <span
                  className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.06em]"
                  style={{ fontFamily: "var(--font-mono-org)" }}
                >
                  Approved
                </span>
              </>
            )}
            {organizer?.approval_status === "Pending" && (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--status-warning)]" />
                <span
                  className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.06em]"
                  style={{ fontFamily: "var(--font-mono-org)" }}
                >
                  Pending
                </span>
              </>
            )}
          </div>
          <span
            className="text-[11px] text-[var(--text-muted)] group-hover:text-[var(--copper)] transition-colors duration-200 mt-2 inline-block uppercase tracking-[0.06em]"
            style={{ fontFamily: "var(--font-mono-org)" }}
          >
            Edit →
          </span>
        </button>

        {/* Sign out */}
        <button
          onClick={onSignOut}
          className="w-full text-left mt-4 text-[12px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors duration-200 uppercase tracking-[0.06em]"
          style={{ fontFamily: "var(--font-body-org)" }}
        >
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-[220px] bg-[var(--bg-base)] border-r border-[var(--border-subtle)] z-40">
        {navContent}
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[var(--bg-base)] border-b border-[var(--border-subtle)]">
        <div className="flex items-center justify-between px-4 py-3">
          <h1
            className="text-[16px] uppercase tracking-[0.3em] text-[var(--text-primary)] font-medium"
            style={{ fontFamily: "var(--font-display-org)" }}
          >
            WHISPR
          </h1>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-1"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              {mobileOpen ? (
                <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              ) : (
                <>
                  <path d="M3 6H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M3 10H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M3 14H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </>
              )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/60 z-40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="lg:hidden fixed left-0 top-0 bottom-0 w-[260px] bg-[var(--bg-base)] border-r border-[var(--border-subtle)] z-50 flex flex-col">
            {navContent}
          </aside>
        </>
      )}
    </>
  );
}
