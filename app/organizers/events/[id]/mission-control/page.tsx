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
import DiscountCodesTab from "./components/DiscountCodesTab";
import RegistrationQuestionsTab from "./components/RegistrationQuestionsTab";
import {
  getEventRegistrations,
  approveRegistration,
  rejectRegistration,
  getOrganizerEventDetails,
  type OrganizerEventDetails,
} from "@/lib/api";

type EventStatus = "Draft" | "Live" | "Today" | "Ended";
type TabType = "overview" | "approvals" | "attendees" | "discounts" | "questions" | "ops" | "settings";

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
  linked_attendees: LinkedAttendee[];
  created_date: string;
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
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

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

  // Fetch event details
  const fetchEventDetails = useCallback(async () => {
    if (!eventId || !authorized) return;

    setEventLoading(true);
    setEventError(null);

    try {
      const data = await getOrganizerEventDetails(eventId);
      setEventData(data);
    } catch (error: any) {
      console.error("Failed to fetch event details:", error);
      setEventError(error?.response?.data?.message || "Failed to load event details");
    } finally {
      setEventLoading(false);
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
  }, [activeTab, eventId, authorized, statusFilter, searchQuery]);

  const fetchRegistrations = async () => {
    setRegistrationsLoading(true);
    try {
      const data = await getEventRegistrations(eventId, {
        status: statusFilter || undefined,
        search: searchQuery || undefined,
      });
      setRegistrations(data);
    } catch (error) {
      console.error("Failed to fetch registrations:", error);
    } finally {
      setRegistrationsLoading(false);
    }
  };

  const handleApprove = async (registrationId: string) => {
    try {
      await approveRegistration(registrationId);
      fetchRegistrations();
      // Refresh event details to update stats
      fetchEventDetails();
    } catch (error) {
      console.error("Failed to approve registration:", error);
    }
  };

  const handleReject = async (registrationId: string) => {
    try {
      await rejectRegistration(registrationId);
      fetchRegistrations();
      // Refresh event details to update stats
      fetchEventDetails();
    } catch (error) {
      console.error("Failed to reject registration:", error);
    }
  };

  const handleRowClick = (registration: RegistrationListItem) => {
    setSelectedRegistration(registration);
    setDrawerOpen(true);
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
              onClick={fetchEventDetails}
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
            registrations={registrations}
            loading={registrationsLoading}
            onApprove={handleApprove}
            onReject={handleReject}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onRowClick={handleRowClick}
          />
        )}

        {activeTab === "attendees" && (
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-12 text-center">
            <h2 className="text-xl font-medium text-white/90 mb-2">
              Attendees
            </h2>
            <p className="text-white/40 text-sm">
              Attendee management coming soon
            </p>
          </div>
        )}

        {activeTab === "discounts" && (
          <DiscountCodesTab eventId={eventId} />
        )}

        {activeTab === "questions" && (
          <RegistrationQuestionsTab eventId={eventId} />
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
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-12 text-center">
            <h2 className="text-xl font-medium text-white/90 mb-2">
              Settings
            </h2>
            <p className="text-white/40 text-sm">
              Event configuration coming soon
            </p>
          </div>
        )}
      </div>

      {/* Attendee Detail Drawer */}
      <AttendeeDetailDrawer
        isOpen={drawerOpen}
        onClose={handleDrawerClose}
        registrationId={selectedRegistration?.registration_id || null}
        onApprove={handleApprove}
        onReject={handleReject}
        canApprove={selectedRegistration?.actions?.canApprove}
        canReject={selectedRegistration?.actions?.canReject}
      />
    </div>
  );
}
