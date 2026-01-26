"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import EventHeader from "./components/EventHeader";
import HealthStrip from "./components/HealthStrip";
import Tabs from "./components/Tabs";
import OpsSummaryCard from "./components/OpsSummaryCard";
import AlertsPanel from "./components/AlertsPanel";
import ActivityFeed from "./components/ActivityFeed";
import ApprovalsTable from "./components/ApprovalsTable";
import { getEventRegistrations, approveRegistration, rejectRegistration } from "@/lib/api";

type EventStatus = "Draft" | "Live" | "Today" | "Ended";
type TabType = "overview" | "approvals" | "attendees" | "ops" | "settings";

// Mock data for overview
const mockData = {
  event: {
    name: "GATR Winter Fest",
    status: "Live" as EventStatus,
    date: "Feb 14, 2026",
    time: "7:00 PM",
    venue: "Port Grand, Karachi",
  },
  stats: {
    approved: 342,
    pending: 7,
    rejected: 12,
    checkedIn: 0,
    daysLeft: 12,
  },
  ops: {
    pendingApprovals: 7,
    avgApprovalTime: "3 min",
  },
  alerts: [{ id: 1, text: "5 registrations pending > 15 minutes" }],
  activity: [
    {
      id: 1,
      type: "submission" as const,
      text: "Ali submitted registration",
      timestamp: "2 min ago",
    },
    {
      id: 2,
      type: "approval" as const,
      text: "You approved Sara",
      timestamp: "5 min ago",
    },
    {
      id: 3,
      type: "checkin" as const,
      text: "2 people checked in",
      timestamp: "12 min ago",
    },
    {
      id: 4,
      type: "rejection" as const,
      text: "Ahmed was rejected",
      timestamp: "18 min ago",
    },
  ],
};

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

export default function MissionControlPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;

  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  // Approvals state
  const [registrations, setRegistrations] = useState<RegistrationListItem[]>([]);
  const [registrationsLoading, setRegistrationsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

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
    } catch (error) {
      console.error("Failed to approve registration:", error);
    }
  };

  const handleReject = async (registrationId: string) => {
    try {
      await rejectRegistration(registrationId);
      fetchRegistrations();
    } catch (error) {
      console.error("Failed to reject registration:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-whispr-bg flex items-center justify-center">
        <div className="mesh-bg">
          <div className="mesh-layer" />
          <div className="mesh-noise" />
        </div>
        <div className="flex flex-col items-center gap-4 relative z-10">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-whispr-accent animate-spin" />
            <div className="absolute inset-0 w-16 h-16 rounded-full bg-whispr-accent/20 animate-pulse" />
          </div>
          <div className="text-whispr-text text-lg font-medium animate-pulse">Loading mission control...</div>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  const isToday = mockData.event.status === "Today";

  // Handler functions
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
    console.log("Editing event...");
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

  return (
    <div className="min-h-screen bg-whispr-bg">
      {/* Mesh background */}
      <div className="mesh-bg">
        <div className="mesh-layer" />
        <div className="mesh-noise" />
      </div>

      {/* Event Header */}
      <EventHeader
        name={mockData.event.name}
        status={mockData.event.status}
        date={mockData.event.date}
        time={mockData.event.time}
        venue={mockData.event.venue}
        onPublish={handlePublish}
        onPause={handlePause}
        onShare={handleShare}
        onEdit={handleEdit}
        onDuplicate={handleDuplicate}
        onCancel={handleCancel}
      />

      {/* Health Strip */}
      <HealthStrip stats={mockData.stats} isToday={isToday} />

      {/* Tabs */}
      <Tabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isToday={isToday}
      />

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
            {/* Left Column */}
            <div className="space-y-8">
              <div className="animate-slideInLeft">
                <OpsSummaryCard
                  ops={mockData.ops}
                  onGoToApprovals={handleGoToApprovals}
                />
              </div>
              <div className="animate-slideInLeft" style={{ animationDelay: '0.1s' }}>
                <AlertsPanel alerts={mockData.alerts} onFix={handleFixAlert} />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              <div className="animate-slideInRight">
                <ActivityFeed activities={mockData.activity} />
              </div>
            </div>
          </div>
        )}

        {activeTab === "approvals" && (
          <div className="animate-fadeIn">
            <ApprovalsTable
              registrations={registrations}
              loading={registrationsLoading}
              onApprove={handleApprove}
              onReject={handleReject}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>
        )}

        {activeTab === "attendees" && (
          <div className="glass rounded-2xl p-12 text-center animate-fadeIn">
            <h2 className="text-2xl font-semibold text-whispr-text mb-3">
              Attendees Tab
            </h2>
            <p className="text-whispr-muted">
              Attendees management will be implemented here
            </p>
          </div>
        )}

        {activeTab === "ops" && (
          <div className="glass rounded-2xl p-12 text-center animate-fadeIn">
            <h2 className="text-2xl font-semibold text-whispr-text mb-3">Ops Mode</h2>
            <p className="text-whispr-muted">
              Live operations dashboard will be implemented here
            </p>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="glass rounded-2xl p-12 text-center animate-fadeIn">
            <h2 className="text-2xl font-semibold text-whispr-text mb-3">
              Event Settings
            </h2>
            <p className="text-whispr-muted">
              Event configuration will be implemented here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
