"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSwipeable } from "react-swipeable";
import {
  ClipboardList,
  Ticket,
  ChevronRight,
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
  Profile,
  ExploreEvent,
  RegistrationItem,
  TicketItem,
} from "@/lib/api";

// ═══════════════════════════════════════════════════════════
// MAIN DASHBOARD PAGE
// ═══════════════════════════════════════════════════════════
export default function AttendeeDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center bg-[#060606]">
          <div className="w-8 h-8 rounded-full border-2 border-[#C1FF72]/30 border-t-[#C1FF72] animate-spin" />
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

  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const handleCancelRegistration = async (registrationId: string) => {
    const prev = registrations;
    setRegistrations(
      registrations.filter(
        (r) => r.registration_airtable_id !== registrationId
      )
    );
    try {
      await cancelRegistration(registrationId);
      toast.success("Registration cancelled successfully");
    } catch (err: any) {
      setRegistrations(prev);
      toast.error(err.message || "Failed to cancel registration");
    }
  };

  const handleProfileUpdated = (updated: Profile) => {
    setProfile(updated);
  };

  const handleSignOut = () => {
    localStorage.removeItem("whispr_token");
    localStorage.removeItem("token");
    localStorage.removeItem("whispr_role");
    router.push("/auth");
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#060606]">
        <div className="w-8 h-8 rounded-full border-2 border-[#C1FF72]/30 border-t-[#C1FF72] animate-spin" />
      </div>
    );
  }

  const mainEvent = events[0] || null;
  const tabs = [
    { key: "profile" as const, label: "Profile", icon: User },
    { key: "applications" as const, label: "Applications", icon: ClipboardList },
    { key: "tickets" as const, label: "Tickets", icon: Ticket },
  ];

  return (
    <div
      {...swipeHandlers}
      className="min-h-screen bg-[#060606] text-white font-satoshi"
    >
      {/* ─── DESKTOP SIDEBAR ─── */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[240px] flex-col border-r border-white/[0.06] bg-[#060606] z-50">
        <div className="p-6 pb-4">
          <Image
            src="https://whispr-app-storage.s3.eu-north-1.amazonaws.com/events/logotypeface.svg"
            alt="Whispr"
            width={100}
            height={28}
            className="h-6 w-auto opacity-80"
            priority
          />
        </div>

        <nav className="flex-1 px-3 mt-2">
          {tabs.map(({ key, label, icon: Icon }) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm transition-colors ${
                  isActive
                    ? "bg-white/[0.08] text-white font-medium"
                    : "text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.03]"
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Sidebar profile summary */}
        <div className="p-4 mx-3 mb-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-white/[0.08] flex items-center justify-center overflow-hidden flex-shrink-0">
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
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">
                {profile?.fullName || "User"}
              </p>
              <p className="text-[11px] text-neutral-500 truncate">
                {profile?.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs text-neutral-500 hover:text-red-400 hover:bg-red-500/5 transition-colors"
          >
            <LogOut size={13} />
            Sign out
          </button>
        </div>
      </aside>

      {/* ─── MOBILE HEADER ─── */}
      <header className="lg:hidden sticky top-0 z-40 bg-[#060606]/90 backdrop-blur-lg border-b border-white/[0.06]">
        <div className="flex items-center justify-between px-4 h-14">
          <Image
            src="https://whispr-app-storage.s3.eu-north-1.amazonaws.com/events/logotypeface.svg"
            alt="Whispr"
            width={90}
            height={24}
            className="h-5 w-auto opacity-80"
            priority
          />
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
                className="absolute right-3 top-[58px] w-56 rounded-xl border border-white/[0.08] bg-[#0c0c0c] p-2 shadow-2xl z-50"
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
      <div className="lg:ml-[240px]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 lg:pt-10 pb-28 lg:pb-12">
          {/* Welcome + Event */}
          <section className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-1 tracking-tight">
              Welcome back
              {profile?.fullName
                ? `, ${profile.fullName.split(" ")[0]}`
                : ""}
            </h1>
            <p className="text-sm text-neutral-500 mb-6">
              Here&apos;s what&apos;s happening with your events
            </p>

            <HeroEventCard event={mainEvent} />
          </section>

          {/* Tab Bar */}
          <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-6">
            {tabs.map(({ key, label, icon: Icon }) => {
              const isActive = activeTab === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-white/[0.08] text-white"
                      : "text-neutral-500 hover:text-neutral-300"
                  }`}
                >
                  <Icon size={15} strokeWidth={isActive ? 2 : 1.5} />
                  <span className="hidden sm:inline">{label}</span>
                  <span className="sm:hidden">
                    {key === "applications" ? "Apps" : label}
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
              transition={{ duration: 0.25 }}
            >
              {tabLoading ? (
                <div className="flex justify-center py-16">
                  <div className="w-8 h-8 rounded-full border-2 border-[#C1FF72]/20 border-t-[#C1FF72] animate-spin" />
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
                />
              ) : (
                <TicketsTab tickets={tickets} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ─── MOBILE BOTTOM NAV ─── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#060606]/95 backdrop-blur-lg border-t border-white/[0.06] pb-safe">
        <div className="grid grid-cols-3 h-16">
          {tabs.map(({ key, label, icon: Icon }) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                  isActive ? "text-[#C1FF72]" : "text-neutral-600"
                }`}
              >
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
function HeroEventCard({ event }: { event: ExploreEvent | null }) {
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
      <div className="rounded-2xl border border-dashed border-white/[0.08] p-8 text-center">
        <Calendar size={24} className="mx-auto mb-3 text-neutral-600" />
        <p className="text-sm text-neutral-500">No upcoming events</p>
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
      className="group rounded-2xl overflow-hidden border border-white/[0.08] bg-white/[0.02] hover:border-white/[0.15] transition-all cursor-pointer"
      onClick={() => router.push(`/attendees/events/${eventSlug}`)}
    >
      {/* Cover Image */}
      <div className="relative h-40 sm:h-52 overflow-hidden">
        <img
          src={event.cover || "/event-placeholder.jpg"}
          alt={event.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060606] via-[#060606]/40 to-transparent" />

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
            <div className="px-2.5 py-1 rounded-full bg-[#C1FF72]/15 text-[11px] font-medium text-[#C1FF72]">
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
          className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
            r?.has_ticket
              ? "bg-[#C1FF72]/10 text-[#C1FF72] border border-[#C1FF72]/20 hover:bg-[#C1FF72]/15"
              : r?.is_registered
              ? "bg-white/[0.06] text-white border border-white/[0.08] hover:bg-white/[0.1]"
              : "bg-[#C1FF72] text-black hover:brightness-110"
          }`}
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PROFILE TAB
// ═══════════════════════════════════════════════════════════
function ProfileTab({
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
      if (fullName.trim()) form.append("full_name", fullName.trim());
      if (profession) form.append("profession", profession);
      if (company) form.append("company", company);
      if (university) form.append("university", university);
      if (instagramHandle.trim() !== "@")
        form.append("instagram_handle", instagramHandle.trim());
      if (bio.trim()) form.append("bio", bio.trim());
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
    "w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-neutral-600 outline-none transition-all focus:border-[#C1FF72]/40 focus:bg-white/[0.06] hover:bg-white/[0.05]";

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
              <div className="absolute -bottom-0.5 -right-0.5 w-7 h-7 rounded-full bg-[#C1FF72] flex items-center justify-center">
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
            className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
              saving
                ? "bg-white/[0.06] text-neutral-500 cursor-not-allowed"
                : "bg-[#C1FF72] text-black hover:brightness-110"
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
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#C1FF72] bg-[#C1FF72]/10 hover:bg-[#C1FF72]/15 transition-colors"
        >
          <Pencil size={12} />
          Edit
        </button>
      </div>

      {/* Profile card */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6 mb-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-white/[0.06] flex items-center justify-center overflow-hidden flex-shrink-0">
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
            <h3 className="text-xl font-bold">{profile.fullName || "User"}</h3>
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
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] text-xs text-neutral-300 capitalize">
              <Briefcase size={11} className="text-neutral-500" />
              {profile.profession}
            </span>
          )}
          {profile.age && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] text-xs text-neutral-300">
              {profile.age} years old
            </span>
          )}
          {profile.gender && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] text-xs text-neutral-300 capitalize">
              {profile.gender}
            </span>
          )}
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
          <h4 className="text-[11px] text-neutral-500 uppercase tracking-wider mb-3 font-medium">
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

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
          <h4 className="text-[11px] text-neutral-500 uppercase tracking-wider mb-3 font-medium">
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
}

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
      className={`flex items-center gap-2.5 ${hoverable ? "group-hover/ig:text-[#C1FF72]" : ""}`}
    >
      <div className="w-7 h-7 rounded-md bg-white/[0.04] flex items-center justify-center flex-shrink-0">
        <Icon
          size={13}
          className={`text-neutral-500 ${hoverable ? "group-hover/ig:text-[#C1FF72]" : ""} transition-colors`}
        />
      </div>
      <span
        className={`text-sm text-neutral-300 truncate ${capitalize ? "capitalize" : ""} ${hoverable ? "group-hover/ig:text-[#C1FF72]" : ""} transition-colors`}
      >
        {label}
      </span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// APPLICATIONS TAB
// ═══════════════════════════════════════════════════════════
function ApplicationsTab({
  registrations,
  highlightedId,
  onCancel,
}: {
  registrations: RegistrationItem[];
  highlightedId?: string | null;
  onCancel: (registrationId: string) => Promise<void>;
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
        return "text-[#C1FF72] bg-[#C1FF72]/10 border-[#C1FF72]/20";
      case "pending":
        return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      default:
        return "text-red-400 bg-red-500/10 border-red-500/20";
    }
  };

  if (!registrations.length)
    return (
      <div className="text-center py-16">
        <ClipboardList
          size={28}
          className="mx-auto mb-3 text-neutral-600"
        />
        <p className="text-sm text-neutral-500">No applications yet</p>
        <p className="text-xs text-neutral-600 mt-1">
          Apply to events to see them here
        </p>
      </div>
    );

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Applications</h2>

      <div className="space-y-3">
        {registrations.map((r, index) => {
          const isHighlighted =
            highlightedId === r.registration_airtable_id ||
            highlightedId === r.registration_id;

          return (
            <motion.div
              key={r.registration_airtable_id}
              ref={isHighlighted ? highlightedRef : null}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`rounded-2xl border bg-white/[0.02] overflow-hidden transition-all ${
                isHighlighted
                  ? "border-[#C1FF72]/40 ring-1 ring-[#C1FF72]/20"
                  : "border-white/[0.08]"
              }`}
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
                      <h3 className="font-semibold text-sm mb-1 line-clamp-1">
                        {r.event.name || "Untitled Event"}
                      </h3>
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
                          <p className="text-xs font-semibold text-[#C1FF72]">
                            {r.pass.price === 0
                              ? "Free"
                              : `PKR ${r.pass.price.toLocaleString()}`}
                          </p>
                        )}
                    </div>
                  )}

                  {/* Registration code */}
                  <div className="flex items-center justify-between gap-2 py-2.5 px-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                    <div className="min-w-0">
                      <span className="text-[10px] text-neutral-500 uppercase tracking-wider">
                        Code
                      </span>
                      <p className="font-mono text-xs text-[#C1FF72] font-medium truncate">
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
                        <Check size={13} className="text-[#C1FF72]" />
                      ) : (
                        <Copy size={13} className="text-neutral-500" />
                      )}
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleShare(r)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] text-xs font-medium transition-colors"
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
              <div className="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-[#0c0c0c] p-5 shadow-2xl">
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
                    className="flex-1 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] text-sm font-medium transition-all disabled:opacity-50"
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
}

// ═══════════════════════════════════════════════════════════
// TICKETS TAB
// ═══════════════════════════════════════════════════════════
function TicketsTab({ tickets }: { tickets: TicketItem[] }) {
  const router = useRouter();

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
        <Ticket size={28} className="mx-auto mb-3 text-neutral-600" />
        <p className="text-sm text-neutral-500">No tickets yet</p>
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
            className="rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:border-[#C1FF72]/20 transition-all cursor-pointer group"
            onClick={() => router.push(`/attendees/tickets/${t.id}`)}
          >
            <div className="p-4 flex items-center gap-4">
              {/* Ticket icon */}
              <div className="w-12 h-12 rounded-xl bg-[#C1FF72]/10 flex items-center justify-center flex-shrink-0">
                <Ticket
                  size={20}
                  className="text-[#C1FF72] group-hover:scale-110 transition-transform"
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

              <ChevronRight
                size={18}
                className="text-neutral-600 group-hover:text-[#C1FF72] transition-colors flex-shrink-0"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
