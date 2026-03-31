"use client";

import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";
import { format } from "date-fns";
import StatusBadge from "@/components/admin/shared/StatusBadge";
import type { AdminOrganizer } from "@/lib/adminApi";

interface OrganizersTableProps {
  organizers: AdminOrganizer[];
}

export default function OrganizersTable({ organizers }: OrganizersTableProps) {
  const router = useRouter();

  if (organizers.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--text-muted)] text-[13px]">
        No organizers found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/[0.06]">
            {["Name", "Phone", "Events", "Status", "Added", ""].map((h) => (
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
          {organizers.map((org) => (
            <tr
              key={org.id}
              onClick={() => router.push(`/admin/organizers/${org.id}`)}
              className="border-b border-white/[0.03] hover:bg-white/[0.02] cursor-pointer transition-colors"
            >
              <td className="py-3.5 px-4 pl-0">
                <span className="text-[13px] text-[var(--text-primary)] font-medium">
                  {org.name}
                </span>
              </td>
              <td className="py-3.5 px-4">
                <span
                  className="text-[12px] text-[var(--text-secondary)]"
                  style={{ fontFamily: "var(--font-mono-org)" }}
                >
                  {org.phone || "—"}
                </span>
              </td>
              <td className="py-3.5 px-4">
                <span
                  className="text-[12px] text-[var(--text-secondary)]"
                  style={{ fontFamily: "var(--font-mono-org)" }}
                >
                  {org.events_count}
                </span>
              </td>
              <td className="py-3.5 px-4">
                <StatusBadge status={org.status} />
              </td>
              <td className="py-3.5 px-4">
                <span
                  className="text-[12px] text-[var(--text-secondary)]"
                  style={{ fontFamily: "var(--font-mono-org)" }}
                >
                  {(() => {
                    try {
                      return format(new Date(org.created_at), "MMM d, yyyy");
                    } catch {
                      return org.created_at;
                    }
                  })()}
                </span>
              </td>
              <td className="py-3.5 px-4 text-right">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/admin/organizers/${org.id}`);
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
