"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  CalendarDays,
  Building2,
  ChevronRight,
  AlertCircle,
  Clock,
  Users,
  Sparkles,
  Menu,
  X,
  ExternalLink,
  Globe,
  Instagram,
  ArrowUpRight,
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
      <div className="h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-white/10 border-t-white/60 animate-spin" />
          <p className="text-white/40 text-sm font-medium">Checking access...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-white/10 border-t-white/60 animate-spin" />
          <p className="text-white/40 text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  const publishedEvents = events.filter((e) => e.fields.Status === "published");
  const draftEvents = events.filter((e) => e.fields.Status !== "published");

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Subtle gradient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#0a0a0a] to-[#0d0d12]" />
        <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-gradient-radial from-white/[0.015] to-transparent opacity-60" />
      </div>

      {/* Sticky Header */}
      <DashboardHeader
        organizer={organizer}
        organization={organization}
        onSignOut={handleSignOut}
        onCreateEvent={handleCreateEvent}
        isPending={isPending}
        creatingEvent={creatingEvent}
        showPendingTooltip={showPendingTooltip}
        setShowPendingTooltip={setShowPendingTooltip}
      />

      {/* Pending Approval Banner */}
      {isPending && (
        <div className="bg-[#0a0a0a]/80 border-b border-white/[0.06] relative z-10">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-start gap-4 bg-amber-500/[0.06] border border-amber-500/20 rounded-xl p-4">
              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Clock size={18} className="text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-white/90 mb-0.5">
                  Account Pending Approval
                </h3>
                <p className="text-sm text-white/40">
                  Your organizer account is under review. You&apos;ll be able to create and publish events once approved.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Strip */}
      <StatsStrip
        totalEvents={events.length}
        published={publishedEvents.length}
        drafts={draftEvents.length}
      />

      {/* Events Section */}
      <div className="max-w-6xl mx-auto px-6 py-8 relative z-10">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white/90">Your Events</h2>
            <p className="text-sm text-white/40 mt-0.5">
              {events.length === 0
                ? "No events yet"
                : `${events.length} event${events.length === 1 ? "" : "s"}`}
            </p>
          </div>

          {/* Desktop Create Button */}
          <div className="relative hidden sm:block">
            <button
              onClick={handleCreateEvent}
              onMouseEnter={() => isPending && setShowPendingTooltip(true)}
              onMouseLeave={() => setShowPendingTooltip(false)}
              disabled={creatingEvent}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isPending
                  ? "bg-white/[0.04] text-white/30 cursor-not-allowed border border-white/[0.06]"
                  : "bg-white text-black hover:bg-white/90"
              }`}
            >
              {creatingEvent ? (
                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <Plus size={16} />
              )}
              New Event
            </button>

            {/* Pending Tooltip */}
            {showPendingTooltip && isPending && (
              <div className="absolute top-full mt-2 right-0 w-56 p-3 rounded-xl bg-[#1a1a1a] border border-white/[0.08] shadow-2xl z-50">
                <div className="flex items-start gap-2.5">
                  <AlertCircle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-white/50">
                    You can create events once your account is approved.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Events Grid */}
        {events.length === 0 ? (
          <EmptyState
            isPending={isPending}
            onCreateEvent={handleCreateEvent}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {events.map((ev) => (
              <EventCard key={ev.id} event={ev} />
            ))}
          </div>
        )}
      </div>

      {/* Mobile Bottom Nav */}
      <MobileBottomNav
        onCreateEvent={handleCreateEvent}
        isPending={isPending}
        showPendingTooltip={showPendingTooltip}
        setShowPendingTooltip={setShowPendingTooltip}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// DASHBOARD HEADER (Sticky, mission-control style)
// ═══════════════════════════════════════════════════════════
function DashboardHeader({
  organizer,
  organization,
  onSignOut,
  onCreateEvent,
  isPending,
  creatingEvent,
  showPendingTooltip,
  setShowPendingTooltip,
}: {
  organizer: Organizer | null;
  organization: Organization | null;
  onSignOut: () => void;
  onCreateEvent: () => void;
  isPending: boolean;
  creatingEvent: boolean;
  showPendingTooltip: boolean;
  setShowPendingTooltip: (show: boolean) => void;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="sticky top-0 z-40 bg-[#0a0a0a]/90 backdrop-blur-lg border-b border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-6 py-5">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Logo + Welcome */}
          <div className="flex items-center gap-4 min-w-0">
            <Image
              src="https://whispr-app-storage.s3.eu-north-1.amazonaws.com/events/logotypeface.svg"
              alt="Whispr"
              width={100}
              height={28}
              className="h-6 w-auto flex-shrink-0 hidden sm:block"
              priority
            />
            <span className="text-white/20 hidden sm:inline">|</span>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-semibold text-white/95 tracking-tight truncate">
                {organizer?.name ? `Welcome, ${organizer.name.split(" ")[0]}` : "Dashboard"}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                {organization?.name && (
                  <span className="text-sm text-white/40 truncate">{organization.name}</span>
                )}
                {organizer?.approval_status && (
                  <>
                    <span className="text-white/20 hidden sm:inline">·</span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                        organizer.approval_status === "Approved"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : organizer.approval_status === "Pending"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-red-500/10 text-red-400 border-red-500/20"
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          organizer.approval_status === "Approved"
                            ? "bg-emerald-400"
                            : organizer.approval_status === "Pending"
                            ? "bg-amber-400"
                            : "bg-red-400"
                        }`}
                      />
                      {organizer.approval_status}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Organization Links (desktop) */}
            {organization?.website && (
              <a
                href={organization.website.startsWith("http") ? organization.website : `https://${organization.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden lg:flex items-center gap-1.5 px-3 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-white/50 hover:text-white/70 rounded-lg text-xs font-medium transition-colors"
              >
                <Globe size={13} />
                Website
                <ExternalLink size={10} />
              </a>
            )}
            {organization?.instagram_handle && (
              <a
                href={`https://instagram.com/${organization.instagram_handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden lg:flex items-center gap-1.5 px-3 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-white/50 hover:text-white/70 rounded-lg text-xs font-medium transition-colors"
              >
                <Instagram size={13} />
                @{organization.instagram_handle}
              </a>
            )}

            {/* Settings */}
            <button
              onClick={() => {
                if (isPending) {
                  setShowPendingTooltip(true);
                  setTimeout(() => setShowPendingTooltip(false), 3000);
                  return;
                }
                router.push("/organizers/setup");
              }}
              className="hidden sm:flex items-center gap-2 px-3 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-white/50 hover:text-white/70 rounded-lg text-sm font-medium transition-colors"
            >
              <Settings size={15} />
              <span className="hidden md:inline">Settings</span>
            </button>

            {/* Profile / Menu */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-2 py-2 sm:px-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-lg transition-colors"
              >
                <div className="w-6 h-6 rounded-md bg-white/[0.08] flex items-center justify-center">
                  <span className="text-[11px] font-semibold text-white/60">
                    {organizer?.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                </div>
                <span className="hidden sm:inline text-sm text-white/60 font-medium max-w-[100px] truncate">
                  {organizer?.name?.split(" ")[0]}
                </span>
                {menuOpen ? (
                  <X size={14} className="text-white/40" />
                ) : (
                  <Menu size={14} className="text-white/40" />
                )}
              </button>

              {/* Dropdown */}
              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-[#141414] border border-white/[0.08] rounded-xl shadow-2xl py-1 z-20">
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-white/[0.06]">
                      <p className="text-sm font-medium text-white/80 truncate">{organizer?.name}</p>
                      <p className="text-xs text-white/40 truncate mt-0.5">{organizer?.email}</p>
                    </div>

                    {/* Organization */}
                    {organization?.name && (
                      <div className="px-4 py-2.5 border-b border-white/[0.06]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center overflow-hidden flex-shrink-0">
                            {organization?.logo ? (
                              <img
                                src={organization.logo}
                                alt="Logo"
                                className="w-full h-full object-contain p-0.5"
                              />
                            ) : (
                              <Building2 size={14} className="text-white/30" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-white/70 truncate">{organization.name}</p>
                            {organization.tagline && (
                              <p className="text-[10px] text-white/30 truncate">{organization.tagline}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Links */}
                    <div className="py-1">
                      <button
                        onClick={() => {
                          if (!isPending) {
                            router.push("/organizers/setup");
                          }
                          setMenuOpen(false);
                        }}
                        className={`w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center gap-2.5 ${
                          isPending
                            ? "text-white/20 cursor-not-allowed"
                            : "text-white/60 hover:bg-white/[0.04] hover:text-white/80"
                        }`}
                      >
                        <Settings size={14} />
                        Organization Settings
                      </button>
                    </div>

                    <div className="border-t border-white/[0.06] py-1">
                      <button
                        onClick={() => {
                          onSignOut();
                          setMenuOpen(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-red-400/80 hover:bg-red-500/[0.06] hover:text-red-400 transition-colors flex items-center gap-2.5"
                      >
                        <LogOut size={14} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// STATS STRIP (mission-control HealthStrip style)
// ═══════════════════════════════════════════════════════════
function StatsStrip({
  totalEvents,
  published,
  drafts,
}: {
  totalEvents: number;
  published: number;
  drafts: number;
}) {
  return (
    <div className="bg-[#0a0a0a]/80 border-b border-white/[0.06] relative z-10">
      <div className="max-w-6xl mx-auto px-6 py-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            icon={<CalendarDays className="text-violet-400" size={18} />}
            label="Total Events"
            value={totalEvents}
            variant="default"
          />
          <StatCard
            icon={<Sparkles className="text-emerald-400" size={18} />}
            label="Published"
            value={published}
            variant={published > 0 ? "live" : "default"}
          />
          <StatCard
            icon={<Clock className="text-amber-400" size={18} />}
            label="Drafts"
            value={drafts}
            variant={drafts > 0 ? "highlight" : "default"}
          />
          <StatCard
            icon={<Users className="text-cyan-400" size={18} />}
            label="Total Attendees"
            value={0}
            variant="default"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  variant,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  variant: "default" | "highlight" | "live";
}) {
  const getCardStyles = () => {
    switch (variant) {
      case "highlight":
        return "bg-amber-500/[0.06] border-amber-500/20";
      case "live":
        return "bg-emerald-500/[0.06] border-emerald-500/20";
      default:
        return "bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.04]";
    }
  };

  return (
    <div
      className={`relative rounded-xl border p-4 sm:p-5 transition-colors duration-200 ${getCardStyles()}`}
    >
      {variant === "live" && (
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
          <div className="w-2 h-2 bg-emerald-400 rounded-full" />
        </div>
      )}
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div className="opacity-80">{icon}</div>
        <div className="text-xl sm:text-2xl font-semibold text-white/90 tabular-nums font-mono">
          {value}
        </div>
      </div>
      <div className="text-[11px] font-medium text-white/40 uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// EMPTY STATE
// ═══════════════════════════════════════════════════════════
function EmptyState({
  isPending,
  onCreateEvent,
}: {
  isPending: boolean;
  onCreateEvent: () => void;
}) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-12 text-center">
      <div className="w-14 h-14 mx-auto mb-5 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
        <CalendarDays size={24} className="text-white/20" />
      </div>
      <h3 className="text-lg font-medium text-white/80 mb-1.5">No events yet</h3>
      <p className="text-sm text-white/40 mb-6 max-w-sm mx-auto">
        {isPending
          ? "Your events will appear here once your account is approved."
          : "Create your first event to get started with Whispr."}
      </p>
      {!isPending && (
        <button
          onClick={onCreateEvent}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-lg text-sm font-medium hover:bg-white/90 transition-colors"
        >
          <Plus size={16} />
          Create Event
        </button>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// EVENT CARD (mission-control style)
// ═══════════════════════════════════════════════════════════
function EventCard({ event }: { event: Event }) {
  const router = useRouter();
  const isPublished = event.fields.Status === "published";
  const coverImage = event.fields.Cover?.[0];

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Date TBD";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      onClick={() => router.push(`/organizers/events/${event.id}/mission-control`)}
      className="group bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] rounded-xl overflow-hidden transition-all duration-200 cursor-pointer hover:bg-white/[0.03]"
    >
      {/* Cover */}
      <div className="relative h-36 overflow-hidden bg-white/[0.02]">
        {coverImage ? (
          <img
            src={coverImage}
            alt={event.fields.Name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <CalendarDays size={28} className="text-white/10" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium border backdrop-blur-sm ${
              isPublished
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                : "bg-amber-500/15 text-amber-400 border-amber-500/25"
            }`}
          >
            {isPublished ? "Live" : event.fields.Status || "Draft"}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-[15px] font-semibold text-white/90 mb-2.5 line-clamp-1 group-hover:text-white transition-colors">
          {event.fields.Name || "Untitled Event"}
        </h3>

        <div className="flex flex-col gap-1.5 text-sm text-white/40 mb-4">
          <div className="flex items-center gap-2">
            <Calendar size={13} className="opacity-60" />
            <span className="text-white/50 text-[13px]">{formatDate(event.fields.Date)}</span>
          </div>
          {event.fields.Location && (
            <div className="flex items-center gap-2">
              <MapPin size={13} className="opacity-60" />
              <span className="line-clamp-1 text-[13px]">{event.fields.Location}</span>
            </div>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/organizers/events/${event.id}/mission-control`);
          }}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-sm font-medium text-white/60 hover:text-white/80 transition-colors"
        >
          Mission Control
          <ArrowUpRight size={14} />
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MOBILE BOTTOM NAV
// ═══════════════════════════════════════════════════════════
function MobileBottomNav({
  onCreateEvent,
  isPending,
  showPendingTooltip,
  setShowPendingTooltip,
}: {
  onCreateEvent: () => void;
  isPending: boolean;
  showPendingTooltip: boolean;
  setShowPendingTooltip: (show: boolean) => void;
}) {
  const router = useRouter();

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="bg-[#0a0a0a]/95 backdrop-blur-lg border-t border-white/[0.06]">
        <div className="grid grid-cols-3 items-center">
          {/* Dashboard */}
          <button className="flex flex-col items-center justify-center py-3 gap-1 text-white/80">
            <CalendarDays size={20} strokeWidth={1.5} />
            <span className="text-[10px] font-medium tracking-wide text-white/60">Events</span>
          </button>

          {/* Create */}
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
              className={`w-11 h-11 rounded-xl flex items-center justify-center -mt-2 transition-colors ${
                isPending
                  ? "bg-white/[0.06] text-white/30 border border-white/[0.06]"
                  : "bg-white text-black"
              }`}
            >
              <Plus size={20} />
            </button>

            {showPendingTooltip && isPending && (
              <div className="absolute bottom-full mb-3 w-44 p-2.5 rounded-lg bg-[#1a1a1a] border border-white/[0.08] text-center shadow-2xl">
                <p className="text-[11px] text-white/50">Account pending approval</p>
              </div>
            )}
          </div>

          {/* Settings */}
          <button
            onClick={() => {
              if (!isPending) {
                router.push("/organizers/setup");
              }
            }}
            className={`flex flex-col items-center justify-center py-3 gap-1 ${
              isPending ? "text-white/20" : "text-white/40"
            }`}
          >
            <Settings size={20} strokeWidth={1.5} />
            <span className="text-[10px] font-medium tracking-wide">Settings</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
