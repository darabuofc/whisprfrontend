"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
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
    <Suspense fallback={
      <div className="h-screen flex flex-col items-center justify-center bg-[#000000]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#C1FF72] to-[#6C2DFF] opacity-20 animate-pulse" />
          <p className="text-neutral-500 text-sm tracking-wider">Loading your experience...</p>
        </div>
      </div>
    }>
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

  // Handle URL query params for highlighting
  const highlightedAppId = searchParams.get('highlight');
  const tabParam = searchParams.get('tab');

  // Switch tab based on URL params
  useEffect(() => {
    if (highlightedAppId || tabParam === 'applications') {
      setActiveTab('applications');
    } else if (tabParam === 'tickets') {
      setActiveTab('tickets');
    } else if (tabParam === 'profile') {
      setActiveTab('profile');
    }
  }, [highlightedAppId, tabParam]);

  // Parallax scroll effects
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.95]);

  // Swipe Support (Mobile)
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
    trackMouse: true,
  });

  // Fetch profile and events on mount
  useEffect(() => {
    (async () => {
      try {
        const [me, evts] = await Promise.all([getMe(), getAttendeeEvents()]);
        setProfile(me);
        setEvents(evts);
      } catch {
        // Profile fetch failed - likely not authenticated
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Fetch tab-specific data
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
    setRegistrations(registrations.filter(r => r.registration_airtable_id !== registrationId));
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

  const mainEvent = events[0] || null;

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
      <MobileHeader
        profile={profile}
        onEditProfile={() => setActiveTab("profile")}
      />

      <div className="lg:ml-[280px]">
        {/* HERO SECTION */}
        <motion.section
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="relative px-6 lg:px-12 pt-8 pb-6"
        >
          <div className="max-w-7xl mx-auto">
            {/* Welcome Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight whitespace-nowrap">
                <span className="text-neutral-400">Welcome back,</span>{" "}
                <span className="text-white">{profile?.fullName?.split(' ')[0] || 'There'}</span>
              </h1>
            </motion.div>

            {/* Hero Event Card */}
            <HeroEventCard event={mainEvent} />
          </div>
        </motion.section>

        {/* TAB CONTENT */}
        <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-4 pb-24">
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
              ) : activeTab === "profile" ? (
                <ProfileTab profile={profile} onProfileUpdated={handleProfileUpdated} />
              ) : activeTab === "applications" ? (
                <ApplicationsTab registrations={registrations} highlightedId={highlightedAppId} onCancel={handleCancelRegistration} />
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
// HERO EVENT CARD
// ═══════════════════════════════════════════════════════════
function HeroEventCard({ event }: { event: ExploreEvent | null }) {
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

  if (!event) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="rounded-3xl bg-white/[0.02] border border-white/5 p-8 text-center"
      >
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
          <Calendar size={24} className="text-neutral-600" />
        </div>
        <p className="text-neutral-500 text-sm">No upcoming events</p>
      </motion.div>
    );
  }

  const r = event.user_relation;
  const org = event.organization;
  const eventSlug = generateEventSlug(event.name, event.id);

  let ctaLabel = "Get Your Pass";
  let ctaAction = () => router.push(`/attendees/events/${eventSlug}`);

  if (r?.has_ticket) {
    ctaLabel = "View Ticket";
    ctaAction = () => router.push(`/attendees/tickets/${r.ticket?.id}`);
  } else if (r?.is_registered) {
    ctaLabel = "View Application";
    ctaAction = () => router.push(`/attendees/dashboard?tab=applications&highlight=${r.registration?.id}`);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="group rounded-3xl overflow-hidden bg-white/[0.02] border border-white/5 hover:border-[#C1FF72]/30 transition-all cursor-pointer"
      onClick={() => router.push(`/attendees/events/${eventSlug}`)}
    >
      {/* Event Cover */}
      <div className="relative h-48 sm:h-64 overflow-hidden">
        <img
          src={event.cover || "/event-placeholder.jpg"}
          alt={event.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

        {/* Organization Badge */}
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

        {/* Registration Status */}
        {r?.is_registered && (
          <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-[#C1FF72]/20 border border-[#C1FF72]/40 backdrop-blur-md">
            <span className="text-xs text-[#C1FF72] font-medium">Registered</span>
          </div>
        )}

        {/* Bottom info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 group-hover:text-[#C1FF72] transition-colors">
            {event.name}
          </h2>
          <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
            {event.date && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm">
                <Calendar size={13} className="text-[#C1FF72]" />
                <span>{formatEventDate(event.date)}</span>
              </div>
            )}
            {event.location && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm">
                <MapPin size={13} className="text-[#C1FF72]" />
                <span className="line-clamp-1">{event.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="p-6 pt-4">
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

  // Edit form state
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [profession, setProfession] = useState("");
  const [company, setCompany] = useState("");
  const [university, setUniversity] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("@");
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState("");

  // Initialize form fields when entering edit mode
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
      if (instagramHandle.trim() !== "@") form.append("instagram_handle", instagramHandle.trim());
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

  // ─── EDIT MODE ───
  if (isEditing) {
    return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold mb-1">Edit Profile</h2>
            <p className="text-sm text-neutral-500">Update your information</p>
          </div>
          <button
            onClick={cancelEditing}
            className="px-4 py-2 rounded-xl text-sm text-neutral-400 hover:text-white hover:bg-white/5 border border-white/10 transition-all"
          >
            Cancel
          </button>
        </div>

        <div className="max-w-lg mx-auto space-y-6">
          {/* Profile Picture Upload */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center"
          >
            <motion.div
              onClick={() => document.getElementById("editProfilePicInput")?.click()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative w-28 h-28 rounded-full cursor-pointer group"
            >
              {profilePicPreview ? (
                <img
                  src={profilePicPreview}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover border-2 border-[#C1FF72]/50"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-white/[0.07] border-2 border-dashed border-white/20 flex items-center justify-center transition-colors group-hover:border-[#C1FF72]/50">
                  <User size={32} className="text-white/40" />
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#C1FF72] flex items-center justify-center">
                <Camera size={16} className="text-black" />
              </div>
              <input
                id="editProfilePicInput"
                type="file"
                accept="image/*"
                onChange={(e) => handleProfilePic(e.target.files?.[0] || null)}
                className="hidden"
              />
            </motion.div>
            <p className="text-sm text-white/40 mt-3">Tap to change photo</p>
          </motion.div>

          {/* Full Name */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white/60">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              className="w-full px-5 py-4 rounded-2xl bg-white/[0.07] border border-white/[0.08] text-white text-lg placeholder:text-white/30 outline-none transition-all duration-300 focus:bg-white/[0.1] focus:border-[#C1FF72]/50 focus:shadow-[0_0_0_4px_rgba(193,255,114,0.1)] hover:bg-white/[0.09]"
            />
          </div>

          {/* Profession */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white/60">What do you do?</label>
            <select
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-white/[0.07] border border-white/[0.08] text-white text-lg outline-none transition-all duration-300 cursor-pointer appearance-none focus:bg-white/[0.1] focus:border-[#C1FF72]/50 focus:shadow-[0_0_0_4px_rgba(193,255,114,0.1)] hover:bg-white/[0.09]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1rem center',
                backgroundSize: '1.5rem',
              }}
            >
              <option value="" className="bg-[#0a0a0a] text-white">Select your profession</option>
              <option value="student" className="bg-[#0a0a0a] text-white">Student</option>
              <option value="employed" className="bg-[#0a0a0a] text-white">Employed</option>
              <option value="freelancer" className="bg-[#0a0a0a] text-white">Freelancer</option>
              <option value="entrepreneur" className="bg-[#0a0a0a] text-white">Entrepreneur</option>
            </select>
          </div>

          {/* Conditional University / Company */}
          <AnimatePresence>
            {profession === "student" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <label className="block text-sm font-medium text-white/60">University</label>
                <input
                  type="text"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  placeholder="Your university"
                  className="w-full px-5 py-4 rounded-2xl bg-white/[0.07] border border-white/[0.08] text-white text-lg placeholder:text-white/30 outline-none transition-all duration-300 focus:bg-white/[0.1] focus:border-[#C1FF72]/50 focus:shadow-[0_0_0_4px_rgba(193,255,114,0.1)] hover:bg-white/[0.09]"
                />
              </motion.div>
            )}
            {profession === "employed" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <label className="block text-sm font-medium text-white/60">Company</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Your company"
                  className="w-full px-5 py-4 rounded-2xl bg-white/[0.07] border border-white/[0.08] text-white text-lg placeholder:text-white/30 outline-none transition-all duration-300 focus:bg-white/[0.1] focus:border-[#C1FF72]/50 focus:shadow-[0_0_0_4px_rgba(193,255,114,0.1)] hover:bg-white/[0.09]"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Instagram */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white/60">Instagram</label>
            <input
              type="text"
              value={instagramHandle}
              onChange={(e) => handleInstagramChange(e.target.value)}
              placeholder="@yourhandle"
              className="w-full px-5 py-4 rounded-2xl bg-white/[0.07] border border-white/[0.08] text-white text-lg placeholder:text-white/30 outline-none transition-all duration-300 focus:bg-white/[0.1] focus:border-[#C1FF72]/50 focus:shadow-[0_0_0_4px_rgba(193,255,114,0.1)] hover:bg-white/[0.09]"
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white/60">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us a little about yourself..."
              rows={3}
              className="w-full px-5 py-4 rounded-2xl bg-white/[0.07] border border-white/[0.08] text-white text-lg placeholder:text-white/30 outline-none transition-all duration-300 resize-none focus:bg-white/[0.1] focus:border-[#C1FF72]/50 focus:shadow-[0_0_0_4px_rgba(193,255,114,0.1)] hover:bg-white/[0.09]"
            />
          </div>

          {/* Save Button */}
          <motion.button
            whileHover={{ scale: saving ? 1 : 1.02 }}
            whileTap={{ scale: saving ? 1 : 0.98 }}
            onClick={handleSave}
            disabled={saving}
            className={`w-full py-4 px-8 rounded-2xl text-lg font-semibold transition-all duration-300 ${
              saving
                ? 'bg-white/10 text-white/40 cursor-not-allowed'
                : 'bg-[#C1FF72] text-black shadow-[0_0_40px_rgba(193,255,114,0.3)] hover:shadow-[0_0_60px_rgba(193,255,114,0.4)]'
            }`}
          >
            {saving ? (
              <Loader2 size={24} className="mx-auto animate-spin" />
            ) : (
              "Save Changes"
            )}
          </motion.button>
        </div>
      </div>
    );
  }

  // ─── READ-ONLY VIEW ───
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold mb-1">My Profile</h2>
          <p className="text-sm text-neutral-500">Your personal information</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startEditing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-[#C1FF72]/10 text-[#C1FF72] border border-[#C1FF72]/30 hover:bg-[#C1FF72]/20 transition-all"
        >
          <Pencil size={14} />
          Edit Profile
        </motion.button>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-3xl bg-white/[0.02] border border-white/5 p-6 sm:p-8 mb-6"
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-[#C1FF72]/20 to-[#6C2DFF]/20 border-2 border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
              {profile.profilePicture ? (
                <img
                  src={profile.profilePicture}
                  alt={profile.fullName || 'Profile'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-white/70">
                  {profile.fullName?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              )}
            </div>

            {/* Name & Quick Info */}
            <div className="text-center sm:text-left flex-1 min-w-0">
              <h3 className="text-2xl font-bold mb-1">{profile.fullName || 'User'}</h3>
              {profile.bio && (
                <p className="text-sm text-neutral-400 mb-3 line-clamp-2">{profile.bio}</p>
              )}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                {profile.profession && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 text-xs text-neutral-300 capitalize">
                    <Briefcase size={12} className="text-[#C1FF72]" />
                    {profile.profession}
                  </span>
                )}
                {profile.age && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 text-xs text-neutral-300">
                    {profile.age} years old
                  </span>
                )}
                {profile.gender && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 text-xs text-neutral-300 capitalize">
                    {profile.gender}
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Details Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-2xl bg-white/[0.02] border border-white/5 p-5"
          >
            <h4 className="text-xs text-neutral-500 uppercase tracking-wider mb-4 font-medium">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Mail size={14} className="text-neutral-400" />
                </div>
                <span className="text-sm text-neutral-300 truncate">{profile.email}</span>
              </div>
              {profile.registeredNumber && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                    <Phone size={14} className="text-neutral-400" />
                  </div>
                  <span className="text-sm text-neutral-300">{profile.registeredNumber}</span>
                </div>
              )}
              {profile.instagramHandle && (
                <a
                  href={`https://instagram.com/${profile.instagramHandle.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 group/ig"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                    <Instagram size={14} className="text-neutral-400 group-hover/ig:text-[#C1FF72] transition-colors" />
                  </div>
                  <span className="text-sm text-neutral-300 group-hover/ig:text-[#C1FF72] transition-colors">
                    {profile.instagramHandle.startsWith('@') ? profile.instagramHandle : `@${profile.instagramHandle}`}
                  </span>
                </a>
              )}
            </div>
          </motion.div>

          {/* Professional Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="rounded-2xl bg-white/[0.02] border border-white/5 p-5"
          >
            <h4 className="text-xs text-neutral-500 uppercase tracking-wider mb-4 font-medium">Details</h4>
            <div className="space-y-3">
              {profile.profession && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                    <Briefcase size={14} className="text-neutral-400" />
                  </div>
                  <span className="text-sm text-neutral-300 capitalize">{profile.profession}</span>
                </div>
              )}
              {profile.company && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                    <Building2 size={14} className="text-neutral-400" />
                  </div>
                  <span className="text-sm text-neutral-300">{profile.company}</span>
                </div>
              )}
              {profile.university && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                    <GraduationCap size={14} className="text-neutral-400" />
                  </div>
                  <span className="text-sm text-neutral-300">{profile.university}</span>
                </div>
              )}
              {!profile.profession && !profile.company && !profile.university && (
                <p className="text-sm text-neutral-600">No details added yet</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
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
  activeTab: "profile" | "applications" | "tickets";
  setActiveTab: React.Dispatch<
    React.SetStateAction<"profile" | "applications" | "tickets">
  >;
  profile: Profile | null;
}) {
  return (
    <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[280px] bg-black/40 backdrop-blur-2xl border-r border-white/5 flex-col p-8 z-50">
      {/* Logo / Brand */}
      <div className="mb-12">
        <Image
          src="https://whispr-app-storage.s3.eu-north-1.amazonaws.com/events/logotypeface.svg"
          alt="Whispr"
          width={120}
          height={32}
          className="h-8 w-auto"
          priority
        />
        <p className="text-xs text-neutral-500 mt-2 tracking-wider uppercase">Underground</p>
      </div>

      {/* Profile Section */}
      <button
        onClick={() => setActiveTab("profile")}
        className="mb-10 text-left group"
      >
        <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-[#C1FF72]/20 to-[#6C2DFF]/20 border border-white/10 flex items-center justify-center mb-4 overflow-hidden">
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
        <h2 className="text-lg font-semibold mb-1 group-hover:text-[#C1FF72] transition-colors">
          {profile?.fullName}
        </h2>
        <p className="text-sm text-neutral-500">{profile?.email}</p>
      </button>

      {/* Navigation */}
      <nav className="flex-1">
        <p className="text-xs text-neutral-600 uppercase tracking-wider mb-4 font-medium">
          Navigation
        </p>
        <div className="flex flex-col gap-2">
          {[
            { key: "profile", label: "Profile", icon: User },
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
          &copy; 2026 whispr underground
        </p>
      </div>
    </aside>
  );
}

// ═══════════════════════════════════════════════════════════
// MOBILE HEADER
// ═══════════════════════════════════════════════════════════
function MobileHeader({
  profile,
  onEditProfile,
}: {
  profile: Profile | null;
  onEditProfile: () => void;
}) {
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
              <Image
                src="https://whispr-app-storage.s3.eu-north-1.amazonaws.com/events/logotypeface.svg"
                alt="Whispr"
                width={100}
                height={28}
                className="relative h-7 w-auto"
                priority
              />
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

              {/* Edit Profile */}
              <button
                onClick={() => {
                  setShowMenu(false);
                  onEditProfile();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/70 hover:bg-white/5 hover:text-[#C1FF72] transition-colors mb-1"
              >
                <Pencil size={18} />
                <span>Edit Profile</span>
              </button>

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
  activeTab: "profile" | "applications" | "tickets";
  setActiveTab: React.Dispatch<
    React.SetStateAction<"profile" | "applications" | "tickets">
  >;
}) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="mx-4 mb-4 rounded-3xl bg-black/80 backdrop-blur-2xl border border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="grid grid-cols-3 p-2">
          {[
            { key: "profile", label: "Profile", icon: User },
            { key: "applications", label: "Applications", icon: ClipboardList },
            { key: "tickets", label: "Tickets", icon: Ticket },
          ].map(({ key, label, icon: Icon }) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() =>
                  setActiveTab(key as "profile" | "applications" | "tickets")
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

  // Scroll to highlighted application
  useEffect(() => {
    if (highlightedId && highlightedRef.current) {
      highlightedRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
    const shareUrl = r.share_link || (typeof window !== 'undefined' ? window.location.origin : '');

    if (navigator.share) {
      try {
        await navigator.share({
          title: r.event.name || 'Event Registration',
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // User cancelled or error
      }
    } else {
      // Fallback to WhatsApp
      window.open(
        `https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`,
        '_blank'
      );
    }
  };

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
        {registrations.map((r, index) => {
          const isHighlighted = highlightedId === r.registration_airtable_id || highlightedId === r.registration_id;

          return (
            <motion.div
              key={r.registration_airtable_id}
              ref={isHighlighted ? highlightedRef : null}
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: isHighlighted ? [1, 1.02, 1] : 1,
              }}
              transition={{
                duration: 0.4,
                delay: index * 0.1,
                scale: { duration: 0.6, repeat: isHighlighted ? 2 : 0 }
              }}
              className={`rounded-3xl overflow-hidden bg-white/[0.02] border transition-all ${
                isHighlighted
                  ? 'border-[#C1FF72]/50 ring-2 ring-[#C1FF72]/20'
                  : 'border-white/5 hover:border-white/10'
              }`}
            >
              {/* Event Cover Image */}
              {r.event.cover && (
                <div className="relative h-32 overflow-hidden">
                  <img
                    src={r.event.cover}
                    alt={r.event.name || 'Event'}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  {/* Status Badge on Image */}
                  <div className="absolute top-3 right-3">
                    <div className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize backdrop-blur-md ${
                      r.status === 'approved'
                        ? 'bg-[#C1FF72]/20 text-[#C1FF72] border border-[#C1FF72]/40'
                        : r.status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40'
                        : 'bg-red-500/20 text-red-400 border border-red-500/40'
                    }`}>
                      {r.status}
                    </div>
                  </div>
                </div>
              )}

              <div className="p-5">
                {/* Header - Event Name & Status (if no cover) */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold mb-2 line-clamp-1">{r.event.name || 'Untitled Event'}</h3>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-[#C1FF72]" />
                        <span>{formatEventDate(r.event.date)}</span>
                      </div>
                      {r.event.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin size={13} className="text-[#C1FF72]" />
                          <span className="line-clamp-1">{r.event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Status badge if no cover image */}
                  {!r.event.cover && (
                    <div className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium capitalize ${
                      r.status === 'approved'
                        ? 'bg-[#C1FF72]/20 text-[#C1FF72] border border-[#C1FF72]/40'
                        : r.status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40'
                        : 'bg-red-500/20 text-red-400 border border-red-500/40'
                    }`}>
                      {r.status}
                    </div>
                  )}
                </div>

                {/* Pass Type & Price */}
                {r.gender_mismatch && (
                  <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] font-medium text-amber-300">
                    <AlertTriangle size={12} />
                    Gender mismatch
                  </div>
                )}
                {r.pass?.type && (
                  <div className="flex items-center justify-between py-3 border-t border-white/5">
                    <div>
                      <p className="text-xs text-neutral-500 uppercase tracking-wider">Pass Type</p>
                      <p className="text-sm font-medium mt-0.5">{r.pass.type}</p>
                    </div>
                    {r.pass.price !== null && r.pass.price !== undefined && (
                      <div className="text-right">
                        <p className="text-xs text-neutral-500 uppercase tracking-wider">Price</p>
                        <p className="text-sm font-semibold text-[#C1FF72] mt-0.5">
                          {r.pass.price === 0 ? 'Free' : `PKR ${r.pass.price.toLocaleString()}`}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Registration Code */}
                <div className="mt-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Registration Code</p>
                      <p className="font-mono text-sm text-[#C1FF72] font-medium">{r.registration_id}</p>
                    </div>
                    <button
                      onClick={() => handleCopyCode(r.registration_id, r.registration_airtable_id)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                      title="Copy code"
                    >
                      {copiedId === r.registration_airtable_id ? (
                        <motion.span
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          className="text-[#C1FF72] text-xs font-medium"
                        >
                          Copied!
                        </motion.span>
                      ) : (
                        <Copy size={14} className="text-neutral-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Share Button */}
                <button
                  onClick={() => handleShare(r)}
                  className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium transition-all hover:border-[#C1FF72]/30"
                >
                  <Share2 size={14} />
                  Share Registration
                </button>

                {/* Cancel Button */}
                {canCancel(r.status) && (
                  <button
                    onClick={() => setCancelConfirmId(r.registration_airtable_id)}
                    className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
                  >
                    <XCircle size={14} />
                    Cancel Registration
                  </button>
                )}
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
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
              onClick={() => !cancelling && setCancelConfirmId(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                    <XCircle size={20} className="text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold">Cancel Registration</h3>
                </div>
                <p className="text-sm text-neutral-400 mb-6">
                  Are you sure you want to cancel this registration? You can re-register afterwards if you'd like.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setCancelConfirmId(null)}
                    disabled={cancelling}
                    className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium transition-all disabled:opacity-50"
                  >
                    Keep It
                  </button>
                  <button
                    onClick={handleConfirmCancel}
                    disabled={cancelling}
                    className="flex-1 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-sm font-medium text-red-400 transition-all disabled:opacity-50"
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
