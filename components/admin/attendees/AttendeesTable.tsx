"use client";

import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { AdminAttendee } from "@/lib/adminApi";

interface AttendeesTableProps {
  attendees: AdminAttendee[];
}

export default function AttendeesTable({ attendees }: AttendeesTableProps) {
  const router = useRouter();

  if (attendees.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--text-muted)] text-[13px]">
        No attendees found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/[0.06]">
            {["Name", "Phone", "Tickets", "Last Active", ""].map((h) => (
              <th
                key={h}
                className="text-left text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)] pb-3 px-4 first:pl-0"
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
              onClick={() => router.push(`/admin/attendees/${att.id}`)}
              className="border-b border-white/[0.03] hover:bg-white/[0.02] cursor-pointer transition-colors"
            >
              <td className="py-3.5 px-4 pl-0">
                <span className="text-[13px] text-[var(--text-primary)] font-medium">
                  {att.name}
                </span>
              </td>
              <td className="py-3.5 px-4">
                <span
                  className="text-[12px] text-[var(--text-secondary)]"
                  style={{ fontFamily: "var(--font-mono-org)" }}
                >
                  {att.phone || "—"}
                </span>
              </td>
              <td className="py-3.5 px-4">
                <span
                  className="text-[12px] text-[var(--text-secondary)]"
                  style={{ fontFamily: "var(--font-mono-org)" }}
                >
                  {att.tickets_count}
                </span>
              </td>
              <td className="py-3.5 px-4">
                <span
                  className="text-[12px] text-[var(--text-secondary)]"
                  style={{ fontFamily: "var(--font-mono-org)" }}
                >
                  {att.last_active
                    ? formatDistanceToNow(new Date(att.last_active), {
                        addSuffix: true,
                      })
                    : "—"}
                </span>
              </td>
              <td className="py-3.5 px-4 text-right">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/admin/attendees/${att.id}`);
                  }}
                  className="p-1.5 rounded-md hover:bg-white/[0.06] text-[var(--text-muted)] hover:text-[var(--copper)] transition-colors"
                >
                  <Eye size={15} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
