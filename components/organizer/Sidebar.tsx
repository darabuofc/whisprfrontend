"use client";

import { useState, useRef, useEffect } from "react";
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

const NAV_ITEMS: { label: string; href: string; onboardingId?: string }[] = [
  { label: "Dashboard", href: "/organizers/dashboard" },
  { label: "Followers", href: "/organizers/followers", onboardingId: "sidebar-followers" },
  { label: "Directory", href: "/organizers/directory", onboardingId: "sidebar-directory" },
  { label: "Configuration", href: "/organizers/settings", onboardingId: "sidebar-settings" },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
}

export default function Sidebar({ organizer, organization, onSignOut }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) => {
    if (href === "/organizers/dashboard") return pathname === "/organizers/dashboard";
    return pathname.startsWith(href);
  };

  const initials = getInitials(organizer?.name || "O");

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [profileOpen]);

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
              data-onboarding={item.onboardingId}
              onClick={() => {
                router.push(item.href);
                setMobileOpen(false);
              }}
              className={`w-full text-left px-5 py-[11px] text-[13px] uppercase tracking-[0.06em] transition-colors duration-200 block border-l-2 ${
                active
                  ? "text-[var(--text-primary)] border-[var(--copper)] bg-[var(--copper-dim)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] border-transparent"
              }`}
              style={{ fontFamily: "var(--font-body-org)" }}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Profile Badge */}
      <div className="mt-auto border-t border-[var(--border-subtle)] px-4 py-4" ref={profileRef}>
        <div className="relative">
          <button
            data-onboarding="sidebar-organization"
            onClick={() => setProfileOpen((prev) => !prev)}
            className="w-full flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-[var(--bg-hover)] transition-colors duration-200 group"
          >
            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-full bg-[var(--copper-dim)] border border-[var(--copper)]/30 flex items-center justify-center flex-shrink-0"
              style={{ fontFamily: "var(--font-mono-org)" }}
            >
              <span className="text-[11px] font-semibold text-[var(--copper)] tracking-wider">
                {initials}
              </span>
            </div>

            {/* Name */}
            <div className="flex-1 min-w-0 text-left">
              <p
                className="text-[13px] text-[var(--text-primary)] truncate font-medium leading-tight"
                style={{ fontFamily: "var(--font-body-org)" }}
              >
                {organizer?.name || "Organizer"}
              </p>
            </div>

            {/* Chevron */}
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              className={`flex-shrink-0 text-[var(--text-muted)] transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`}
            >
              <path
                d="M3 5L7 9L11 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Dropdown */}
          {profileOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-1 bg-[var(--bg-elevated,var(--bg-base))] border border-[var(--border-subtle)] rounded-lg shadow-lg overflow-hidden z-50">
              <button
                onClick={() => {
                  router.push("/organizers/profile");
                  setProfileOpen(false);
                  setMobileOpen(false);
                }}
                className="w-full text-left px-4 py-3 text-[12px] uppercase tracking-[0.06em] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors duration-200"
                style={{ fontFamily: "var(--font-body-org)" }}
              >
                Edit Profile
              </button>
              <div className="border-t border-[var(--border-subtle)]" />
              <button
                onClick={() => {
                  setProfileOpen(false);
                  onSignOut();
                }}
                className="w-full text-left px-4 py-3 text-[12px] uppercase tracking-[0.06em] text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors duration-200"
                style={{ fontFamily: "var(--font-body-org)" }}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
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
