"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  getOrganizer,
  getEvents,
  createDraftEvent,
  getOrganization,
  Organization,
} from "@/lib/api";
import {
  Plus,
  Calendar,
  MapPin,
  Settings,
  LogOut,
  LayoutDashboard,
  CalendarDays,
  BarChart3,
  Building2,
  ChevronRight,
  AlertCircle,
  Clock,
  Users,
  Ticket,
  Instagram,
  Globe,
  ExternalLink,
  Sparkles,
  User,
  Menu,
  X,
} from "lucide-react";
import Image from "next/image";

interface Event {
  id: string;
  fields: {
    Name?: string;
    Date?: string;
    Location?: string;
    Status?: string;
    Cover?: string[];
  };
}

interface Organizer {
  id: string;
  name: string;
  email: string;
  role: string;
  approval_status: string;
}

// ═══════════════════════════════════════════════════════════
// MAIN ORGANIZER DASHBOARD
// ═══════════════════════════════════════════════════════════
export default function OrganizerDashboard() {
  const router = useRouter();
  const [organizer, setOrganizer] = useState<Organizer | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [showPendingTooltip, setShowPendingTooltip] = useState(false);
  const [creatingEvent, setCreatingEvent] = useState(false);

  // Parallax scroll effects
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.95]);

  // Auth check
  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("whispr_token") || localStorage.getItem("token")
        : null;
    const role = typeof window !== "undefined" ? localStorage.getItem("whispr_role") : null;

    if (!token) {
      router.replace("/auth?role=organizer");
      return;
    }

    if (role && role !== "organizer") {
      router.replace(role === "attendee" ? "/attendees/dashboard" : "/auth");
      return;
    }

    setAuthorized(true);
  }, [router]);

  // Fetch data
  useEffect(() => {
    if (!authorized) return;
    const fetchData = async () => {
      try {
        const [org, evs, orgData] = await Promise.all([
          getOrganizer(),
          getEvents(),
          getOrganization(),
        ]);
        setOrganizer(org);
        setEvents(evs);
        setOrganization(orgData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [authorized]);

  const handleCreateEvent = async () => {
    if (organizer?.approval_status === "Pending") {
      setShowPendingTooltip(true);
      setTimeout(() => setShowPendingTooltip(false), 3000);
      return;
    }

    try {
      setCreatingEvent(true);
      const draft = await createDraftEvent();
      window.location.href = `/organizers/events/${draft.id}/onboarding`;
    } catch (e) {
      console.error(e);
      alert("Failed to create event");
    } finally {
      setCreatingEvent(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("whispr_token");
    localStorage.removeItem("token");
    localStorage.removeItem("whispr_role");
    router.push("/auth?role=organizer");
  };

  const isPending = organizer?.approval_status === "Pending";

  if (!authorized) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#000000]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#B472FF] to-[#6C2DFF] opacity-20 animate-pulse" />
          <p className="text-neutral-500 text-sm tracking-wider">Checking access...</p>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#000000]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#B472FF] to-[#6C2DFF] opacity-20 animate-pulse" />
          <p className="text-neutral-500 text-sm tracking-wider">Loading your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  const publishedEvents = events.filter((e) => e.fields.Status === "published");
  const draftEvents = events.filter((e) => e.fields.Status !== "published");

  return (
    <div className="min-h-screen bg-[#000000] text-white font-satoshi relative overflow-hidden">
      {/* Ambient Background Gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#B472FF]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#6C2DFF]/5 rounded-full blur-[100px]" />
      </div>

      {/* Sidebar - Desktop */}
      <Sidebar
        organizer={organizer}
        organization={organization}
        onSignOut={handleSignOut}
        isPending={isPending}
      />

      {/* Mobile Header */}
      <MobileHeader
        organizer={organizer}
        organization={organization}
        onSignOut={handleSignOut}
        isPending={isPending}
      />

      {/* Main Content */}
      <div className="lg:ml-[300px]">
        {/* Pending Approval Banner */}
        <AnimatePresence>
          {isPending && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mx-4 lg:mx-8 mt-4 lg:mt-8"
            >
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-4 lg:p-5">
                <div className="absolute inset-0 bg-[url('/noise.png')] bg-[length:200px] opacity-[0.05]" />
                <div className="relative flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <Clock size={20} className="text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-white mb-1">
                      Account Pending Approval
                    </h3>
                    <p className="text-sm text-white/70">
                      Your organizer account is currently under review. You'll be able to create and publish events once approved.
                      This typically takes 24-48 hours.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero Section */}
        <motion.section
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="relative px-4 lg:px-8 pt-6 lg:pt-8 pb-6 lg:pb-8"
        >
          <div className="max-w-7xl">
            {/* Welcome Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <p className="text-neutral-500 text-sm tracking-wider uppercase mb-2">
                Welcome back
              </p>
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
                {organizer?.name?.split(' ')[0] || 'Organizer'}
              </h1>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-8"
            >
              <StatsCard
                icon={<CalendarDays size={20} />}
                value={events.length}
                label="Total Events"
                color="from-[#B472FF] to-[#8B5CF6]"
              />
              <StatsCard
                icon={<Sparkles size={20} />}
                value={publishedEvents.length}
                label="Published"
                color="from-[#C1FF72] to-[#A5E652]"
              />
              <StatsCard
                icon={<Clock size={20} />}
                value={draftEvents.length}
                label="Drafts"
                color="from-[#FF6B6B] to-[#FF8E53]"
              />
              <StatsCard
                icon={<Users size={20} />}
                value={0}
                label="Total Attendees"
                color="from-[#72D4FF] to-[#60A5FA]"
              />
            </motion.div>
          </div>
        </motion.section>

        {/* Action Bar */}
        <div className="px-4 lg:px-8 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-1">Your Events</h2>
              <p className="text-sm text-neutral-500">Manage and track your events</p>
            </div>

            {/* Create Event Button with Tooltip */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: isPending ? 1 : 1.02 }}
                whileTap={{ scale: isPending ? 1 : 0.98 }}
                onClick={handleCreateEvent}
                onMouseEnter={() => isPending && setShowPendingTooltip(true)}
                onMouseLeave={() => setShowPendingTooltip(false)}
                disabled={creatingEvent}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-300 ${
                  isPending
                    ? 'bg-white/5 text-white/40 cursor-not-allowed border border-white/10'
                    : 'bg-[#B472FF] text-white shadow-[0_0_30px_rgba(180,114,255,0.3)] hover:shadow-[0_0_40px_rgba(180,114,255,0.4)]'
                }`}
              >
                {creatingEvent ? (
                  <motion.div
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                ) : (
                  <Plus size={20} />
                )}
                Create Event
              </motion.button>

              {/* Pending Tooltip */}
              <AnimatePresence>
                {showPendingTooltip && isPending && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full mt-2 right-0 w-64 p-4 rounded-xl bg-[#1a1a1a] border border-white/10 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] z-50"
                  >
                    <div className="flex items-start gap-3">
                      <AlertCircle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-white mb-1">Account Pending</p>
                        <p className="text-xs text-white/60">
                          You can create events once your account is approved by our team.
                        </p>
                      </div>
                    </div>
                    <div className="absolute -top-2 right-8 w-4 h-4 bg-[#1a1a1a] border-l border-t border-white/10 rotate-45" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="px-4 lg:px-8 pb-24">
          {events.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <CalendarDays size={32} className="text-neutral-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No events yet</h3>
              <p className="text-neutral-500 mb-6">
                {isPending
                  ? "Your events will appear here once your account is approved"
                  : "Create your first event to get started"}
              </p>
              {!isPending && (
                <button
                  onClick={handleCreateEvent}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#B472FF] text-white font-medium shadow-[0_0_30px_rgba(180,114,255,0.3)] hover:shadow-[0_0_40px_rgba(180,114,255,0.4)] transition-all"
                >
                  <Plus size={20} />
                  Create Event
                </button>
              )}
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
              {events.map((ev, index) => (
                <EventCard key={ev.id} event={ev} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <MobileBottomNav
        organization={organization}
        onCreateEvent={handleCreateEvent}
        isPending={isPending}
        showPendingTooltip={showPendingTooltip}
        setShowPendingTooltip={setShowPendingTooltip}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// STATS CARD
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
      whileHover={{ scale: 1.03 }}
      className="relative overflow-hidden rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/10 p-4 lg:p-6 group cursor-default"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
      <div className="relative">
        <div className="text-neutral-400 mb-2 lg:mb-3">{icon}</div>
        <div className="text-2xl lg:text-3xl font-bold mb-1">{value}</div>
        <div className="text-xs text-neutral-500 uppercase tracking-wider">{label}</div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════
// SIDEBAR - DESKTOP
// ═══════════════════════════════════════════════════════════
function Sidebar({
  organizer,
  organization,
  onSignOut,
  isPending,
}: {
  organizer: Organizer | null;
  organization: Organization | null;
  onSignOut: () => void;
  isPending: boolean;
}) {
  const router = useRouter();
  const [showPendingTooltip, setShowPendingTooltip] = useState(false);

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[300px] bg-black/40 backdrop-blur-2xl border-r border-white/5 flex-col p-8 z-50">
      {/* Logo / Brand */}
      <div className="mb-8">
        <Image
          src="https://whispr-app-storage.s3.eu-north-1.amazonaws.com/events/logotypeface.svg"
          alt="Whispr"
          width={120}
          height={32}
          className="h-8 w-auto"
          priority
        />
        <p className="text-xs text-neutral-500 mt-2 tracking-wider uppercase">Organizer Portal</p>
      </div>

      {/* Organization Section */}
      <div className="mb-8 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-[#B472FF]/20 to-[#6C2DFF]/20 border border-white/10 flex items-center justify-center overflow-hidden">
            {organization?.logo ? (
              <img
                src={organization.logo}
                alt="Organization Logo"
                className="w-full h-full object-contain p-1"
              />
            ) : (
              <Building2 size={24} className="text-white/50" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold truncate">
              {organization?.name || 'Your Organization'}
            </h3>
            {organization?.tagline && (
              <p className="text-xs text-neutral-500 truncate">{organization.tagline}</p>
            )}
          </div>
        </div>

        {/* Organization Links */}
        <div className="flex flex-wrap gap-2 mb-4">
          {organization?.website && (
            <a
              href={organization.website.startsWith('http') ? organization.website : `https://${organization.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-xs text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Globe size={12} />
              Website
              <ExternalLink size={10} />
            </a>
          )}
          {organization?.instagram_handle && (
            <a
              href={`https://instagram.com/${organization.instagram_handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-xs text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Instagram size={12} />
              @{organization.instagram_handle}
            </a>
          )}
        </div>

        {/* Setup Button */}
        <div className="relative">
          <button
            onClick={() => {
              if (isPending) {
                setShowPendingTooltip(true);
                setTimeout(() => setShowPendingTooltip(false), 3000);
                return;
              }
              router.push('/organizers/setup');
            }}
            onMouseEnter={() => isPending && setShowPendingTooltip(true)}
            onMouseLeave={() => setShowPendingTooltip(false)}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              isPending
                ? 'bg-white/5 text-white/40 cursor-not-allowed border border-white/10'
                : 'bg-[#B472FF]/10 border border-[#B472FF]/20 text-[#B472FF] hover:bg-[#B472FF]/20'
            }`}
          >
            <Settings size={16} />
            {organization?.logo && organization?.website && organization?.instagram_handle ? 'Edit Organization' : 'Setup Organization'}
          </button>

          {/* Pending Tooltip */}
          <AnimatePresence>
            {showPendingTooltip && isPending && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full mt-2 left-0 right-0 p-3 rounded-xl bg-[#1a1a1a] border border-white/10 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] z-50"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-white/60">
                    Available once your account is approved.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Profile Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#B472FF]/30 to-[#6C2DFF]/30 border border-white/10 flex items-center justify-center">
            <span className="text-sm font-bold text-white/80">
              {organizer?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-medium truncate">{organizer?.name}</h2>
            <p className="text-xs text-neutral-500 truncate">{organizer?.email}</p>
          </div>
        </div>

        {/* Approval Status Badge */}
        {organizer?.approval_status && (
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
            organizer.approval_status === 'Approved'
              ? 'bg-[#C1FF72]/10 text-[#C1FF72] border border-[#C1FF72]/20'
              : organizer.approval_status === 'Pending'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${
              organizer.approval_status === 'Approved'
                ? 'bg-[#C1FF72]'
                : organizer.approval_status === 'Pending'
                ? 'bg-amber-400'
                : 'bg-red-400'
            }`} />
            {organizer.approval_status}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1">
        <p className="text-xs text-neutral-600 uppercase tracking-wider mb-4 font-medium">
          Navigation
        </p>
        <div className="flex flex-col gap-2">
          {[
            { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, active: true },
            { key: "events", label: "Events", icon: CalendarDays, active: false },
            { key: "analytics", label: "Analytics", icon: BarChart3, active: false },
          ].map(({ key, label, icon: Icon, active }) => (
            <button
              key={key}
              className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                active
                  ? "bg-white/5 text-white"
                  : "text-neutral-400 hover:text-white hover:bg-white/[0.02]"
              }`}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#B472FF] rounded-r-full" />
              )}
              <Icon size={20} strokeWidth={1.5} />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Sign Out */}
      <div className="mt-auto pt-6 border-t border-white/5">
        <button
          onClick={onSignOut}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-400 hover:text-red-400 hover:bg-red-500/5 transition-all w-full text-left"
        >
          <LogOut size={20} strokeWidth={1.5} />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

// ═══════════════════════════════════════════════════════════
// MOBILE HEADER
// ═══════════════════════════════════════════════════════════
function MobileHeader({
  organizer,
  organization,
  onSignOut,
  isPending,
}: {
  organizer: Organizer | null;
  organization: Organization | null;
  onSignOut: () => void;
  isPending: boolean;
}) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [showPendingTooltip, setShowPendingTooltip] = useState(false);

  return (
    <div className="lg:hidden relative z-40">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-4">
        {/* Logo */}
        <Image
          src="https://whispr-app-storage.s3.eu-north-1.amazonaws.com/events/logotypeface.svg"
          alt="Whispr"
          width={100}
          height={28}
          className="h-7 w-auto"
          priority
        />

        {/* Menu Button */}
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="relative w-10 h-10 rounded-full bg-gradient-to-br from-[#B472FF]/20 to-[#6C2DFF]/20 border border-white/10 flex items-center justify-center"
        >
          {showMenu ? <X size={18} className="text-white/70" /> : <Menu size={18} className="text-white/70" />}
        </button>
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
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowMenu(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-4 top-16 w-80 rounded-2xl border border-white/10 bg-[#0a0a0a] p-4 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] z-50"
            >
              {/* Organization Info */}
              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-white/10">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#B472FF]/20 to-[#6C2DFF]/20 border border-white/10 flex items-center justify-center overflow-hidden">
                  {organization?.logo ? (
                    <img
                      src={organization.logo}
                      alt="Organization Logo"
                      className="w-full h-full object-contain p-1"
                    />
                  ) : (
                    <Building2 size={20} className="text-white/50" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold truncate">
                    {organization?.name || 'Your Organization'}
                  </h3>
                  <p className="text-sm text-white/50">{organizer?.email}</p>
                </div>
              </div>

              {/* Approval Status */}
              {organizer?.approval_status && (
                <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl mb-3 ${
                  organizer.approval_status === 'Approved'
                    ? 'bg-[#C1FF72]/10 text-[#C1FF72]'
                    : organizer.approval_status === 'Pending'
                    ? 'bg-amber-500/10 text-amber-400'
                    : 'bg-red-500/10 text-red-400'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    organizer.approval_status === 'Approved'
                      ? 'bg-[#C1FF72]'
                      : organizer.approval_status === 'Pending'
                      ? 'bg-amber-400'
                      : 'bg-red-400'
                  }`} />
                  <span className="text-sm font-medium">Status: {organizer.approval_status}</span>
                </div>
              )}

              {/* Setup Organization */}
              <div className="relative mb-2">
                <button
                  onClick={() => {
                    if (isPending) {
                      setShowPendingTooltip(true);
                      setTimeout(() => setShowPendingTooltip(false), 3000);
                      return;
                    }
                    setShowMenu(false);
                    router.push('/organizers/setup');
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                    isPending
                      ? 'text-white/40 cursor-not-allowed'
                      : 'text-white/70 hover:bg-white/5 hover:text-[#B472FF]'
                  }`}
                >
                  <Settings size={18} />
                  <span>{organization?.logo && organization?.website && organization?.instagram_handle ? 'Edit Organization' : 'Setup Organization'}</span>
                </button>

                {/* Pending Tooltip */}
                <AnimatePresence>
                  {showPendingTooltip && isPending && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="absolute left-0 right-0 top-full mt-1 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20"
                    >
                      <p className="text-xs text-amber-400 text-center">
                        Available once approved
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Sign Out Button */}
              <button
                onClick={onSignOut}
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
// MOBILE BOTTOM NAV
// ═══════════════════════════════════════════════════════════
function MobileBottomNav({
  organization,
  onCreateEvent,
  isPending,
  showPendingTooltip,
  setShowPendingTooltip,
}: {
  organization: Organization | null;
  onCreateEvent: () => void;
  isPending: boolean;
  showPendingTooltip: boolean;
  setShowPendingTooltip: (show: boolean) => void;
}) {
  const router = useRouter();
  const [showSetupPendingTooltip, setShowSetupPendingTooltip] = useState(false);

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="mx-4 mb-4 rounded-3xl bg-black/80 backdrop-blur-2xl border border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="grid grid-cols-3 p-2 items-center">
          {/* Dashboard */}
          <button className="flex flex-col items-center justify-center py-3 px-3 rounded-2xl text-white">
            <div className="relative">
              <LayoutDashboard size={20} strokeWidth={1.5} className="mb-1" />
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#B472FF]" />
            </div>
            <span className="text-[10px] font-medium tracking-wide">Dashboard</span>
          </button>

          {/* Create Event - Center Button */}
          <div className="relative flex justify-center">
            <button
              onClick={() => {
                if (isPending) {
                  setShowPendingTooltip(true);
                  setTimeout(() => setShowPendingTooltip(false), 3000);
                } else {
                  onCreateEvent();
                }
              }}
              className={`w-14 h-14 rounded-full flex items-center justify-center -mt-4 ${
                isPending
                  ? 'bg-white/10 text-white/40'
                  : 'bg-[#B472FF] text-white shadow-[0_0_30px_rgba(180,114,255,0.4)]'
              }`}
            >
              <Plus size={24} />
            </button>

            {/* Tooltip */}
            <AnimatePresence>
              {showPendingTooltip && isPending && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full mb-2 w-48 p-3 rounded-xl bg-[#1a1a1a] border border-white/10 text-center"
                >
                  <p className="text-xs text-white/80">Account pending approval</p>
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#1a1a1a] border-r border-b border-white/10 rotate-45" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Organization Setup */}
          <div className="relative flex justify-center">
            <button
              onClick={() => {
                if (isPending) {
                  setShowSetupPendingTooltip(true);
                  setTimeout(() => setShowSetupPendingTooltip(false), 3000);
                } else {
                  router.push('/organizers/setup');
                }
              }}
              className={`flex flex-col items-center justify-center py-3 px-3 rounded-2xl ${
                isPending ? 'text-white/30' : 'text-neutral-500'
              }`}
            >
              <Building2 size={20} strokeWidth={1.5} className="mb-1" />
              <span className="text-[10px] font-medium tracking-wide">Setup</span>
            </button>

            {/* Tooltip */}
            <AnimatePresence>
              {showSetupPendingTooltip && isPending && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full mb-2 w-40 p-2 rounded-xl bg-[#1a1a1a] border border-white/10 text-center"
                >
                  <p className="text-xs text-white/80">Account pending approval</p>
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#1a1a1a] border-r border-b border-white/10 rotate-45" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  );
}

// ═══════════════════════════════════════════════════════════
// EVENT CARD
// ═══════════════════════════════════════════════════════════
function EventCard({ event, index }: { event: Event; index: number }) {
  const router = useRouter();
  const isPublished = event.fields.Status === "published";
  const coverImage = event.fields.Cover?.[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      onClick={() => router.push(`/organizers/events/${event.id}/mission-control`)}
      className="group rounded-2xl overflow-hidden bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all cursor-pointer"
    >
      {/* Cover Image */}
      <div className="relative h-40 overflow-hidden bg-gradient-to-br from-[#B472FF]/10 to-[#6C2DFF]/10">
        {coverImage ? (
          <img
            src={coverImage}
            alt={event.fields.Name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <CalendarDays size={32} className="text-white/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md ${
              isPublished
                ? "bg-[#C1FF72]/20 text-[#C1FF72] border border-[#C1FF72]/30"
                : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
            }`}
          >
            {event.fields.Status || "draft"}
          </span>
        </div>
      </div>

      {/* Event Info */}
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-3 line-clamp-1 group-hover:text-[#B472FF] transition-colors">
          {event.fields.Name || "Untitled Event"}
        </h3>

        <div className="flex flex-col gap-2 text-sm text-neutral-400 mb-4">
          {event.fields.Date && (
            <div className="flex items-center gap-2">
              <Calendar size={14} />
              <span>{event.fields.Date}</span>
            </div>
          )}
          {event.fields.Location && (
            <div className="flex items-center gap-2">
              <MapPin size={14} />
              <span className="line-clamp-1">{event.fields.Location}</span>
            </div>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/organizers/events/${event.id}/mission-control`);
          }}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium transition-all group-hover:border-[#B472FF]/30"
        >
          Manage
          <ChevronRight size={16} />
        </button>
      </div>
    </motion.div>
  );
}
