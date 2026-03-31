"use client";

import { Download } from "lucide-react";
import { exportEventAttendees } from "@/lib/adminApi";
import { toast } from "sonner";

interface Attendee {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  ticket_type?: string;
  status: string;
}

interface EventAttendeesTableProps {
  eventId: string;
  attendees: Attendee[];
}

export default function EventAttendeesTable({
  eventId,
  attendees,
}: EventAttendeesTableProps) {
  const handleExport = async () => {
    try {
      const blob = await exportEventAttendees(eventId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `event-${eventId}-attendees.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("CSV downloaded");
    } catch (err: any) {
      toast.error(err.message || "Failed to export");
    }
  };

  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h3
          className="text-[11px] uppercase tracking-[0.15em] text-[var(--text-muted)]"
          style={{ fontFamily: "var(--font-mono-org)" }}
        >
          Attendees ({attendees.length})
        </h3>
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium border border-white/[0.06] text-[var(--text-secondary)] hover:bg-white/[0.04] transition-colors"
          style={{ fontFamily: "var(--font-mono-org)" }}
        >
          <Download size={13} />
          Export CSV
        </button>
      </div>

      {attendees.length === 0 ? (
        <p className="text-[13px] text-[var(--text-muted)] py-4 text-center">
          No attendees yet
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {["Name", "Phone", "Email", "Type", "Status"].map((h) => (
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
              {attendees.map((att) => (
                <tr
                  key={att.id}
                  className="border-b border-white/[0.03]"
                >
                  <td className="py-3 px-3 pl-0 text-[13px] text-[var(--text-primary)]">
                    {att.name}
                  </td>
                  <td className="py-3 px-3 text-[12px] text-[var(--text-secondary)] font-mono">
                    {att.phone || "—"}
                  </td>
                  <td className="py-3 px-3 text-[12px] text-[var(--text-secondary)]">
                    {att.email || "—"}
                  </td>
                  <td className="py-3 px-3 text-[12px] text-[var(--text-secondary)]">
                    {att.ticket_type || "—"}
                  </td>
                  <td className="py-3 px-3 text-[12px] text-[var(--text-secondary)]">
                    {att.status}
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
