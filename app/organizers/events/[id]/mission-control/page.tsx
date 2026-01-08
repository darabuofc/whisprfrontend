"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import StatusStrip from "./components/StatusStrip";
import CommandRail from "./components/CommandRail";
import SystemLog, { LogEntry } from "./components/SystemLog";
import OperationsQueue, { QueueItem } from "./components/OperationsQueue";
import MetricsGrid from "./components/MetricsGrid";
import AlertsSection, { Alert } from "./components/AlertsSection";

type EventStatus = "Draft" | "Live" | "Today" | "Ended";
type ViewType = "queue" | "approvals" | "attendees" | "log" | "settings";

// Mock data
const data = {
  event: {
    name: "GATR Winter Fest",
    status: "Live" as EventStatus,
  },
  stats: {
    approved: 342,
    pending: 7,
    rejected: 12,
    checkedIn: 0,
    daysLeft: 12,
  },
  queueItems: [
    { id: "1847", name: "Ali Hassan", type: "Individual" as const, status: "PENDING" as const },
    { id: "1846", name: "Sara Ahmed", type: "Couple" as const, status: "PENDING" as const },
    { id: "1845", name: "Ahmed Khan", type: "Group" as const, status: "FLAGGED" as const },
    { id: "1844", name: "Fatima Ali", type: "Individual" as const, status: "PENDING" as const },
    { id: "1843", name: "Omar Siddiqui", type: "Couple" as const, status: "PENDING" as const },
    { id: "1842", name: "Zainab Malik", type: "Individual" as const, status: "PENDING" as const },
    { id: "1841", name: "Bilal Sheikh", type: "Group" as const, status: "PENDING" as const },
  ],
  alerts: [
    { id: "1", message: "3 submissions > 24h pending", severity: "warning" as const },
    { id: "2", message: "CNIC validation service degraded", severity: "warning" as const },
  ],
  logEntries: [
    { timestamp: "21:34:07", type: "NEW_REGISTRATION" as const, details: "Ali Hassan" },
    { timestamp: "21:32:11", type: "NEW_REGISTRATION" as const, details: "Sara Ahmed" },
    { timestamp: "21:29:03", type: "APPROVED" as const, details: "Fatima (Couple Pass)" },
    { timestamp: "21:26:44", type: "CHECKIN" as const, details: "2 attendees" },
    { timestamp: "21:25:01", type: "REJECTED" as const, details: "Invalid CNIC" },
    { timestamp: "21:22:15", type: "NEW_REGISTRATION" as const, details: "Ahmed Khan" },
    { timestamp: "21:19:33", type: "APPROVED" as const, details: "Omar Siddiqui" },
    { timestamp: "21:17:22", type: "FLAG" as const, details: "Duplicate submission detected" },
    { timestamp: "21:15:08", type: "CHECKIN" as const, details: "5 attendees" },
    { timestamp: "21:12:45", type: "APPROVED" as const, details: "Batch approval: 3 entries" },
    { timestamp: "21:10:11", type: "NEW_REGISTRATION" as const, details: "Zainab Malik" },
    { timestamp: "21:08:33", type: "REJECTED" as const, details: "Incomplete form" },
    { timestamp: "21:05:22", type: "SYSTEM" as const, details: "Backup completed" },
    { timestamp: "21:03:11", type: "NEW_REGISTRATION" as const, details: "Bilal Sheikh" },
    { timestamp: "21:01:05", type: "APPROVED" as const, details: "Hassan Ali" },
  ],
};

export default function MissionControlPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [activeView, setActiveView] = useState<ViewType>("queue");
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [queueItems, setQueueItems] = useState<QueueItem[]>(data.queueItems);
  const [logEntries, setLogEntries] = useState<LogEntry[]>(data.logEntries);
  const [lastSync, setLastSync] = useState(
    new Date().toLocaleTimeString("en-US", { hour12: false })
  );

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

  // Update last sync time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setLastSync(new Date().toLocaleTimeString("en-US", { hour12: false }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0226] flex items-center justify-center">
        <div className="text-[#6B7280] text-[14px] font-mono uppercase tracking-wider">
          LOADING MISSION CONTROL...
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  // Handler functions
  const handleApprove = (id: string) => {
    console.log("Approving:", id);
    // Remove from queue
    setQueueItems((prev) => prev.filter((item) => item.id !== id));
    // Add to log
    const item = queueItems.find((q) => q.id === id);
    if (item) {
      const newEntry: LogEntry = {
        timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
        type: "APPROVED",
        details: item.name,
      };
      setLogEntries((prev) => [newEntry, ...prev]);
    }
  };

  const handleReject = (id: string) => {
    console.log("Rejecting:", id);
    // Remove from queue
    setQueueItems((prev) => prev.filter((item) => item.id !== id));
    // Add to log
    const item = queueItems.find((q) => q.id === id);
    if (item) {
      const newEntry: LogEntry = {
        timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
        type: "REJECTED",
        details: item.name,
      };
      setLogEntries((prev) => [newEntry, ...prev]);
    }
  };

  const handleViewChange = (view: ViewType) => {
    setActiveView(view);
  };

  const metrics = [
    { label: "APPROVED", value: data.stats.approved, status: "normal" as const },
    {
      label: "PENDING",
      value: data.stats.pending,
      status: data.stats.pending > 0 ? ("warning" as const) : ("normal" as const),
    },
    { label: "REJECTED", value: data.stats.rejected, status: "normal" as const },
    { label: "AVG APPROVAL", value: "4.2min", status: "normal" as const },
    { label: "CHECKIN RATE", value: "94%", status: "success" as const },
    { label: "ACTIVE OPS", value: queueItems.length, status: "normal" as const },
    { label: "CAPACITY", value: "87%", status: "success" as const },
    { label: "UPTIME", value: "99.8%", status: "success" as const },
  ];

  return (
    <div className="min-h-screen bg-[#0A0226]">
      {/* Status Strip */}
      <StatusStrip
        eventName={data.event.name}
        status={data.event.status}
        attendeesCount={data.stats.approved}
        pendingCount={data.stats.pending}
        rejectedCount={data.stats.rejected}
        daysLeft={data.stats.daysLeft}
        lastSync={lastSync}
      />

      {/* Command Rail */}
      <CommandRail activeView={activeView} onViewChange={handleViewChange} />

      {/* System Log */}
      <SystemLog entries={logEntries} />

      {/* Main Canvas */}
      <div className="fixed left-16 right-64 top-12 bottom-0 overflow-y-auto">
        <div className="p-6 space-y-6">
          {activeView === "queue" && (
            <>
              {/* Operations Queue */}
              <OperationsQueue
                items={queueItems}
                onApprove={handleApprove}
                onReject={handleReject}
              />

              {/* Alerts Section */}
              <AlertsSection alerts={data.alerts} />

              {/* Metrics Grid */}
              <MetricsGrid metrics={metrics} />
            </>
          )}

          {activeView === "approvals" && (
            <div className="border border-[#1A1A1A] p-8 text-center">
              <h2 className="text-[16px] font-medium text-[#E5E7EB] mb-4 uppercase tracking-wider">
                Approvals View
              </h2>
              <p className="text-[14px] text-[#6B7280]">
                Full approvals interface will be implemented here
              </p>
            </div>
          )}

          {activeView === "attendees" && (
            <div className="border border-[#1A1A1A] p-8 text-center">
              <h2 className="text-[16px] font-medium text-[#E5E7EB] mb-4 uppercase tracking-wider">
                Attendees Management
              </h2>
              <p className="text-[14px] text-[#6B7280]">
                Attendees management will be implemented here
              </p>
            </div>
          )}

          {activeView === "log" && (
            <div className="border border-[#1A1A1A] p-8 text-center">
              <h2 className="text-[16px] font-medium text-[#E5E7EB] mb-4 uppercase tracking-wider">
                Full System Log
              </h2>
              <p className="text-[14px] text-[#6B7280]">
                Detailed system log with filtering will be implemented here
              </p>
            </div>
          )}

          {activeView === "settings" && (
            <div className="border border-[#1A1A1A] p-8 text-center">
              <h2 className="text-[16px] font-medium text-[#E5E7EB] mb-4 uppercase tracking-wider">
                Event Settings
              </h2>
              <p className="text-[14px] text-[#6B7280]">
                Event configuration will be implemented here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
