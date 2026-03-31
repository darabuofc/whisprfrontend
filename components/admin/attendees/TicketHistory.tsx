"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";

interface TicketHistoryItem {
  id: string;
  event_name: string;
  event_id: string;
  ticket_type?: string;
  date: string;
  status: string;
}

interface TicketHistoryProps {
  tickets: TicketHistoryItem[];
}

export default function TicketHistory({ tickets }: TicketHistoryProps) {
  const router = useRouter();

  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
      <h3
        className="text-[11px] uppercase tracking-[0.15em] text-[var(--text-muted)] mb-5"
        style={{ fontFamily: "var(--font-mono-org)" }}
      >
        Ticket History ({tickets.length})
      </h3>

      {tickets.length === 0 ? (
        <p className="text-[13px] text-[var(--text-muted)] py-4 text-center">
          No tickets yet
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {["Event", "Type", "Date", "Status"].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)] pb-3 px-3 first:pl-0"
                    style={{ fontFamily: "var(--font-mono-org)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  onClick={() => router.push(`/admin/events/${ticket.event_id}`)}
                  className="border-b border-white/[0.03] hover:bg-white/[0.02] cursor-pointer transition-colors"
                >
                  <td className="py-3 px-3 pl-0 text-[13px] text-[var(--text-primary)] font-medium">
                    {ticket.event_name}
                  </td>
                  <td className="py-3 px-3 text-[12px] text-[var(--text-secondary)]">
                    {ticket.ticket_type || "—"}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className="text-[12px] text-[var(--text-secondary)]"
                      style={{ fontFamily: "var(--font-mono-org)" }}
                    >
                      {(() => {
                        try {
                          return format(new Date(ticket.date), "MMM d, yyyy");
                        } catch {
                          return ticket.date;
                        }
                      })()}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[12px] text-[var(--text-secondary)]">
                    {ticket.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
