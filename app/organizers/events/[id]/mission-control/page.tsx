"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import EventHeader from "./components/EventHeader";
import HealthStrip from "./components/HealthStrip";
import Tabs from "./components/Tabs";
import OpsSummaryCard from "./components/OpsSummaryCard";
import AlertsPanel from "./components/AlertsPanel";
import ActivityFeed from "./components/ActivityFeed";

type EventStatus = "Draft" | "Live" | "Today" | "Ended";
type TabType = "overview" | "approvals" | "attendees" | "ops" | "settings";


// Mock data
const data = {
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

export default function MissionControlPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-blue-50/30 to-neutral-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            {/* Spinning ring */}
            <div className="w-16 h-16 rounded-full border-4 border-neutral-200 border-t-blue-600 animate-spin" />
            {/* Inner pulse */}
            <div className="absolute inset-0 w-16 h-16 rounded-full bg-blue-500/20 animate-pulse" />
          </div>
          <div className="text-neutral-900 text-lg font-medium animate-pulse">Loading mission control...</div>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  const isToday = data.event.status === "Today";

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
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-blue-50/30 to-neutral-50">
      {/* Ambient gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Event Header */}
      <EventHeader
        name={data.event.name}
        status={data.event.status}
        date={data.event.date}
        time={data.event.time}
        venue={data.event.venue}
        onPublish={handlePublish}
        onPause={handlePause}
        onShare={handleShare}
        onEdit={handleEdit}
        onDuplicate={handleDuplicate}
        onCancel={handleCancel}
      />

      {/* Health Strip */}
      <HealthStrip stats={data.stats} isToday={isToday} />

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
                  ops={data.ops}
                  onGoToApprovals={handleGoToApprovals}
                />
              </div>
              <div className="animate-slideInLeft" style={{ animationDelay: '0.1s' }}>
                <AlertsPanel alerts={data.alerts} onFix={handleFixAlert} />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              <div className="animate-slideInRight">
                <ActivityFeed activities={data.activity} />
              </div>
            </div>
          </div>
        )}

        {activeTab === "approvals" && (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-3">
              Approvals Tab
            </h2>
            <p className="text-neutral-500">
              Approvals interface will be implemented here
            </p>
          </div>
        )}

        {activeTab === "attendees" && (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-3">
              Attendees Tab
            </h2>
            <p className="text-neutral-500">
              Attendees management will be implemented here
            </p>
          </div>
        )}

        {activeTab === "ops" && (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-3">Ops Mode</h2>
            <p className="text-neutral-500">
              Live operations dashboard will be implemented here
            </p>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-3">
              Event Settings
            </h2>
            <p className="text-neutral-500">
              Event configuration will be implemented here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
