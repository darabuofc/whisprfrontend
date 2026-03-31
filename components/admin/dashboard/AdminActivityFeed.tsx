"use client";

import { formatDistanceToNow } from "date-fns";
import {
  Ticket,
  UserPlus,
  Calendar,
  Users,
  Activity,
} from "lucide-react";
import type { ActivityFeedItem } from "@/lib/adminApi";

interface AdminActivityFeedProps {
  activities: ActivityFeedItem[];
}

function getIcon(type: string) {
  switch (type) {
    case "ticket_purchased":
      return Ticket;
    case "user_registered":
      return UserPlus;
    case "event_created":
    case "event_published":
      return Calendar;
    case "organizer_added":
      return Users;
    default:
      return Activity;
  }
}

export default function AdminActivityFeed({ activities }: AdminActivityFeedProps) {
  if (!activities || activities.length === 0) {
    return (
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
        <h3
          className="text-[11px] uppercase tracking-[0.15em] text-[var(--text-muted)] mb-4"
          style={{ fontFamily: "var(--font-mono-org)" }}
        >
          Recent Activity
        </h3>
        <p className="text-[13px] text-[var(--text-muted)]">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
      <h3
        className="text-[11px] uppercase tracking-[0.15em] text-[var(--text-muted)] mb-4"
        style={{ fontFamily: "var(--font-mono-org)" }}
      >
        Recent Activity
      </h3>
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
        {activities.map((item) => {
          const Icon = getIcon(item.type);
          return (
            <div
              key={item.id}
              className="flex items-start gap-3 py-2 border-b border-white/[0.04] last:border-0"
            >
              <div className="mt-0.5 p-1.5 rounded-md bg-white/[0.04]">
                <Icon size={13} className="text-[var(--copper)]" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-[13px] text-[var(--text-primary)] leading-relaxed"
                  style={{ fontFamily: "var(--font-body-org)" }}
                >
                  {item.description}
                </p>
                <p
                  className="text-[11px] text-[var(--text-muted)] mt-0.5"
                  style={{ fontFamily: "var(--font-mono-org)" }}
                >
                  {formatDistanceToNow(new Date(item.timestamp), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
