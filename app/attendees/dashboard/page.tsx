"use client";

import { useState, useEffect, useRef, useCallback, memo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSwipeable } from "react-swipeable";
import {
  ClipboardList,
  Ticket,
  ChevronRight,
  Download,
  Calendar,
  MapPin,
  LogOut,
  Instagram,
  User,
  Building2,
  Copy,
  Share2,
  AlertTriangle,
  XCircle,
  Camera,
  Pencil,
  Loader2,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Menu,
  X,
  Check,
  Heart,
  ExternalLink,
  Users,
  Star,
  UserPlus,
  UserCheck,
  History,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { generateEventSlug } from "@/lib/utils";

import {
  getMe,
  getAttendeeEvents,
  getRegistrations,
  getTickets,
  cancelRegistration,
  updateProfile,
  getOrganizations,
  getFollowingOrganizers,
  followOrganizer,
  unfollowOrganizer,
  Profile,
  ExploreEvent,
  RegistrationItem,
  TicketItem,
  FeedOrganization,
} from "@/lib/api";
import NotificationBell from "@/components/organizer/NotificationBell";

// ─── STATIC CONSTANTS (outside component to avoid re-creation) ───
const AMBIENT_DELAY_STYLE = { animationDelay: '-1.5s' } as const;
const TABS = [
  { key: "profile" as const, label: "Profile", icon: User },
  // { key: "feed" as const, label: "Feed", icon: Heart }, // TODO: Re-enable Feed tab
  { key: "applications" as const, label: "Applications", icon: ClipboardList },
  { key: "tickets" as const, label: "Tickets", icon: Ticket },
] as const;
const SPRING_TRANSITION = { type: "spring" as const, bounce: 0.2, duration: 0.5 };
const TAB_CONTENT_TRANSITION = { duration: 0.25 };

// ═══════════════════════════════════════════════════════════
// MAIN DASHBOARD PAGE
// ═══════════════════════════════════════════════════════════
export default function AttendeeDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center bg-[#0A0A0A]">
          <div className="w-8 h-8 rounded-full border-2 border-[#D4A574]/30 border-t-[#D4A574] animate-spin" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<
    "profile" | "applications" | "tickets"
  >("profile");

  const [profile, setProfile] = useState<Profile | null>(null);
  const [events, setEvents] = useState<ExploreEvent[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [tickets, setTickets] = useState<TicketItem[]>([]);

  const [showAllRegistrations, setShowAllRegistrations] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);

  const highlightedAppId = searchParams.get("highlight");
  const tabParam = searchParams.get("tab");

  useEffect(() => {
    if (highlightedAppId || tabParam === "applications") {
      setActiveTab("applications");
    } else if (tabParam === "tickets") {
      setActiveTab("tickets");
    } else if (tabParam === "profile") {
      setActiveTab("profile");
    }
  }, [highlightedAppId, tabParam]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () =>
      setActiveTab((t) =>
        t === "profile"
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
          ? "profile"
          : "profile"
      ),
    trackMouse: false,
  });

  useEffect(() => {
    (async () => {
      try {
        const [me, evts] = await Promise.all([getMe(), getAttendeeEvents()]);
        setProfile(me);
        setEvents(evts);
      } catch {
        // Profile fetch failed
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setTabLoading(true);
      try {
        if (activeTab === "applications") {
          const data = await getRegistrations(showAllRegistrations);
          setRegistrations(data);
        }
        if (activeTab === "tickets") {
          setTickets(prev => prev.length === 0 ? [] : prev);
          if (tickets.length === 0) {
            const data = await getTickets();
            setTickets(data);
          }
        }
      } finally {
        setTabLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, showAllRegistrations]);

  const handleCancelRegistration = useCallback(async (registrationId: string) => {
    // Optimistic update — capture snapshot for rollback
    let snapshot: RegistrationItem[] = [];
    setRegistrations(prev => {
      snapshot = prev;
      return prev.filter((r) => r.registration_airtable_id !== registrationId);
    });
    try {
      await cancelRegistration(registrationId);
      toast.success("Registration cancelled successfully");
    } catch (err: any) {
      setRegistrations(snapshot);
      toast.error(err.message || "Failed to cancel registration");
    }
  }, []);

  const handleProfileUpdated = useCallback((updated: Profile) => {
    setProfile(updated);
  }, []);

  const handleSignOut = useCallback(() => {
    localStorage.removeItem("whispr_token");
    localStorage.removeItem("token");
    localStorage.removeItem("whispr_role");
    router.push("/auth");
  }, [router]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0A0A0A] relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#D4A574]/[0.03] blur-[80px] animate-float will-change-transform" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#2C2C2E]/[0.04] blur-[60px] animate-float will-change-transform" style={AMBIENT_DELAY_STYLE} />
        <div className="relative">
          <div className="w-10 h-10 rounded-full border-2 border-[#D4A574]/20 border-t-[#D4A574] animate-spin" />
          <div className="absolute inset-0 w-10 h-10 rounded-full bg-[#D4A574]/10 blur-md animate-pulse" />
        </div>
      </div>
    );
  }

  const mainEvent = events[0] || null;

  return (
    <div
      {...swipeHandlers}
      className="min-h-screen bg-[#0A0A0A] text-white relative overflow-hidden"
    >
      {/* ─── AMBIENT BACKGROUND ─── */}
      <div className="fixed inset-0 pointer-events-none" style={{ contain: 'strict' }}>
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#D4A574]/[0.03] blur-[80px] animate-float will-change-transform" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#2C2C2E]/[0.04] blur-[60px] animate-float will-change-transform" style={AMBIENT_DELAY_STYLE} />
        <div className="absolute top-[40%] left-[50%] w-[30%] h-[30%] rounded-full bg-[#D4A574]/[0.02] blur-[60px] animate-glow will-change-transform" />
      </div>

      {/* ─── DESKTOP HEADER ─── */}
      <header className="hidden lg:flex fixed top-0 left-0 right-0 z-50 h-16 items-center justify-between px-8 bg-[#0A0A0A]/70 backdrop-blur-2xl border-b border-white/[0.06]">
        <Image
          src="https://whispr-app-storage.s3.eu-north-1.amazonaws.com/events/logotypeface.svg"
          alt="Whispr"
          width={100}
          height={28}
          className="h-6 w-auto opacity-80"
          priority
        />

        <div className="flex items-center gap-3">
          <NotificationBell />
          <div className="relative">
          <button
            onClick={() => setDesktopMenuOpen(!desktopMenuOpen)}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-white/[0.04] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-white/[0.08] flex items-center justify-center overflow-hidden flex-shrink-0">
              {profile?.profilePicture ? (
                <img
                  src={profile.profilePicture}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs font-semibold text-neutral-400">
                  {profile?.fullName?.charAt(0)?.toUpperCase() || "U"}
                </span>
              )}
            </div>
            <span className="text-sm text-neutral-300 max-w-[120px] truncate">
              {profile?.fullName || "User"}
            </span>
          </button>

          <AnimatePresence>
            {desktopMenuOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40"
                  onClick={() => setDesktopMenuOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-[#2C2C2E] bg-[#1C1C1E]/95 backdrop-blur-xl p-2 shadow-2xl shadow-black/50 z-50"
                >
                  <div className="px-3 py-2 mb-1">
                    <p className="text-sm font-medium truncate">
                      {profile?.fullName || "User"}
                    </p>
                    <p className="text-xs text-neutral-500 truncate">
                      {profile?.email}
                    </p>
                  </div>
                  <div className="h-px bg-white/[0.06] my-1" />
                  <button
                    onClick={() => {
                      setDesktopMenuOpen(false);
                      setActiveTab("profile");
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-neutral-400 hover:text-white hover:bg-white/[0.04] transition-colors"
                  >
                    <Pencil size={15} />
                    Edit Profile
                  </button>
                  <div className="h-px bg-white/[0.06] my-1" />
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut size={15} />
                    Sign out
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
        </div>
      </header>

      {/* ─── MOBILE HEADER ─── */}
      <header className="lg:hidden sticky top-0 z-40 bg-[#0A0A0A]/70 backdrop-blur-2xl border-b border-white/[0.06]">
        <div className="flex items-center justify-between px-4 h-14">
          <Image
            src="https://whispr-app-storage.s3.eu-north-1.amazonaws.com/events/logotypeface.svg"
            alt="Whispr"
            width={90}
            height={24}
            className="h-5 w-auto opacity-80"
            priority
          />
          <div className="flex items-center gap-2">
            <NotificationBell />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center overflow-hidden"
            >
              {profile?.profilePicture ? (
                <img
                  src={profile.profilePicture}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs font-semibold text-neutral-400">
                  {profile?.fullName?.charAt(0)?.toUpperCase() || "U"}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40"
                onClick={() => setMobileMenuOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute right-3 top-[58px] w-56 rounded-xl border border-[#2C2C2E] bg-[#1C1C1E]/95 backdrop-blur-xl p-2 shadow-2xl shadow-black/50 z-50"
              >
                <div className="px-3 py-2 mb-1">
                  <p className="text-sm font-medium truncate">
                    {profile?.fullName || "User"}
                  </p>
                  <p className="text-xs text-neutral-500 truncate">
                    {profile?.email}
                  </p>
                </div>
                <div className="h-px bg-white/[0.06] my-1" />
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setActiveTab("profile");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-neutral-400 hover:text-white hover:bg-white/[0.04] transition-colors"
                >
                  <Pencil size={15} />
                  Edit Profile
                </button>
                {profile?.instagramHandle && (
                  <a
                    href={`https://instagram.com/${profile.instagramHandle.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-neutral-400 hover:text-white hover:bg-white/[0.04] transition-colors"
                  >
                    <Instagram size={15} />
                    {profile.instagramHandle.startsWith("@")
                      ? profile.instagramHandle
                      : `@${profile.instagramHandle}`}
                  </a>
                )}
                <div className="h-px bg-white/[0.06] my-1" />
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut size={15} />
                  Sign out
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      {/* ─── MAIN CONTENT ─── */}
      <div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 lg:pt-24 pb-28 lg:pb-12">
          {/* Welcome + Event */}
          <section className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-1 tracking-tight" style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>
              Welcome back
              {profile?.fullName
                ? <span className="text-[#D4A574]">{`, ${profile.fullName.split(" ")[0]}`}</span>
                : ""}
            </h1>
            <p className="text-sm text-neutral-500 mb-6">
              Here&apos;s what&apos;s happening with your events
            </p>

            <HeroEventCard event={mainEvent} />
          </section>

          {/* Tab Bar */}
          <div className="flex gap-1 border-b border-[#2C2C2E] mb-6 relative">
            {TABS.map(({ key, label, icon: Icon }) => {
              const isActive = activeTab === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-all duration-300 relative ${
                    isActive
                      ? "text-[#D4A574] border-b-2 border-[#D4A574]"
                      : "text-[#8E8E93] hover:text-[#F2F2F7]"
                  }`}
                  style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon size={15} strokeWidth={isActive ? 2 : 1.5} className={isActive ? "text-[#D4A574]" : ""} />
                    <span className="hidden sm:inline">{label}</span>
                    <span className="sm:hidden">
                      {key === "applications" ? "Apps" : label}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={TAB_CONTENT_TRANSITION}
            >
              {tabLoading ? (
                <div className="flex justify-center py-16">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full border-2 border-[#D4A574]/20 border-t-[#D4A574] animate-spin" />
                    <div className="absolute inset-0 w-8 h-8 rounded-full bg-[#D4A574]/10 blur-md animate-pulse" />
                  </div>
                </div>
              ) : activeTab === "profile" ? (
                <ProfileTab
                  profile={profile}
                  onProfileUpdated={handleProfileUpdated}
                />
              ) : activeTab === "applications" ? (
                <ApplicationsTab
                  registrations={registrations}
                  highlightedId={highlightedAppId}
                  onCancel={handleCancelRegistration}
                  showAll={showAllRegistrations}
                  onToggleShowAll={() => setShowAllRegistrations(v => !v)}
                />
              ) : (
                <TicketsTab tickets={tickets} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ─── MOBILE BOTTOM NAV ─── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0A0A0A]/80 backdrop-blur-2xl border-t border-white/[0.06] pb-safe">
        <div className="grid grid-cols-3 h-16">
          {TABS.map(({ key, label, icon: Icon }) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 relative ${
                  isActive ? "text-[#D4A574]" : "text-neutral-600"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobileNavIndicator"
                    className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-[#D4A574] shadow-[0_0_8px_rgba(212,165,116,0.5)]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                <span className="text-[10px] font-medium">
                  {key === "applications" ? "Apps" : label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// HERO EVENT CARD
// ═══════════════════════════════════════════════════════════
const HeroEventCard = memo(function HeroEventCard({ event }: { event: ExploreEvent | null }) {
  const router = useRouter();

  const formatEventDate = (dateStr: string | null) => {
    if (!dateStr) return "Date TBA";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  if (!event) {
    return (
      <div className="rounded-2xl border border-dashed border-[#2C2C2E] bg-[#1C1C1E] p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#D4A574]/[0.02] to-[#2C2C2E]/[0.02]" />
        <Calendar size={28} className="mx-auto mb-3 text-neutral-500 relative" />
        <p className="text-sm text-neutral-400 relative">No upcoming events</p>
        <p className="text-xs text-neutral-600 mt-1 relative">Check back soon for new events</p>
      </div>
    );
  }

  const r = event.user_relation;
  const org = event.organization;
  const eventSlug = generateEventSlug(event.name, event.id);

  let ctaLabel = "Get Your Pass";
  let ctaAction = () => router.push(`/attendees/events/${eventSlug}`);

  if (r?.has_ticket) {
    ctaLabel = "View Ticket";
    ctaAction = () =>
      router.push(`/attendees/tickets/${r.ticket?.id}`);
  } else if (r?.is_registered) {
    ctaLabel = "View Application";
    ctaAction = () =>
      router.push(
        `/attendees/dashboard?tab=applications&highlight=${r.registration?.id}`
      );
  }

  return (
    <div
      className="group rounded-2xl overflow-hidden border border-[#2C2C2E] bg-[#1C1C1E] hover:border-[#D4A574]/20 transition-all duration-500 cursor-pointer relative hover:shadow-none"
      onClick={() => router.push(`/attendees/events/${eventSlug}`)}
    >
      {/* Cover Image */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={event.cover || "/event-placeholder.jpg"}
          alt={event.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#D4A574]/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Status pills */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          {org && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-xs text-white/80">
              {org.logo ? (
                <img
                  src={org.logo}
                  alt=""
                  className="w-4 h-4 rounded-full object-cover"
                />
              ) : (
                <Building2 size={12} className="text-white/60" />
              )}
              <span>{org.name || "Organizer"}</span>
            </div>
          )}
          {r?.is_registered && (
            <div className="px-2.5 py-1 rounded-full bg-[#D4A574]/15 border border-[#D4A574]/20 text-[11px] font-medium text-[#D4A574] shadow-[0_0_10px_rgba(212,165,116,0.2)]">
              Registered
            </div>
          )}
        </div>

        {/* Event info overlay */}
        <div className="absolute bottom-3 left-4 right-4">
          <h2 className="text-lg sm:text-xl font-bold mb-2 leading-tight">
            {event.name}
          </h2>
          <div className="flex flex-wrap items-center gap-3 text-xs text-white/60">
            {event.date && (
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {formatEventDate(event.date)}
              </span>
            )}
            {event.location && (
              <span className="flex items-center gap-1">
                <MapPin size={12} />
                <span className="line-clamp-1">{event.location}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="p-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            ctaAction();
          }}
          className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
            r?.has_ticket
              ? "bg-[#D4A574]/10 text-[#D4A574] border border-[#D4A574]/20 hover:bg-[#D4A574]/20 hover:shadow-[0_0_20px_rgba(212,165,116,0.15)]"
              : r?.is_registered
              ? "bg-white/[0.06] text-white border border-[#2C2C2E] hover:bg-white/[0.1]"
              : "bg-[#D4A574] text-[#0A0A0A] hover:bg-[#B8785C] hover:scale-[1.01]"
          }`}
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  );
});

// ═══════════════════════════════════════════════════════════
// PROFILE TAB
// ═══════════════════════════════════════════════════════════
const ProfileTab = memo(function ProfileTab({
  profile,
  onProfileUpdated,
}: {
  profile: Profile | null;
  onProfileUpdated: (updated: Profile) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [profession, setProfession] = useState("");
  const [company, setCompany] = useState("");
  const [university, setUniversity] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("@");
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState("");

  const startEditing = () => {
    if (!profile) return;
    setFullName(profile.fullName || "");
    setBio(profile.bio || "");
    setProfession(profile.profession || "");
    setCompany(profile.company || "");
    setUniversity(profile.university || "");
    setInstagramHandle(profile.instagramHandle || "@");
    setProfilePic(null);
    setProfilePicPreview(profile.profilePicture || "");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setProfilePic(null);
    setProfilePicPreview(profile?.profilePicture || "");
  };

  const handleProfilePic = (file: File | null) => {
    if (!file) return;
    setProfilePic(file);
    setProfilePicPreview(URL.createObjectURL(file));
  };

  const handleInstagramChange = (val: string) => {
    let normalized = val.replace(/\s+/g, "");
    if (!normalized.startsWith("@")) {
      normalized = "@" + normalized.replace(/^@+/, "");
    }
    if (normalized === "@") normalized = "@";
    setInstagramHandle(normalized);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const form = new FormData();
      form.append("full_name", fullName.trim());
      form.append("profession", profession);
      form.append("company", company);
      form.append("university", university);
      form.append("instagram_handle", instagramHandle.trim() !== "@" ? instagramHandle.trim() : "");
      form.append("bio", bio.trim());
      if (profilePic) form.append("photo", profilePic);

      await updateProfile(form);
      const refreshed = await getMe();
      onProfileUpdated(refreshed);
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return null;

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-[#2C2C2E] text-white text-sm placeholder:text-neutral-600 outline-none transition-all focus:border-[#D4A574]/40 focus:bg-white/[0.06] hover:bg-white/[0.05]";

  // ─── EDIT MODE ───
  if (isEditing) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Edit Profile</h2>
          <button
            onClick={cancelEditing}
            className="text-sm text-neutral-500 hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>

        <div className="space-y-5 max-w-lg">
          {/* Photo */}
          <div className="flex items-center gap-4">
            <div
              onClick={() =>
                document.getElementById("editProfilePicInput")?.click()
              }
              className="relative w-20 h-20 rounded-full cursor-pointer group flex-shrink-0"
            >
              {profilePicPreview ? (
                <img
                  src={profilePicPreview}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover border border-white/[0.1]"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-white/[0.04] border border-dashed border-white/[0.15] flex items-center justify-center">
                  <User size={24} className="text-neutral-600" />
                </div>
              )}
              <div className="absolute -bottom-0.5 -right-0.5 w-7 h-7 rounded-full bg-[#D4A574] flex items-center justify-center">
                <Camera size={13} className="text-black" />
              </div>
              <input
                id="editProfilePicInput"
                type="file"
                accept="image/*"
                onChange={(e) =>
                  handleProfilePic(e.target.files?.[0] || null)
                }
                className="hidden"
              />
            </div>
            <div>
              <p className="text-sm font-medium">Profile photo</p>
              <p className="text-xs text-neutral-500">
                Tap the image to change
              </p>
            </div>
          </div>

          {/* Fields */}
          <div className="space-y-1.5">
            <label className="text-xs text-neutral-500 font-medium">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-neutral-500 font-medium">
              What do you do?
            </label>
            <select
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              className={`${inputClass} cursor-pointer appearance-none`}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 0.75rem center",
                backgroundSize: "1.25rem",
              }}
            >
              <option value="" className="bg-[#0a0a0a]">
                Select profession
              </option>
              <option value="student" className="bg-[#0a0a0a]">
                Student
              </option>
              <option value="employed" className="bg-[#0a0a0a]">
                Employed
              </option>
              <option value="freelancer" className="bg-[#0a0a0a]">
                Freelancer
              </option>
              <option value="entrepreneur" className="bg-[#0a0a0a]">
                Entrepreneur
              </option>
            </select>
          </div>

          <AnimatePresence>
            {profession === "student" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1.5"
              >
                <label className="text-xs text-neutral-500 font-medium">
                  University
                </label>
                <input
                  type="text"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  placeholder="Your university"
                  className={inputClass}
                />
              </motion.div>
            )}
            {profession === "employed" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1.5"
              >
                <label className="text-xs text-neutral-500 font-medium">
                  Company
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Your company"
                  className={inputClass}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-1.5">
            <label className="text-xs text-neutral-500 font-medium">
              Instagram
            </label>
            <input
              type="text"
              value={instagramHandle}
              onChange={(e) => handleInstagramChange(e.target.value)}
              placeholder="@yourhandle"
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-neutral-500 font-medium">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
              saving
                ? "bg-white/[0.06] text-neutral-500 cursor-not-allowed"
                : "bg-[#D4A574] text-[#0A0A0A] hover:bg-[#B8785C] hover:scale-[1.01]"
            }`}
          >
            {saving ? (
              <Loader2 size={18} className="mx-auto animate-spin" />
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    );
  }

  // ─── READ-ONLY VIEW ───
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Profile</h2>
        <button
          onClick={startEditing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#2C2C2E] text-[#8E8E93] hover:border-[#D4A574] hover:text-[#D4A574] bg-transparent transition-all duration-300"
          style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
        >
          <Pencil size={12} />
          Edit
        </button>
      </div>

      {/* Profile card */}
      <div className="rounded-2xl border border-[#2C2C2E] bg-[#1C1C1E] p-5 sm:p-6 mb-4 relative overflow-hidden group/profile">
        <div className="absolute inset-0 opacity-0 group-hover/profile:opacity-100 transition-opacity duration-500" />
        <div className="relative">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-white/[0.06] flex items-center justify-center overflow-hidden flex-shrink-0 ring-2 ring-white/[0.06] ring-offset-2 ring-offset-[#0A0A0A]">
              {profile.profilePicture ? (
                <img
                  src={profile.profilePicture}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xl font-bold text-neutral-500">
                  {profile.fullName?.charAt(0)?.toUpperCase() || "U"}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-xl font-bold" style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>{profile.fullName || "User"}</h3>
              {profile.bio && (
                <p className="text-sm text-neutral-400 mt-0.5 line-clamp-2">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {profile.profession && (
              <span className="inline-flex items-center gap-1.5 text-[#8E8E93] border border-[#2C2C2E] bg-transparent text-xs px-2.5 py-1 rounded-md capitalize" style={{ fontFamily: "var(--font-mono)" }}>
                {profile.profession}
              </span>
            )}
            {profile.age && (
              <span className="inline-flex items-center gap-1.5 text-[#8E8E93] border border-[#2C2C2E] bg-transparent text-xs px-2.5 py-1 rounded-md" style={{ fontFamily: "var(--font-mono)" }}>
                {profile.age} years old
              </span>
            )}
            {profile.gender && (
              <span className="inline-flex items-center gap-1.5 text-[#8E8E93] border border-[#2C2C2E] bg-transparent text-xs px-2.5 py-1 rounded-md capitalize" style={{ fontFamily: "var(--font-mono)" }}>
                {profile.gender}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-[#2C2C2E] bg-[#1C1C1E] p-4 hover:border-white/[0.12] transition-colors duration-300">
          <h4 className="text-[11px] text-[#8E8E93] uppercase tracking-[0.08em] font-medium mb-3" style={{ fontFamily: "var(--font-mono)" }}>
            Contact
          </h4>
          <div className="space-y-2.5">
            <InfoRow icon={Mail} label={profile.email} />
            {profile.registeredNumber && (
              <InfoRow icon={Phone} label={profile.registeredNumber} />
            )}
            {profile.instagramHandle && (
              <a
                href={`https://instagram.com/${profile.instagramHandle.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group/ig"
              >
                <InfoRow
                  icon={Instagram}
                  label={
                    profile.instagramHandle.startsWith("@")
                      ? profile.instagramHandle
                      : `@${profile.instagramHandle}`
                  }
                  hoverable
                />
              </a>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-[#2C2C2E] bg-[#1C1C1E] p-4 hover:border-white/[0.12] transition-colors duration-300">
          <h4 className="text-[11px] text-[#8E8E93] uppercase tracking-[0.08em] font-medium mb-3" style={{ fontFamily: "var(--font-mono)" }}>
            Details
          </h4>
          <div className="space-y-2.5">
            {profile.profession && (
              <InfoRow
                icon={Briefcase}
                label={profile.profession}
                capitalize
              />
            )}
            {profile.company && (
              <InfoRow icon={Building2} label={profile.company} />
            )}
            {profile.university && (
              <InfoRow icon={GraduationCap} label={profile.university} />
            )}
            {!profile.profession && !profile.company && !profile.university && (
              <p className="text-sm text-neutral-600">No details added yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

function InfoRow({
  icon: Icon,
  label,
  capitalize,
  hoverable,
}: {
  icon: any;
  label: string;
  capitalize?: boolean;
  hoverable?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2.5 ${hoverable ? "group-hover/ig:text-[#D4A574]" : ""}`}
    >
      <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center flex-shrink-0">
        <Icon
          size={13}
          className={`text-neutral-500 ${hoverable ? "group-hover/ig:text-[#D4A574]" : ""} transition-colors`}
        />
      </div>
      <span
        className={`text-sm text-neutral-300 truncate ${capitalize ? "capitalize" : ""} ${hoverable ? "group-hover/ig:text-[#D4A574]" : ""} transition-colors`}
      >
        {label}
      </span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// APPLICATIONS TAB
// ═══════════════════════════════════════════════════════════
const ApplicationsTab = memo(function ApplicationsTab({
  registrations,
  highlightedId,
  onCancel,
  showAll,
  onToggleShowAll,
}: {
  registrations: RegistrationItem[];
  highlightedId?: string | null;
  onCancel: (registrationId: string) => void;
  showAll: boolean;
  onToggleShowAll: () => void;
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const highlightedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (highlightedId && highlightedRef.current) {
      highlightedRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [highlightedId]);

  const handleCopyCode = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // fallback
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelConfirmId) return;
    setCancelling(true);
    try {
      await onCancel(cancelConfirmId);
    } finally {
      setCancelling(false);
      setCancelConfirmId(null);
    }
  };

  const canCancel = (status: string) => {
    const blocked = ["paid", "rejected", "cancelled"];
    return !blocked.includes(status.toLowerCase());
  };

  const handleShare = async (r: RegistrationItem) => {
    const shareText = `Join me at ${r.event.name}! Use my registration code: ${r.registration_id}`;
    const shareUrl =
      r.share_link ||
      (typeof window !== "undefined" ? window.location.origin : "");

    if (navigator.share) {
      try {
        await navigator.share({
          title: r.event.name || "Event Registration",
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // cancelled
      }
    } else {
      window.open(
        `https://wa.me/?text=${encodeURIComponent(shareText + "\n" + shareUrl)}`,
        "_blank"
      );
    }
  };

  const formatEventDate = (dateStr: string | null) => {
    if (!dateStr) return "Date TBA";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const statusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "text-[#D4A574] bg-[#D4A574]/10 border-[#D4A574]/20";
      case "pending":
        return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      default:
        return "text-red-400 bg-red-500/10 border-red-500/20";
    }
  };

  if (!registrations.length)
    return (
      <div className="text-center py-16 relative">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
          <ClipboardList
            size={24}
            className="text-neutral-500"
          />
        </div>
        <p className="text-sm text-neutral-400">No applications yet</p>
        <p className="text-xs text-neutral-600 mt-1">
          Apply to events to see them here
        </p>
      </div>
    );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Applications</h2>
        <button
          onClick={onToggleShowAll}
          className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-200 transition-colors px-2.5 py-1 rounded-full border border-white/[0.08] hover:border-white/[0.15] bg-white/[0.03]"
        >
          {showAll ? (
            <>
              <X size={11} />
              Active only
            </>
          ) : (
            <>
              <History size={11} />
              View full history
            </>
          )}
        </button>
      </div>

      <div className="space-y-3">
        {registrations.map((r, index) => {
          const isHighlighted =
            highlightedId === r.registration_airtable_id ||
            highlightedId === r.registration_id;

          const isInactive = showAll && r.event.is_active === false;

          return (
            <motion.div
              key={r.registration_airtable_id}
              ref={isHighlighted ? highlightedRef : null}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`rounded-2xl border bg-[#1C1C1E] overflow-hidden transition-all duration-300 hover:border-white/[0.12] ${
                isHighlighted
                  ? "border-[#D4A574]/40 ring-1 ring-[#D4A574]/20 shadow-none"
                  : "border-[#2C2C2E]"
              } ${isInactive ? "opacity-50" : ""}`}
            >
              <div className="flex">
                {/* Cover thumbnail */}
                {r.event.cover && (
                  <div className="hidden sm:block w-32 flex-shrink-0">
                    <img
                      src={r.event.cover}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex-1 p-4">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm line-clamp-1">
                          {r.event.name || "Untitled Event"}
                        </h3>
                        {isInactive && (
                          <span className="flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-neutral-500 uppercase tracking-wide">
                            Inactive
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          {formatEventDate(r.event.date)}
                        </span>
                        {r.event.location && (
                          <span className="flex items-center gap-1">
                            <MapPin size={11} />
                            <span className="line-clamp-1">
                              {r.event.location}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>

                    <span
                      className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium capitalize border ${statusColor(r.status)}`}
                    >
                      {r.status}
                    </span>
                  </div>

                  {/* Gender mismatch warning */}
                  {r.gender_mismatch && (
                    <div className="mb-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
                      <AlertTriangle size={11} />
                      Gender mismatch
                    </div>
                  )}

                  {/* Pass info row */}
                  {r.pass?.type && (
                    <div className="flex items-center justify-between py-2.5 border-t border-white/[0.06] mb-3">
                      <div>
                        <span className="text-[10px] text-neutral-500 uppercase tracking-wider">
                          Pass
                        </span>
                        <p className="text-xs font-medium">{r.pass.type}</p>
                      </div>
                      {r.pass.price !== null &&
                        r.pass.price !== undefined && (
                          <p className="text-xs font-semibold text-[#D4A574]">
                            {r.pass.price === 0
                              ? "Free"
                              : `PKR ${r.pass.price.toLocaleString()}`}
                          </p>
                        )}
                    </div>
                  )}

                  {/* Registration code */}
                  <div className="flex items-center justify-between gap-2 py-2.5 px-3 rounded-lg bg-black/30 border border-[#D4A574]/[0.08]">
                    <div className="min-w-0">
                      <span className="text-[10px] text-neutral-500 uppercase tracking-wider">
                        Code
                      </span>
                      <p className="font-mono text-xs text-[#D4A574] font-medium truncate">
                        {r.registration_id}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        handleCopyCode(
                          r.registration_id,
                          r.registration_airtable_id
                        )
                      }
                      className="p-1.5 rounded-md hover:bg-white/[0.06] transition-colors flex-shrink-0"
                      title="Copy code"
                    >
                      {copiedId === r.registration_airtable_id ? (
                        <Check size={13} className="text-[#D4A574]" />
                      ) : (
                        <Copy size={13} className="text-neutral-500" />
                      )}
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleShare(r)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/[0.04] hover:bg-[#D4A574]/[0.08] border border-white/[0.06] hover:border-[#D4A574]/20 text-xs font-medium transition-all duration-300"
                    >
                      <Share2 size={12} />
                      Share
                    </button>
                    {canCancel(r.status) && (
                      <button
                        onClick={() =>
                          setCancelConfirmId(r.registration_airtable_id)
                        }
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-red-400/70 hover:text-red-400 hover:bg-red-500/5 transition-colors"
                      >
                        <XCircle size={12} />
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Cancel Confirmation Modal */}
      <AnimatePresence>
        {cancelConfirmId && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => !cancelling && setCancelConfirmId(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="w-full max-w-sm rounded-2xl border border-[#2C2C2E] bg-[#1C1C1E]/95 backdrop-blur-xl p-5 shadow-2xl shadow-black/50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-red-500/10 flex items-center justify-center">
                    <XCircle size={18} className="text-red-400" />
                  </div>
                  <h3 className="font-semibold">Cancel Registration</h3>
                </div>
                <p className="text-sm text-neutral-400 mb-5">
                  Are you sure? You can re-register afterwards if you&apos;d
                  like.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCancelConfirmId(null)}
                    disabled={cancelling}
                    className="flex-1 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] border border-[#2C2C2E] text-sm font-medium transition-all disabled:opacity-50"
                  >
                    Keep It
                  </button>
                  <button
                    onClick={handleConfirmCancel}
                    disabled={cancelling}
                    className="flex-1 py-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/20 text-sm font-medium text-red-400 transition-all disabled:opacity-50"
                  >
                    {cancelling ? "Cancelling..." : "Yes, Cancel"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
});

// ═══════════════════════════════════════════════════════════
// TICKETS TAB
// ═══════════════════════════════════════════════════════════
const TicketsTab = memo(function TicketsTab({ tickets }: { tickets: TicketItem[] }) {
  const formatEventDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "TBA";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  if (!tickets.length)
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-[#D4A574]/[0.05] border border-[#D4A574]/[0.1] flex items-center justify-center mx-auto mb-4">
          <Ticket size={24} className="text-[#D4A574]/50" />
        </div>
        <p className="text-sm text-neutral-400">No tickets yet</p>
        <p className="text-xs text-neutral-600 mt-1">
          Your confirmed tickets will appear here
        </p>
      </div>
    );

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Tickets</h2>

      <div className="space-y-3">
        {tickets.map((t, index) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="rounded-2xl border border-[#2C2C2E] bg-[#1C1C1E] hover:border-[#D4A574]/25 hover:shadow-none transition-all duration-300 cursor-pointer group"
            onClick={() => {
              if (t.ticket_url) {
                window.open(t.ticket_url, "_blank");
              } else {
                toast.error("Ticket PDF not available");
              }
            }}
          >
            <div className="p-4 flex items-center gap-4">
              {/* Ticket icon */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4A574]/15 to-[#D4A574]/5 border border-[#D4A574]/10 flex items-center justify-center flex-shrink-0">
                <Ticket
                  size={20}
                  className="text-[#D4A574] group-hover:scale-110 transition-transform duration-300"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm mb-0.5 line-clamp-1">
                  {t.event?.name || "Event"}
                </h3>
                <div className="flex items-center gap-3 text-xs text-neutral-500">
                  <span className="flex items-center gap-1">
                    <Calendar size={11} />
                    {formatEventDate(t.event?.date)}
                  </span>
                  {t.pass_type && (
                    <span className="text-neutral-400">{t.pass_type}</span>
                  )}
                </div>
              </div>

              <Download
                size={18}
                className="text-neutral-600 group-hover:text-[#D4A574] transition-colors flex-shrink-0"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
});

// ═══════════════════════════════════════════════════════════
// FEED TAB — Organizer Discovery
// ═══════════════════════════════════════════════════════════
const FeedTab = memo(function FeedTab() {
  const router = useRouter();
  const [organizers, setOrganizers] = useState<FeedOrganization[]>([]);
  const [followedOrgIds, setFollowedOrgIds] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<"all" | "following">("all");
  const [loading, setLoading] = useState(true);
  const [followingInFlight, setFollowingInFlight] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      try {
        const [allOrgs, followedOrgs] = await Promise.all([
          getOrganizations(),
          getFollowingOrganizers(),
        ]);
        // Sort by follower count descending (social proof)
        allOrgs.sort((a, b) => (b.follower_count ?? 0) - (a.follower_count ?? 0));
        setOrganizers(allOrgs);
        setFollowedOrgIds(new Set(followedOrgs.map((o) => o.id)));
      } catch {
        toast.error("Failed to load organizers");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleFollow = useCallback(async (orgId: string) => {
    setFollowingInFlight((prev) => new Set(prev).add(orgId));

    // Optimistic update
    setFollowedOrgIds((prev) => {
      const next = new Set(prev);
      next.add(orgId);
      return next;
    });
    setOrganizers((prev) =>
      prev.map((o) =>
        o.id === orgId ? { ...o, follower_count: (o.follower_count ?? 0) + 1 } : o
      )
    );

    try {
      await followOrganizer(orgId);
    } catch (err: any) {
      // Revert on error (unless 409 = already following)
      if (err?.response?.status !== 409) {
        setFollowedOrgIds((prev) => {
          const next = new Set(prev);
          next.delete(orgId);
          return next;
        });
        setOrganizers((prev) =>
          prev.map((o) =>
            o.id === orgId
              ? { ...o, follower_count: Math.max(0, (o.follower_count ?? 0) - 1) }
              : o
          )
        );
        toast.error("Failed to follow organizer");
      }
    } finally {
      setFollowingInFlight((prev) => {
        const next = new Set(prev);
        next.delete(orgId);
        return next;
      });
    }
  }, []);

  const handleUnfollow = useCallback(async (orgId: string) => {
    setFollowingInFlight((prev) => new Set(prev).add(orgId));

    // Optimistic update
    setFollowedOrgIds((prev) => {
      const next = new Set(prev);
      next.delete(orgId);
      return next;
    });
    setOrganizers((prev) =>
      prev.map((o) =>
        o.id === orgId
          ? { ...o, follower_count: Math.max(0, (o.follower_count ?? 0) - 1) }
          : o
      )
    );

    try {
      await unfollowOrganizer(orgId);
    } catch {
      // Revert on error
      setFollowedOrgIds((prev) => {
        const next = new Set(prev);
        next.add(orgId);
        return next;
      });
      setOrganizers((prev) =>
        prev.map((o) =>
          o.id === orgId ? { ...o, follower_count: (o.follower_count ?? 0) + 1 } : o
        )
      );
      toast.error("Failed to unfollow organizer");
    } finally {
      setFollowingInFlight((prev) => {
        const next = new Set(prev);
        next.delete(orgId);
        return next;
      });
    }
  }, []);

  const displayedOrganizers =
    filter === "following"
      ? organizers.filter((o) => followedOrgIds.has(o.id))
      : organizers;

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="space-y-2">
          <div className="h-7 w-48 bg-white/[0.06] rounded-lg animate-pulse" />
          <div className="h-4 w-64 bg-white/[0.04] rounded-lg animate-pulse" />
        </div>
        {/* Filter skeleton */}
        <div className="flex gap-2">
          <div className="h-9 w-32 bg-white/[0.06] rounded-full animate-pulse" />
          <div className="h-9 w-28 bg-white/[0.06] rounded-full animate-pulse" />
        </div>
        {/* Card skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-[#2C2C2E] bg-[#1C1C1E] overflow-hidden"
            >
              <div className="aspect-[2/1] bg-white/[0.04] animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-5 w-36 bg-white/[0.06] rounded animate-pulse" />
                <div className="h-3 w-48 bg-white/[0.04] rounded animate-pulse" />
                <div className="h-3 w-24 bg-white/[0.04] rounded animate-pulse" />
                <div className="flex gap-2 mt-3">
                  <div className="h-9 flex-1 bg-white/[0.06] rounded-lg animate-pulse" />
                  <div className="h-9 flex-1 bg-white/[0.04] rounded-lg animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2
          className="text-xl sm:text-2xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
        >
          Event Organizers
        </h2>
        <p className="text-sm text-neutral-500 mt-1">
          Discover event creators you love
        </p>
      </div>

      {/* Filter Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            filter === "all"
              ? "bg-[#D4A574] text-[#0A0A0A]"
              : "bg-white/[0.06] text-neutral-400 hover:text-white hover:bg-white/[0.1]"
          }`}
          style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
        >
          All Organizers
        </button>
        <button
          onClick={() => setFilter("following")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
            filter === "following"
              ? "bg-[#D4A574] text-[#0A0A0A]"
              : "bg-white/[0.06] text-neutral-400 hover:text-white hover:bg-white/[0.1]"
          }`}
          style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
        >
          <UserCheck size={14} />
          Following
          {followedOrgIds.size > 0 && (
            <span className={`text-xs ${filter === "following" ? "text-[#0A0A0A]/70" : "text-neutral-500"}`}>
              ({followedOrgIds.size})
            </span>
          )}
        </button>
      </div>

      {/* Empty State (Following filter, no follows) */}
      {filter === "following" && displayedOrganizers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#2C2C2E] bg-[#1C1C1E] p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#D4A574]/[0.02] to-[#2C2C2E]/[0.02]" />
          <Users size={32} className="mx-auto mb-3 text-neutral-500 relative" />
          <p className="text-sm font-medium text-neutral-300 relative">
            You&apos;re not following anyone yet
          </p>
          <p className="text-xs text-neutral-500 mt-1.5 relative max-w-xs mx-auto">
            Start following organizers to see their upcoming events here
          </p>
          <button
            onClick={() => setFilter("all")}
            className="mt-4 px-5 py-2 rounded-lg bg-[#D4A574] text-[#0A0A0A] text-sm font-semibold hover:bg-[#B8785C] transition-colors relative"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Browse All Organizers
          </button>
        </div>
      ) : displayedOrganizers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#2C2C2E] bg-[#1C1C1E] p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#D4A574]/[0.02] to-[#2C2C2E]/[0.02]" />
          <Building2 size={32} className="mx-auto mb-3 text-neutral-500 relative" />
          <p className="text-sm text-neutral-400 relative">
            No organizers found
          </p>
          <p className="text-xs text-neutral-600 mt-1 relative">
            Check back soon for new event organizers
          </p>
        </div>
      ) : (
        /* Organizer Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {displayedOrganizers.map((org, i) => (
            <OrganizerCard
              key={org.id}
              org={org}
              isFollowing={followedOrgIds.has(org.id)}
              isInFlight={followingInFlight.has(org.id)}
              onFollow={() => handleFollow(org.id)}
              onUnfollow={() => handleUnfollow(org.id)}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
});

// ═══════════════════════════════════════════════════════════
// ORGANIZER CARD
// ═══════════════════════════════════════════════════════════
const OrganizerCard = memo(function OrganizerCard({
  org,
  isFollowing,
  isInFlight,
  onFollow,
  onUnfollow,
  index,
}: {
  org: FeedOrganization;
  isFollowing: boolean;
  isInFlight: boolean;
  onFollow: () => void;
  onUnfollow: () => void;
  index: number;
}) {
  const router = useRouter();

  const websiteDomain = org.website
    ? org.website
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .replace(/\/$/, "")
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className="group rounded-2xl border border-[#2C2C2E] bg-[#1C1C1E] overflow-hidden hover:border-[#D4A574]/20 transition-all duration-400 hover:shadow-[0_4px_24px_rgba(212,165,116,0.08)]"
    >
      {/* Logo / Hero Area */}
      <div className="relative aspect-[2/1] bg-gradient-to-br from-[#1C1C1E] to-[#2C2C2E] flex items-center justify-center overflow-hidden">
        {org.logo_url ? (
          <img
            src={org.logo_url}
            alt={org.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Building2
              size={36}
              className="text-neutral-600 group-hover:text-neutral-500 transition-colors"
            />
            <span className="text-xs text-neutral-600">
              {org.name?.charAt(0)?.toUpperCase()}
            </span>
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1E] via-transparent to-transparent opacity-60" />

        {/* Follower count badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm text-xs text-white/80">
          <Star size={11} className={org.follower_count >= 50 ? "text-[#D4A574]" : "text-white/50"} />
          <span className={org.follower_count >= 50 ? "font-semibold text-[#D4A574]" : ""}>
            {org.follower_count ?? 0}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 space-y-3">
        {/* Name */}
        <h3
          className="text-base font-bold tracking-tight line-clamp-1"
          style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
        >
          {org.name}
        </h3>

        {/* Tagline */}
        {org.tagline && (
          <p className="text-xs text-neutral-400 italic line-clamp-2 leading-relaxed">
            &ldquo;{org.tagline}&rdquo;
          </p>
        )}

        {/* Website Link */}
        {websiteDomain && (
          <a
            href={org.website!.startsWith("http") ? org.website! : `https://${org.website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[#D4A574]/80 hover:text-[#D4A574] transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink size={11} />
            <span className="truncate max-w-[180px]">{websiteDomain}</span>
          </a>
        )}

        {/* Follower count text */}
        <p className="text-xs text-neutral-500">
          <span className={org.follower_count >= 50 ? "font-semibold text-neutral-300" : ""}>
            {org.follower_count ?? 0}
          </span>{" "}
          {org.follower_count === 1 ? "Follower" : "Followers"}
        </p>

        {/* Buttons */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              isFollowing ? onUnfollow() : onFollow();
            }}
            disabled={isInFlight}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              isFollowing
                ? "bg-white/[0.06] text-neutral-300 hover:bg-red-500/10 hover:text-red-400 border border-white/[0.08]"
                : "bg-[#D4A574] text-[#0A0A0A] hover:bg-[#B8785C] shadow-[0_2px_8px_rgba(212,165,116,0.2)]"
            } ${isInFlight ? "opacity-60 cursor-not-allowed" : ""}`}
            style={{ fontFamily: "var(--font-display)" }}
          >
            {isInFlight ? (
              <Loader2 size={14} className="animate-spin" />
            ) : isFollowing ? (
              <>
                <UserCheck size={14} />
                Following
              </>
            ) : (
              <>
                <UserPlus size={14} />
                Follow
              </>
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/attendees/events?org=${org.id}`);
            }}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium bg-white/[0.04] text-neutral-400 hover:bg-white/[0.08] hover:text-white border border-white/[0.06] transition-all duration-200"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <ChevronRight size={14} />
            <span className="hidden sm:inline">Events</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
});
