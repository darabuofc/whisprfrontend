"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Users,
  UserCheck,
  LogOut,
  Menu,
  X,
} from "lucide-react";

interface AdminSidebarProps {
  onSignOut: () => void;
}

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Events", href: "/admin/events", icon: Calendar },
  { label: "Organizers", href: "/admin/organizers", icon: Users },
  { label: "Attendees", href: "/admin/attendees", icon: UserCheck },
];

export default function AdminSidebar({ onSignOut }: AdminSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const navContent = (
    <>
      {/* Wordmark */}
      <div className="px-5 pt-8 pb-6">
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
          Admin
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <button
              key={item.href}
              onClick={() => {
                router.push(item.href);
                setMobileOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all text-[13px] ${
                active
                  ? "bg-[var(--copper-dim)] text-[var(--copper)] border-l-2 border-[var(--copper)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.03]"
              }`}
              style={{ fontFamily: "var(--font-body-org)" }}
            >
              <Icon size={16} strokeWidth={active ? 2 : 1.5} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Sign Out */}
      <div className="px-3 pb-6">
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/[0.06] transition-all"
          style={{ fontFamily: "var(--font-body-org)" }}
        >
          <LogOut size={16} strokeWidth={1.5} />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile header bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-[52px] bg-[var(--bg-base)] border-b border-[var(--border-subtle)] flex items-center px-4">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-[var(--text-primary)]"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <span
          className="ml-3 text-[14px] uppercase tracking-[0.2em] text-[var(--text-primary)] font-medium"
          style={{ fontFamily: "var(--font-display-org)" }}
        >
          WHISPR
        </span>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-[220px] bg-[var(--bg-base)] border-r border-[var(--border-subtle)] flex flex-col transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {navContent}
      </aside>
    </>
  );
}
