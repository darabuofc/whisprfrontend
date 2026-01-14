"use client";

import { AlertTriangle } from "lucide-react";

interface StatusStripProps {
  eventName: string;
  status: string;
  attendeesCount: number;
  pendingCount: number;
  rejectedCount: number;
  daysLeft: number;
  lastSync?: string;
}

export default function StatusStrip({
  eventName,
  status,
  attendeesCount,
  pendingCount,
  rejectedCount,
  daysLeft,
  lastSync = new Date().toLocaleTimeString("en-US", { hour12: false }),
}: StatusStripProps) {
  return (
    <div className="fixed top-0 left-0 right-0 h-12 bg-[#0A0A0A] border-b border-[#1A1A1A] z-50 flex items-center px-6">
      <div className="flex items-center gap-3 text-[11px] font-mono tracking-[0.1em] uppercase text-[#A0A0A0]">
        <span>
          EVENT: <span className="text-[#E5E7EB]">{eventName}</span>
        </span>
        <span>•</span>
        <span>
          STATUS:{" "}
          <span
            className={
              status === "Live"
                ? "text-[#10B981]"
                : status === "Draft"
                ? "text-[#6B7280]"
                : status === "Ended"
                ? "text-[#EF4444]"
                : "text-[#E5E7EB]"
            }
          >
            {status.toUpperCase()}
          </span>
        </span>
        <span>•</span>
        <span>
          ATTENDEES: <span className="text-[#E5E7EB]">{attendeesCount}</span>
        </span>
        <span>•</span>
        <span className={pendingCount > 0 ? "text-[#F59E0B]" : ""}>
          PENDING: <span className="text-[#E5E7EB]">{pendingCount}</span>
          {pendingCount > 0 && (
            <AlertTriangle className="inline-block w-3 h-3 ml-1 mb-0.5" />
          )}
        </span>
        <span>•</span>
        <span>
          REJECTED: <span className="text-[#E5E7EB]">{rejectedCount}</span>
        </span>
        <span>•</span>
        <span>
          T-{daysLeft} {daysLeft === 1 ? "DAY" : "DAYS"}
        </span>
        <span>•</span>
        <span className="text-[#6B7280]">LAST SYNC: {lastSync}</span>
      </div>
    </div>
  );
}
