"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSwipeable } from "react-swipeable";
import { Search, ClipboardList, Ticket } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  getMe,
  getAttendeeEvents,
  getRegistrations,
  getTickets,
  Profile,
  ExploreEvent,
  RegistrationItem,
  TicketItem,
} from "@/lib/api";

// ─────────────────────────────────────────────
// MAIN DASHBOARD PAGE
// ─────────────────────────────────────────────
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
      <div className="h-screen flex items-center justify-center text-neutral-400 animate-pulse">
        loading your dashboard...
      </div>
    );
  }

  return (
    <div
      {...swipeHandlers}
      className="min-h-screen bg-gradient-to-b from-[#0b0b0f] via-[#13131a] to-[#0b0b0f] text-white font-satoshi relative overflow-hidden"
    >
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profile}
      />

      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="lg:ml-[240px]">
        <MobileHero
          profile={profile}
          events={events}
          registrations={registrations}
          tickets={tickets}
        />

        <div className="max-w-screen-xl mx-auto px-6 pb-20 mt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {tabLoading ? (
                <p className="text-center text-neutral-400 animate-pulse">
                  fetching data...
                </p>
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
    </div>
  );
}

// ─────────────────────────────────────────────
// SIDEBAR — Desktop
// ─────────────────────────────────────────────
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
    <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[240px] bg-white/[0.03] backdrop-blur-2xl border-r border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.6)] flex-col p-6 z-50">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-16 h-16 rounded-full border border-[#C1FF72]/30 bg-[#C1FF72]/5 shadow-[0_0_20px_rgba(193,255,114,0.15)] flex items-center justify-center text-sm text-[#C1FF72]/70">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          >
            profile
          </motion.div>
        </div>

        <div>
          <p className="text-lg font-semibold capitalize">
            {profile?.fullName}
          </p>
          <p className="text-sm text-neutral-400">{profile?.email}</p>
        </div>
      </div>

      <nav className="flex flex-col gap-3 mt-4">
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
              className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                isActive
                  ? "bg-[#C1FF72]/20 border border-[#C1FF72]/40 text-[#C1FF72]"
                  : "text-neutral-300 hover:bg-white/5"
              }`}
            >
              <Icon size={18} />
              <span className="text-sm">{label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

// ─────────────────────────────────────────────
// MOBILE NAV
// ─────────────────────────────────────────────
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
    <nav className="lg:hidden fixed top-0 left-0 right-0 z-50">
      <div className="relative max-w-md mx-auto">
        <div className="h-[54px] rounded-b-2xl bg-white/[0.04] backdrop-blur-2xl border-b border-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
          <div className="grid grid-cols-3 h-full">
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
                  className={`flex flex-col items-center justify-center text-[11px] tracking-wide ${
                    isActive
                      ? "text-[#C1FF72]"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  <Icon size={18} strokeWidth={1.8} />
                  <span className="mt-0.5">{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="h-[80px]" />
    </nav>
  );
}

// ─────────────────────────────────────────────
// MOBILE HERO
// ─────────────────────────────────────────────
function MobileHero({
  profile,
  events,
  registrations,
  tickets,
}: {
  profile: Profile | null;
  events: ExploreEvent[];
  registrations: RegistrationItem[];
  tickets: TicketItem[];
}) {
  return (
    <section className="lg:hidden relative flex flex-col items-center text-center px-6 pt-24 pb-10">
      <motion.div
        className="relative w-28 h-28 rounded-full border border-[#C1FF72]/40 bg-[#C1FF72]/10 backdrop-blur-xl shadow-[0_0_50px_5px_rgba(193,255,114,0.25)] flex items-center justify-center"
        animate={{
          scale: [1, 1.04, 1],
        }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
      >
        <span className="text-[13px] text-white/70 tracking-wider">profile</span>
      </motion.div>

      <h1 className="text-2xl font-semibold text-white capitalize mt-6">
        {profile?.fullName}
      </h1>
      <p className="text-sm text-neutral-400 mt-1">{profile?.email}</p>

      <div className="mt-6 flex justify-center gap-8 px-5 py-2 rounded-full bg-white/[0.03] backdrop-blur-md border border-white/[0.05]">
        {[
          { label: "Events", value: events.length },
          { label: "Applications", value: registrations.length },
          { label: "Tickets", value: tickets.length },
        ].map(({ label, value }) => (
          <div key={label} className="text-center">
            <div className="text-lg font-semibold text-[#C1FF72]">{value}</div>
            <div className="text-[10px] uppercase text-neutral-400">{label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// EXPLORE TAB — CTA LOGIC FIXED
// ─────────────────────────────────────────────
function ExploreTab({
  events,
}: {
  events: ExploreEvent[];
}) {
  const router = useRouter();

  if (!events.length)
    return (
      <p className="text-center text-neutral-400 mt-10">no events yet.</p>
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {events.map((event) => {
        const r = event.user_relation;

        let ctaLabel = "Get Your Pass";
        let ctaAction = () => router.push(`/attendees/events/${event.id}`);

        if (r?.has_ticket) {
          ctaLabel = "View Ticket";
          ctaAction = () =>
            router.push(`/attendees/tickets/${r.ticket?.id}`);
        } else if (r?.is_registered) {
          ctaLabel = "View Application";
          ctaAction = () =>
            router.push(`/attendees/applications/${r.registration?.id}`);
        }

        // CSS hover keeps this card on the compositor thread; JS-driven hover was causing input lag.
        return (
          <div
            key={event.id}
            className="group rounded-2xl overflow-hidden bg-white/[0.03] backdrop-blur-sm border border-white/10 hover:border-[#C1FF72]/30 hover:shadow-[0_0_30px_rgba(193,255,114,0.1)] transition-all transform-gpu hover:scale-[1.02]"
          >
            <div className="relative h-40 overflow-hidden">
              <img
                src={event.cover || "/event-placeholder.jpg"}
                alt={event.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

              {r?.is_registered && (
                <div className="absolute top-3 right-3 bg-[#C1FF72]/20 border border-[#C1FF72]/40 rounded-full px-3 py-1 text-[10px] uppercase tracking-wide text-[#C1FF72]">
                  Registered
                </div>
              )}
            </div>

            <div className="p-4">
              <h3 className="text-lg font-semibold">{event.name}</h3>
              <p className="text-sm text-neutral-400">
                {event.location || "location TBA"}
              </p>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  ctaAction();
                }}
                className="mt-4 w-full py-2 rounded-xl bg-[#C1FF72]/20 border border-[#C1FF72]/40 text-[#C1FF72] text-sm font-medium hover:bg-[#C1FF72]/30 transition-all"
              >
                {ctaLabel}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
// APPLICATIONS TAB
// ─────────────────────────────────────────────
function ApplicationsTab({
  registrations,
}: {
  registrations: RegistrationItem[];
}) {
  if (!registrations.length)
    return (
      <p className="text-center text-neutral-400 mt-10">
        no applications yet.
      </p>
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {registrations.map((r) => (
        <div
          key={r.registration_airtable_id}
          className="bg-white/[0.05] border border-white/10 rounded-2xl p-5 backdrop-blur-xl hover:border-[#C1FF72]/20 transition-all"
        >
          <h3 className="text-lg font-semibold">{r.event.name}</h3>
          <p className="text-sm text-neutral-400">{r.event.date}</p>
          <p className="text-sm text-neutral-500 capitalize mt-1">
            status: {r.status}
          </p>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// TICKETS TAB
// ─────────────────────────────────────────────
function TicketsTab({ tickets }: { tickets: TicketItem[] }) {
  if (!tickets.length)
    return (
      <p className="text-center text-neutral-400 mt-10">no tickets yet.</p>
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {tickets.map((t) => (
        <div
          key={t.id}
          className="bg-white/[0.05] border border-white/10 rounded-2xl p-5 backdrop-blur-xl hover:border-[#C1FF72]/20 transition-all"
        >
          <h3 className="text-lg font-semibold">{t.event?.name}</h3>
          <p className="text-sm text-neutral-400">{t.event?.date}</p>
          <p className="text-sm text-neutral-500 mt-1">
            Pass: {t.pass_type}
          </p>
        </div>
      ))}
    </div>
  );
}
