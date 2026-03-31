"use client";

import { Users, UserPlus, Calendar, Ticket, BarChart3 } from "lucide-react";

interface KPICardsProps {
  kpis: {
    total_users: number;
    new_users_today: number;
    active_events: number;
    tickets_sold_today: number;
    total_tickets_sold: number;
  };
}

const CARDS = [
  { key: "total_users" as const, label: "Total Users", icon: Users },
  { key: "new_users_today" as const, label: "New Today", icon: UserPlus },
  { key: "active_events" as const, label: "Active Events", icon: Calendar },
  { key: "tickets_sold_today" as const, label: "Tickets Today", icon: Ticket },
  { key: "total_tickets_sold" as const, label: "Total Tickets", icon: BarChart3 },
];

export default function KPICards({ kpis }: KPICardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-[1px] bg-white/[0.04] rounded-2xl overflow-hidden">
      {CARDS.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.key}
            className="bg-[var(--bg-base)] p-5 flex flex-col gap-3"
          >
            <div className="flex items-center gap-2">
              <Icon size={14} className="text-[var(--copper)]" strokeWidth={1.5} />
              <span
                className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)]"
                style={{ fontFamily: "var(--font-mono-org)" }}
              >
                {card.label}
              </span>
            </div>
            <span
              className="text-[22px] font-semibold text-[var(--text-primary)]"
              style={{ fontFamily: "var(--font-mono-org)" }}
            >
              {(kpis[card.key] ?? 0).toLocaleString()}
            </span>
          </div>
        );
      })}
    </div>
  );
}
