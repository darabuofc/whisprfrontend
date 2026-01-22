"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useSwipeable } from "react-swipeable";
import {
  Search,
  ClipboardList,
  Ticket,
  Play,
  ChevronRight,
  Calendar,
  MapPin,
  Sparkles,
  Clock,
  LogOut,
  Instagram,
  User,
  Globe,
  Building2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { generateEventSlug } from "@/lib/utils";

import {
  getMe,
  getAttendeeEvents,
  getRegistrations,
  getTickets,
  Profile,
  ExploreEvent,
  RegistrationItem,
  TicketItem,
  EventOrganization,
} from "@/lib/api";

// ═══════════════════════════════════════════════════════════
// MAIN DASHBOARD PAGE — PREMIUM APPLE × SPOTIFY × WHISPR
// ═══════════════════════════════════════════════════════════
export default function AttendeeDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "explore" | "applications" | "tickets"
  >("explore");

  const [profile, setProfile] = useState<Profile | null>(null);
  const [events, setEvents] = useState<ExploreEvent[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [tickets, setTickets] = useState<TicketItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);

  // Parallax scroll effects
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.95]);

  // Swipe Support (Mobile)
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () =>
      setActiveTab((t) =>
        t === "explore"
          ? "applications"
          : t === "applications"
          ? "tickets"
          : "tickets"
      ),
    onSwipedRight: () =>
      setActiveTab((t) =>
        t === "tickets"
          ? "applications"
          : t === "applications"
          ? "explore"
          : "explore"
      ),
    trackMouse: true,
  });

  // Fetch profile first
  useEffect(() => {
    (async () => {
      const me = await getMe();
      setProfile(me);
      setLoading(false);
    })();
  }, []);

  // Fetch tab-specific data
  useEffect(() => {
    const fetchData = async () => {
      setTabLoading(true);

      try {
        if (activeTab === "explore" && events.length === 0) {
          setEvents(await getAttendeeEvents());
        }
        if (activeTab === "applications" && registrations.length === 0) {
          setRegistrations(await getRegistrations());
        }
        if (activeTab === "tickets" && tickets.length === 0) {
          setTickets(await getTickets());
        }
      } finally {
        setTabLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#000000]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#C1FF72] to-[#6C2DFF] opacity-20 animate-pulse" />
          <p className="text-neutral-500 text-sm tracking-wider">Loading your experience...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      {...swipeHandlers}
      className="min-h-screen bg-[#000000] text-white font-satoshi relative overflow-hidden"
    >
      {/* Ambient Background Gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#C1FF72]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#6C2DFF]/5 rounded-full blur-[100px]" />
      </div>

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profile}
      />

      {/* Mobile Header */}
      <MobileHeader profile={profile} />

      <div className="lg:ml-[280px]">
        {/* HERO SECTION */}
        <motion.section
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="relative px-6 lg:px-12 pt-8 pb-12"
        >
          <div className="max-w-7xl mx-auto">
            {/* Welcome Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight whitespace-nowrap">
                <span className="text-neutral-400">Welcome back,</span>{" "}
                <span className="text-white">{profile?.fullName?.split(' ')[0] || 'There'}</span>
              </h1>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-3 gap-4 mb-12"
            >
              <StatsCard
                icon={<Sparkles size={20} />}
                value={events.length}
                label="Events"
                color="from-[#C1FF72] to-[#A5E652]"
              />
              <StatsCard
                icon={<Clock size={20} />}
                value={registrations.length}
                label="Applications"
                color="from-[#6C2DFF] to-[#8B5CF6]"
              />
              <StatsCard
                icon={<Ticket size={20} />}
                value={tickets.length}
                label="Tickets"
                color="from-[#FF6B6B] to-[#FF8E53]"
              />
            </motion.div>

          </div>
        </motion.section>

        {/* TAB CONTENT */}
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 pb-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {tabLoading ? (
                <div className="flex justify-center py-20">
                  <div className="w-12 h-12 rounded-full border-2 border-[#C1FF72]/20 border-t-[#C1FF72] animate-spin" />
                </div>
              ) : activeTab === "explore" ? (
                <ExploreTab events={events} />
              ) : activeTab === "applications" ? (
                <ApplicationsTab registrations={registrations} />
              ) : (
                <TicketsTab tickets={tickets} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// STATS CARD COMPONENT
// ═══════════════════════════════════════════════════════════
function StatsCard({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  color: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="relative overflow-hidden rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/10 p-6 group cursor-default"
    >
      {/* Gradient Glow */}
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

      <div className="relative">
        <div className="text-neutral-400 mb-3">{icon}</div>
        <div className="text-3xl font-bold mb-1">{value}</div>
        <div className="text-xs text-neutral-500 uppercase tracking-wider">{label}</div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════
// SIDEBAR — DESKTOP
// ═══════════════════════════════════════════════════════════
function Sidebar({
  activeTab,
  setActiveTab,
  profile,
}: {
  activeTab: "explore" | "applications" | "tickets";
  setActiveTab: React.Dispatch<
    React.SetStateAction<"explore" | "applications" | "tickets">
  >;
  profile: Profile | null;
}) {
  return (
    <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[280px] bg-black/40 backdrop-blur-2xl border-r border-white/5 flex-col p-8 z-50">
      {/* Logo / Brand */}
      <div className="mb-12">
        <h1 className="text-2xl font-bold tracking-tight">
          whispr<span className="text-[#C1FF72]">.</span>
        </h1>
        <p className="text-xs text-neutral-500 mt-1 tracking-wider uppercase">Underground</p>
      </div>

      {/* Profile Section */}
      <div className="mb-10">
        <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-[#C1FF72]/20 to-[#6C2DFF]/20 border border-white/10 flex items-center justify-center mb-4 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#C1FF72] to-[#6C2DFF] opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
          {profile?.profilePicture ? (
            <img
              src={profile.profilePicture}
              alt={profile.fullName || 'Profile'}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-2xl font-bold text-white/70">
              {profile?.fullName?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          )}
        </div>

        <h2 className="text-lg font-semibold mb-1">
          {profile?.fullName}
        </h2>
        <p className="text-sm text-neutral-500">{profile?.email}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1">
        <p className="text-xs text-neutral-600 uppercase tracking-wider mb-4 font-medium">
          Navigation
        </p>
        <div className="flex flex-col gap-2">
          {[
            { key: "explore", label: "Explore", icon: Search },
            { key: "applications", label: "Applications", icon: ClipboardList },
            { key: "tickets", label: "Tickets", icon: Ticket },
          ].map(({ key, label, icon: Icon }) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                  isActive
                    ? "bg-white/5 text-white"
                    : "text-neutral-400 hover:text-white hover:bg-white/[0.02]"
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#C1FF72] rounded-r-full" />
                )}
                <Icon size={20} strokeWidth={1.5} />
                <span className="text-sm font-medium">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="mt-auto pt-6 border-t border-white/5">
        <p className="text-xs text-neutral-600">
          © 2026 whispr underground
        </p>
      </div>
    </aside>
  );
}

// ═══════════════════════════════════════════════════════════
// MOBILE HEADER
// ═══════════════════════════════════════════════════════════
function MobileHeader({ profile }: { profile: Profile | null }) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  const handleSignOut = () => {
    localStorage.removeItem("whispr_token");
    localStorage.removeItem("token");
    localStorage.removeItem("whispr_role");
    router.push("/auth");
  };

  return (
    <div className="lg:hidden relative z-40">
      {/* Header Bar - Glassmorphic */}
      <div className="mx-4 mt-4 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo with Glow */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute -inset-1 bg-[#C1FF72]/20 rounded-full blur-md" />
              <h1 className="relative text-xl font-bold tracking-tight">
                whispr<span className="text-[#C1FF72]">.</span>
              </h1>
            </div>
          </div>

          {/* Profile Button with Ring */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="relative w-10 h-10 rounded-full bg-gradient-to-br from-[#C1FF72]/20 to-[#6C2DFF]/20 border-2 border-white/20 flex items-center justify-center overflow-hidden ring-2 ring-transparent hover:ring-[#C1FF72]/30 transition-all"
          >
            {profile?.profilePicture ? (
              <img
                src={profile.profilePicture}
                alt={profile.fullName || 'Profile'}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm font-bold text-white/70">
                {profile?.fullName?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {showMenu && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setShowMenu(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-4 top-20 w-72 rounded-2xl border border-white/10 bg-[#0a0a0a]/95 backdrop-blur-xl p-4 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] z-50"
            >
              {/* Profile Info */}
              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-white/10">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#C1FF72]/20 to-[#6C2DFF]/20 border border-white/10 flex items-center justify-center overflow-hidden">
                  {profile?.profilePicture ? (
                    <img
                      src={profile.profilePicture}
                      alt={profile.fullName || 'Profile'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl font-bold text-white/70">
                      {profile?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold truncate">{profile?.fullName || 'User'}</h3>
                  {profile?.age && (
                    <p className="text-sm text-white/50">{profile.age} years old</p>
                  )}
                </div>
              </div>

              {/* Instagram Handle */}
              {profile?.instagramHandle && (
                <a
                  href={`https://instagram.com/${profile.instagramHandle.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/70 hover:bg-white/5 hover:text-[#C1FF72] transition-colors mb-2"
                >
                  <Instagram size={18} />
                  <span>{profile.instagramHandle.startsWith('@') ? profile.instagramHandle : `@${profile.instagramHandle}`}</span>
                </a>
              )}

              {/* Sign Out Button */}
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MOBILE NAV
// ═══════════════════════════════════════════════════════════
function MobileNav({
  activeTab,
  setActiveTab,
}: {
  activeTab: "explore" | "applications" | "tickets";
  setActiveTab: React.Dispatch<
    React.SetStateAction<"explore" | "applications" | "tickets">
  >;
}) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="mx-4 mb-4 rounded-3xl bg-black/80 backdrop-blur-2xl border border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="grid grid-cols-3 p-2">
          {[
            { key: "explore", label: "Explore", icon: Search },
            { key: "applications", label: "Applications", icon: ClipboardList },
            { key: "tickets", label: "Tickets", icon: Ticket },
          ].map(({ key, label, icon: Icon }) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() =>
                  setActiveTab(key as "explore" | "applications" | "tickets")
                }
                className={`relative flex flex-col items-center justify-center py-4 px-3 rounded-2xl transition-all ${
                  isActive
                    ? "text-white"
                    : "text-neutral-500"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeMobileTab"
                    className="absolute inset-0 bg-white/10 rounded-2xl"
                    transition={{ type: "spring", duration: 0.6 }}
                  />
                )}
                <Icon size={20} strokeWidth={1.5} className="relative z-10 mb-1" />
                <span className="relative z-10 text-[10px] font-medium tracking-wide">
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

// ═══════════════════════════════════════════════════════════
// EXPLORE TAB
// ═══════════════════════════════════════════════════════════
function ExploreTab({ events }: { events: ExploreEvent[] }) {
  const router = useRouter();

  const formatEventDate = (dateStr: string | null) => {
    if (!dateStr) return "Date TBA";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  if (!events.length)
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
          <Search size={24} className="text-neutral-600" />
        </div>
        <p className="text-neutral-500">No events available yet.</p>
      </div>
    );

  const displayEvents = events;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-1">Discover Events</h2>
        <p className="text-sm text-neutral-500">Find your next underground experience</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {displayEvents.map((event, index) => {
          const r = event.user_relation;
          const org = event.organization;

          const eventSlug = generateEventSlug(event.name, event.id);
          let ctaLabel = "Get Pass";
          let ctaAction = () => router.push(`/attendees/events/${eventSlug}`);

          if (r?.has_ticket) {
            ctaLabel = "View Ticket";
            ctaAction = () =>
              router.push(`/attendees/tickets/${r.ticket?.id}`);
          } else if (r?.is_registered) {
            ctaLabel = "View Application";
            ctaAction = () =>
              router.push(`/attendees/applications/${r.registration?.id}`);
          }

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group rounded-3xl overflow-hidden bg-white/[0.02] border border-white/5 hover:border-[#C1FF72]/30 transition-all cursor-pointer"
              onClick={() => router.push(`/attendees/events/${eventSlug}`)}
            >
              {/* Event Image */}
              <div className="relative h-72 overflow-hidden">
                <img
                  src={event.cover || "/event-placeholder.jpg"}
                  alt={event.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                {/* Organization Badge - Top Left */}
                {org && (
                  <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                    {org.logo ? (
                      <img
                        src={org.logo}
                        alt={org.name || 'Organization'}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                    ) : (
                      <Building2 size={14} className="text-white/70" />
                    )}
                    <span className="text-xs text-white/80 font-medium">{org.name || 'Organizer'}</span>
                  </div>
                )}

                {/* Status Badge - Top Right */}
                {r?.is_registered && (
                  <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-[#C1FF72]/20 border border-[#C1FF72]/40 backdrop-blur-md">
                    <span className="text-xs text-[#C1FF72] font-medium">Registered</span>
                  </div>
                )}

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-16 h-16 rounded-full bg-[#C1FF72]/20 backdrop-blur-md border border-[#C1FF72]/40 flex items-center justify-center">
                    <Play size={24} className="text-[#C1FF72] ml-1" fill="currentColor" />
                  </div>
                </div>
              </div>

              {/* Event Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3 line-clamp-1 group-hover:text-[#C1FF72] transition-colors">
                  {event.name}
                </h3>

                <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-400 mb-5">
                  {event.date && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5">
                      <Calendar size={13} className="text-[#C1FF72]" />
                      <span>{formatEventDate(event.date)}</span>
                    </div>
                  )}
                  {event.location && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5">
                      <MapPin size={13} className="text-[#C1FF72]" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    ctaAction();
                  }}
                  className={`w-full py-3.5 rounded-full text-sm font-semibold transition-all ${
                    r?.has_ticket
                      ? "bg-[#C1FF72]/20 text-[#C1FF72] border border-[#C1FF72]/30 hover:bg-[#C1FF72]/30"
                      : r?.is_registered
                      ? "bg-white/5 text-white border border-white/10 hover:bg-white/10"
                      : "bg-gradient-to-r from-[#C1FF72] to-[#A5E652] text-black hover:shadow-[0_8px_30px_-8px_rgba(193,255,114,0.4)] hover:scale-[1.02]"
                  }`}
                >
                  {ctaLabel}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// APPLICATIONS TAB
// ═══════════════════════════════════════════════════════════
function ApplicationsTab({
  registrations,
}: {
  registrations: RegistrationItem[];
}) {
  if (!registrations.length)
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
          <ClipboardList size={24} className="text-neutral-600" />
        </div>
        <p className="text-neutral-500">No applications yet.</p>
        <p className="text-sm text-neutral-600 mt-2">Apply to events to see them here</p>
      </div>
    );

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-1">My Applications</h2>
        <p className="text-sm text-neutral-500">Track your event registrations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {registrations.map((r, index) => (
          <motion.div
            key={r.registration_airtable_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="rounded-3xl overflow-hidden bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">{r.event.name}</h3>
                <div className="flex items-center gap-2 text-sm text-neutral-400">
                  <Calendar size={14} />
                  <span>{r.event.date || 'TBA'}</span>
                </div>
              </div>
              <div className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize ${
                r.status === 'approved'
                  ? 'bg-[#C1FF72]/20 text-[#C1FF72] border border-[#C1FF72]/40'
                  : r.status === 'pending'
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40'
                  : 'bg-red-500/20 text-red-400 border border-red-500/40'
              }`}>
                {r.status}
              </div>
            </div>

            {r.pass?.type && (
              <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-sm text-neutral-500">Pass Type</p>
                <p className="text-sm font-medium mt-1">{r.pass.type}</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TICKETS TAB
// ═══════════════════════════════════════════════════════════
function TicketsTab({ tickets }: { tickets: TicketItem[] }) {
  const router = useRouter();

  if (!tickets.length)
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
          <Ticket size={24} className="text-neutral-600" />
        </div>
        <p className="text-neutral-500">No tickets yet.</p>
        <p className="text-sm text-neutral-600 mt-2">Your confirmed tickets will appear here</p>
      </div>
    );

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-1">My Tickets</h2>
        <p className="text-sm text-neutral-500">Your confirmed event passes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tickets.map((t, index) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/10 hover:border-[#C1FF72]/30 transition-all cursor-pointer group"
            onClick={() => router.push(`/attendees/tickets/${t.id}`)}
          >
            {/* Ticket Design Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)'
              }} />
            </div>

            <div className="relative p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{t.event?.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-neutral-400">
                    <Calendar size={14} />
                    <span>{t.event?.date || 'TBA'}</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#C1FF72]/20 border border-[#C1FF72]/40 flex items-center justify-center">
                  <Ticket size={20} className="text-[#C1FF72]" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Pass Type</p>
                  <p className="text-sm font-medium">{t.pass_type}</p>
                </div>
                <ChevronRight size={20} className="text-neutral-600 group-hover:text-[#C1FF72] transition-colors" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
