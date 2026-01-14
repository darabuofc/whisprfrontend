"use client";

import { AlertTriangle } from "lucide-react";

export interface Alert {
  id: string;
  message: string;
  severity: "critical" | "warning" | "info";
}

interface AlertsSectionProps {
  alerts: Alert[];
}

export default function AlertsSection({ alerts }: AlertsSectionProps) {
  if (alerts.length === 0) {
    return null;
  }

  // Show top 3 alerts only, sorted by severity
  const sortedAlerts = [...alerts]
    .sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    })
    .slice(0, 3);

  return (
    <div className="w-full border-t border-b border-[#F59E0B] bg-transparent py-3 px-4 my-6">
      <div className="space-y-2">
        {sortedAlerts.map((alert) => (
          <div
            key={alert.id}
            className="flex items-start gap-2 text-[13px] text-[#F59E0B]"
            style={{ lineHeight: "1.8" }}
          >
            <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" strokeWidth={2} />
            <span>{alert.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
