"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import EventHeader from "./components/EventHeader";
import HealthStrip from "./components/HealthStrip";
import Tabs from "./components/Tabs";
import OpsSummaryCard from "./components/OpsSummaryCard";
import AlertsPanel from "./components/AlertsPanel";
import ActivityFeed from "./components/ActivityFeed";
import ApprovalsTable from "./components/ApprovalsTable";
import AttendeeDetailDrawer from "./components/AttendeeDetailDrawer";
import SettingsTab from "./components/SettingsTab";
import TicketsTable from "./components/TicketsTable";
import ImportAttendeesModal from "./components/ImportAttendeesModal";
import {
  getEventRegistrations,
  approveRegistration,
  rejectRegistration,
  revokeRegistration,
  cancelOrganizerRegistration,
  markRegistrationPaid,
  getOrganizerEventDetails,
  getOrganizerEventTickets,
  resendOrganizerEventTicket,
  getOrganizer,
  type OrganizerEventDetails,
  type OrganizerTicket,
  type OrganizerTicketsSummary,
} from "@/lib/api";
import { toast } from "sonner";

type EventStatus = "Draft" | "Live" | "Today" | "Ended";
type TabType = "overview" | "approvals" | "tickets" | "ops" | "settings";

export interface LinkedAttendee {
  id: string;
  name: string;
  email: string;
  whatsapp?: string;
  cnic?: string;
  instagram?: string;
  profile_picture?: string;
}

export interface RegistrationListItem {
  registration_id: string;
  status: string;
  name: string;
  type: string;
  price: number | null;
  profile_picture?: string;
  linked_attendees: LinkedAttendee[];
  created_date: string;
  is_complete: boolean;
  gender_mismatch?: boolean;
  actions: {
    canApprove: boolean;
    canReject: boolean;
  };
}

function parseEventStatus(status: string, date: string | null): EventStatus {
  if (!status) return "Draft";

  const normalizedStatus = status.toLowerCase();
  if (normalizedStatus === "draft") return "Draft";
  if (normalizedStatus === "ended" || normalizedStatus === "completed") return "Ended";

  // Check if event is today
  if (date) {
    const eventDate = new Date(date);
    const today = new Date();
    const isToday =
      eventDate.getFullYear() === today.getFullYear() &&
      eventDate.getMonth() === today.getMonth() &&
      eventDate.getDate() === today.getDate();
    if (isToday && (normalizedStatus === "live" || normalizedStatus === "published")) {
      return "Today";
    }
  }

  if (normalizedStatus === "live" || normalizedStatus === "published") return "Live";
  return "Draft";
}

function formatEventDate(dateString: string | null): string {
  if (!dateString) return "Date TBD";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

function calculateDaysLeft(dateString: string | null): number {
  if (!dateString) return 0;
  try {
    const eventDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  } catch {
    return 0;
  }
}

export default function MissionControlPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;

  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  // Event data state
  const [eventData, setEventData] = useState<OrganizerEventDetails | null>(null);
  const [eventLoading, setEventLoading] = useState(true);
  const [eventError, setEventError] = useState<string | null>(null);

  // Approvals state
  const [registrations, setRegistrations] = useState<RegistrationListItem[]>([]);
  const [registrationsLoading, setRegistrationsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [genderMismatchOnly, setGenderMismatchOnly] = useState(false);

  // Tickets state
  const [tickets, setTickets] = useState<OrganizerTicket[]>([]);
  const [ticketsSummary, setTicketsSummary] = useState<OrganizerTicketsSummary>({
    total: 0,
    by_status: {},
    by_pass_type: {},
  });
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketStatusFilter, setTicketStatusFilter] = useState<string[]>([]);
  const [ticketPassTypeFilter, setTicketPassTypeFilter] = useState<string[]>([]);
  const [ticketSearchQuery, setTicketSearchQuery] = useState<string>("");
  const [passTypes, setPassTypes] = useState<{ id: string; name: string }[]>([]);

  // Import modal state
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [organizerId, setOrganizerId] = useState<string>("");

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<RegistrationListItem | null>(null);

  // Auth gate
  useEffect(() => {
    const token =
      localStorage.getItem("whispr_token") || localStorage.getItem("token");
    const role = localStorage.getItem("whispr_role");

    if (!token) {
      router.replace("/auth?role=organizer");
      return;
    }

    if (role && role !== "organizer") {
      router.replace(role === "attendee" ? "/attendees/dashboard" : "/auth");
      return;
    }

    setAuthorized(true);
    setLoading(false);
  }, [router]);

  // Fetch organizer info for import functionality
  useEffect(() => {
    if (authorized) {
      getOrganizer()
        .then((org) => {
          if (org?.id) {
            setOrganizerId(org.id);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch organizer:", err);
        });
    }
  }, [authorized]);

  // Fetch event details (silent=true skips loading skeleton, used after actions)
  const fetchEventDetails = useCallback(async (silent = false) => {
    if (!eventId || !authorized) return;

    if (!silent) {
      setEventLoading(true);
      setEventError(null);
    }

    try {
      const data = await getOrganizerEventDetails(eventId);
      setEventData(data);
    } catch (error: any) {
      if (!silent) {
        console.error("Failed to fetch event details:", error);
        setEventError(error?.response?.data?.message || "Failed to load event details");
      }
    } finally {
      if (!silent) {
        setEventLoading(false);
      }
    }
  }, [eventId, authorized]);

  useEffect(() => {
    fetchEventDetails();
  }, [fetchEventDetails]);

  // Fetch registrations when approvals tab is active
  useEffect(() => {
    if (activeTab === "approvals" && eventId && authorized) {
      fetchRegistrations();
    }
  }, [activeTab, eventId, authorized]);

  const fetchRegistrations = async () => {
    setRegistrationsLoading(true);
    try {
      const data = await getEventRegistrations(eventId);
      setRegistrations(data);
    } catch (error) {
      console.error("Failed to fetch registrations:", error);
    } finally {
      setRegistrationsLoading(false);
    }
  };

  // Fetch tickets when tickets tab is active
  useEffect(() => {
    if (activeTab === "tickets" && eventId && authorized) {
      fetchTickets();
    }
  }, [activeTab, eventId, authorized]);

  const fetchTickets = async () => {
    setTicketsLoading(true);
    try {
      const data = await getOrganizerEventTickets(eventId);
      setTickets(data.tickets);
      setTicketsSummary(data.summary);

      // Extract unique pass types for the filter dropdown
      const uniquePassTypes = new Map<string, string>();
      data.tickets.forEach((ticket) => {
        const passTypeLabel = ticket.pass_type?.type || ticket.pass_type?.name;
        if (ticket.pass_type?.id && passTypeLabel) {
          uniquePassTypes.set(ticket.pass_type.id, passTypeLabel);
        }
      });
      setPassTypes(
        Array.from(uniquePassTypes.entries()).map(([id, name]) => ({ id, name }))
      );
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    } finally {
      setTicketsLoading(false);
    }
  };

  // Optimistic update helper: update a registration's status locally
  const optimisticStatusUpdate = (registrationId: string, newStatus: string) => {
    setRegistrations((prev) =>
      prev.map((r) =>
        r.registration_id === registrationId ? { ...r, status: newStatus } : r
      )
    );
    // Also update the selected registration if the drawer is showing it
    setSelectedRegistration((prev) =>
      prev && prev.registration_id === registrationId
        ? { ...prev, status: newStatus }
        : prev
    );
  };

  const handleApprove = async (registrationId: string) => {
    const prev = registrations.find((r) => r.registration_id === registrationId);
    optimisticStatusUpdate(registrationId, "approved");
    try {
      await approveRegistration(registrationId);
      toast.success("Registration approved");
      fetchEventDetails(true);
    } catch (error) {
      console.error("Failed to approve registration:", error);
      if (prev) optimisticStatusUpdate(registrationId, prev.status);
      toast.error("Failed to approve registration");
    }
  };

  const handleReject = async (registrationId: string) => {
    const prev = registrations.find((r) => r.registration_id === registrationId);
    optimisticStatusUpdate(registrationId, "rejected");
    try {
      await rejectRegistration(registrationId);
      toast.success("Registration rejected");
      fetchEventDetails(true);
    } catch (error) {
      console.error("Failed to reject registration:", error);
      if (prev) optimisticStatusUpdate(registrationId, prev.status);
      toast.error("Failed to reject registration");
    }
  };

  const handleRevoke = async (registrationId: string) => {
    const prev = registrations.find((r) => r.registration_id === registrationId);
    optimisticStatusUpdate(registrationId, "pending");
    try {
      await revokeRegistration(registrationId);
      toast.success("Registration revoked — moved back to pending");
      fetchEventDetails(true);
    } catch (error) {
      console.error("Failed to revoke registration:", error);
      if (prev) optimisticStatusUpdate(registrationId, prev.status);
      toast.error("Failed to revoke registration");
    }
  };

  const handleMarkPaid = async (registrationId: string) => {
    const prev = registrations.find((r) => r.registration_id === registrationId);
    optimisticStatusUpdate(registrationId, "paid");
    try {
      await markRegistrationPaid(registrationId);
      toast.success("Registration marked as paid");
      fetchEventDetails(true);
    } catch (error) {
      console.error("Failed to mark registration as paid:", error);
      if (prev) optimisticStatusUpdate(registrationId, prev.status);
      toast.error("Failed to mark as paid");
    }
  };

  const handleCancelRegistration = async (registrationId: string) => {
    const prev = registrations.find((r) => r.registration_id === registrationId);
    optimisticStatusUpdate(registrationId, "cancelled");
    try {
      await cancelOrganizerRegistration(registrationId);
      toast.success("Registration cancelled");
      fetchEventDetails(true);
    } catch (error: any) {
      console.error("Failed to cancel registration:", error);
      if (prev) optimisticStatusUpdate(registrationId, prev.status);
      toast.error(error?.message || "Failed to cancel registration");
    }
  };

  const handleRowClick = (registration: RegistrationListItem) => {
    setSelectedRegistration(registration);
    setDrawerOpen(true);
  };

  const handleResendTicket = async (ticketId: string) => {
    try {
      const res = await resendOrganizerEventTicket(eventId, ticketId);
      toast.success(res.message || "Ticket resent successfully");
    } catch (error: any) {
      console.error("Failed to resend ticket:", error);
      toast.error(error?.response?.data?.message || "Failed to resend ticket");
    }
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setSelectedRegistration(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-white/10 border-t-white/60 animate-spin" />
          <div className="text-white/60 text-sm font-medium">Loading...</div>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  // Derive display values from event data
  const eventStatus = eventData
    ? parseEventStatus(eventData.status, eventData.date)
    : "Draft";
  const isToday = eventStatus === "Today";
  const daysLeft = eventData ? calculateDaysLeft(eventData.date) : 0;

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const visibleRegistrations = registrations.filter((registration) => {
    if (genderMismatchOnly && !registration.gender_mismatch) return false;
    if (statusFilter.length > 0) {
      const normalizedStatus = (registration.status || "").toLowerCase();
      if (!statusFilter.includes(normalizedStatus)) return false;
    }
    if (!normalizedSearch) return true;
    const primaryMatch = (registration.name || "").toLowerCase().includes(normalizedSearch);
    const linkedMatch = (registration.linked_attendees || []).some((attendee) =>
      (attendee.name || "").toLowerCase().includes(normalizedSearch)
    );
    return primaryMatch || linkedMatch;
  });

  const normalizedTicketSearch = ticketSearchQuery.trim().toLowerCase();
  const visibleTickets = tickets
    .filter((ticket) => {
      if (ticketStatusFilter.length > 0) {
        const normalizedStatus = (ticket.status || "").toLowerCase();
        if (!ticketStatusFilter.includes(normalizedStatus)) return false;
      }
      if (ticketPassTypeFilter.length > 0) {
        const passId = ticket.pass_type?.id;
        if (!passId || !ticketPassTypeFilter.includes(passId)) return false;
      }
      if (!normalizedTicketSearch) return true;
      const attendee = ticket.attendee || { name: "", email: "", phone: "" };
      return (
        (attendee.name || "").toLowerCase().includes(normalizedTicketSearch) ||
        (attendee.email || "").toLowerCase().includes(normalizedTicketSearch) ||
        (attendee.phone || "").toLowerCase().includes(normalizedTicketSearch)
      );
    })
    .sort((a, b) =>
      (a.registration?.registration_id || "").localeCompare(
        b.registration?.registration_id || "",
        undefined,
        { numeric: true, sensitivity: "base" }
      )
    );

  const displayStats = {
    approved: eventData?.stats.approved ?? 0,
    pending: eventData?.stats.pending ?? 0,
    rejected: eventData?.stats.rejected ?? 0,
    checkedIn: eventData?.stats.checked_in ?? 0,
    daysLeft,
  };

  const opsData = {
    pendingApprovals: displayStats.pending,
    avgApprovalTime: "—",
  };

  // Handler functions
  const handleBack = () => {
    router.push("/organizers/dashboard");
  };

  const handlePublish = () => {
    console.log("Publishing event...");
  };

  const handlePause = () => {
    console.log("Pausing event...");
  };

  const handleShare = () => {
    console.log("Sharing event...");
  };

  const handleEdit = () => {
    router.push(`/organizers/events/${eventId}/edit`);
  };

  const handleDuplicate = () => {
    console.log("Duplicating event...");
  };

  const handleCancel = () => {
    console.log("Canceling event...");
  };

  const handleGoToApprovals = () => {
    setActiveTab("approvals");
  };

  const handleFixAlert = (alertId: number) => {
    console.log("Fixing alert:", alertId);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  // Generate alerts based on real data
  const alerts = displayStats.pending > 5
    ? [{ id: 1, text: `${displayStats.pending} registrations pending approval` }]
    : [];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Subtle gradient background - static, no animation */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#0a0a0a] to-[#0d0d12]" />
        <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-gradient-radial from-white/[0.02] to-transparent opacity-60" />
      </div>

      {/* Event Header */}
      {eventLoading ? (
        <div className="sticky top-0 z-40 bg-[#0a0a0a]/90 backdrop-blur-lg border-b border-white/[0.06]">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="flex items-center gap-4">
              <div className="h-8 w-64 bg-white/5 rounded-lg animate-pulse" />
              <div className="h-6 w-16 bg-white/5 rounded-full animate-pulse" />
            </div>
            <div className="flex items-center gap-3 mt-3">
              <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-20 bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-32 bg-white/5 rounded animate-pulse" />
            </div>
          </div>
        </div>
      ) : eventError ? (
        <div className="sticky top-0 z-40 bg-[#0a0a0a]/90 backdrop-blur-lg border-b border-white/[0.06]">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="text-red-400 text-sm">{eventError}</div>
            <button
              onClick={() => fetchEventDetails()}
              className="mt-2 text-sm text-white/60 hover:text-white transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      ) : (
        <EventHeader
          name={eventData?.name ?? "Untitled Event"}
          status={eventStatus}
          date={formatEventDate(eventData?.date ?? null)}
          time={eventData?.time ?? "Time TBD"}
          venue={eventData?.venue ?? "Venue TBD"}
          onBack={handleBack}
          onPublish={handlePublish}
          onPause={handlePause}
          onShare={handleShare}
          onEdit={handleEdit}
          onDuplicate={handleDuplicate}
          onCancel={handleCancel}
        />
      )}

      {/* Health Strip */}
      <HealthStrip stats={displayStats} isToday={isToday} loading={eventLoading} />

      {/* Tabs */}
      <Tabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isToday={isToday}
      />

      {/* Tab Content */}
      <div className="max-w-6xl mx-auto px-6 py-10 relative z-10">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <OpsSummaryCard
                ops={opsData}
                onGoToApprovals={handleGoToApprovals}
              />
              {alerts.length > 0 && (
                <AlertsPanel alerts={alerts} onFix={handleFixAlert} />
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <ActivityFeed activities={[]} />
            </div>
          </div>
        )}

        {activeTab === "approvals" && (
          <ApprovalsTable
            registrations={visibleRegistrations}
            loading={registrationsLoading}
            onApprove={handleApprove}
            onReject={handleReject}
            onRevoke={handleRevoke}
            onCancel={handleCancelRegistration}
            onMarkPaid={handleMarkPaid}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            genderMismatchOnly={genderMismatchOnly}
            onGenderMismatchOnlyChange={setGenderMismatchOnly}
            onRowClick={handleRowClick}
          />
        )}

        {activeTab === "tickets" && (
          <TicketsTable
            tickets={visibleTickets}
            summary={ticketsSummary}
            loading={ticketsLoading}
            statusFilter={ticketStatusFilter}
            onStatusFilterChange={setTicketStatusFilter}
            passTypeFilter={ticketPassTypeFilter}
            onPassTypeFilterChange={setTicketPassTypeFilter}
            searchQuery={ticketSearchQuery}
            onSearchChange={setTicketSearchQuery}
            passTypes={passTypes}
            onImportClick={() => setImportModalOpen(true)}
            onResendTicket={handleResendTicket}
          />
        )}

        {activeTab === "ops" && (
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-12 text-center">
            <h2 className="text-xl font-medium text-white/90 mb-2">Ops Mode</h2>
            <p className="text-white/40 text-sm">
              Live operations dashboard for event day
            </p>
          </div>
        )}

        {activeTab === "settings" && (
          <SettingsTab eventId={eventId} />
        )}
      </div>

      {/* Attendee Detail Drawer */}
      <AttendeeDetailDrawer
        isOpen={drawerOpen}
        onClose={handleDrawerClose}
        registrationId={selectedRegistration?.registration_id || null}
        registrationStatus={selectedRegistration?.status || null}
        isComplete={selectedRegistration?.is_complete}
        onApprove={handleApprove}
        onReject={handleReject}
        onRevoke={handleRevoke}
        onMarkPaid={handleMarkPaid}
      />

      {/* Import Attendees Modal */}
      <ImportAttendeesModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        organizerId={organizerId}
        eventId={eventId}
        passTypes={passTypes}
        onImportComplete={() => {
          fetchTickets();
          fetchEventDetails();
        }}
      />
    </div>
  );
}
