"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const LINKS = [
  { label: "Home", href: "/" },
  { label: "Organizers", href: "/organizers/events" },
  { label: "Attendees", href: "/attendees" },
  { label: "Sign Up", href: "/register" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [authed, setAuthed] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => setAuthed(!!localStorage.getItem("token")), []);

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <>
      {/* Top bar (mobile-first) */}
      <header className="safe-top sticky top-0 z-50">
        <div className="glass-nav mx-3 mt-2 rounded-2xl">
          <div className="flex items-center justify-between px-3 py-2 md:px-4 md:py-3">
            {/* Logo */}
            <Link
              href="/"
              className="text-lg md:text-xl font-semibold leading-none bg-gradient-to-r from-accent-blue to-violet-400 bg-clip-text text-transparent"
            >
              whispr
            </Link>

            {/* Desktop links (right-aligned) */}
            <nav className="hidden md:flex items-center gap-1">
              {LINKS.map(({ label, href }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={[
                      "btn-nav",
                      active && "btn-nav--active",
                    ].join(" ")}
                  >
                    {label}
                  </Link>
                );
              })}
              {authed && (
                <button
                  className="btn-nav"
                  onClick={() => {
                    localStorage.removeItem("token");
                    location.reload();
                  }}
                >
                  Logout
                </button>
              )}
            </nav>

            {/* Mobile hamburger */}
            <button
              aria-label="Menu"
              aria-expanded={open}
              aria-controls="mobile-menu"
              className="md:hidden btn-icon"
              onClick={() => setOpen((v) => !v)}
            >
              <span className="sr-only">Open menu</span>
              <div className="hamburger">
                <span className={open ? "line line1 open" : "line line1"} />
                <span className={open ? "line line2 open" : "line line2"} />
                <span className={open ? "line line3 open" : "line line3"} />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile sheet (full-screen glass) */}
      {open && (
        <div
          id="mobile-menu"
          className="fixed inset-0 z-50 md:hidden bg-base-900/65 backdrop-blur-xl"
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute right-3 left-3 top-[max(env(safe-area-inset-top),12px)] bottom-[max(env(safe-area-inset-bottom),12px)] rounded-2xl border border-white/10 bg-white/6 p-3 shadow-[0_8px_30px_rgba(2,8,23,0.35)]"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="flex flex-col gap-2 mt-1">
              {LINKS.map(({ label, href }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={[
                      "btn-nav block w-full text-base tap-target",
                      active && "btn-nav--active",
                    ].join(" ")}
                    onClick={() => setOpen(false)}
                  >
                    {label}
                  </Link>
                );
              })}
              {authed && (
                <button
                  className="btn-nav w-full text-base tap-target"
                  onClick={() => {
                    localStorage.removeItem("token");
                    setOpen(false);
                    location.reload();
                  }}
                >
                  Logout
                </button>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
