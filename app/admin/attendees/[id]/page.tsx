"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getAdminAttendee, type AdminAttendeeDetail } from "@/lib/adminApi";
import AttendeeProfile from "@/components/admin/attendees/AttendeeProfile";
import TicketHistory from "@/components/admin/attendees/TicketHistory";
import GrantTicketForm from "@/components/admin/attendees/GrantTicketForm";

export default function AdminAttendeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [attendee, setAttendee] = useState<AdminAttendeeDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAttendee = async () => {
    try {
      const res = await getAdminAttendee(id);
      setAttendee(res);
    } catch (err) {
      console.error("Failed to fetch attendee:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendee();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-white/[0.04] rounded-lg animate-pulse" />
        <div className="h-32 bg-white/[0.04] rounded-2xl animate-pulse" />
        <div className="h-48 bg-white/[0.04] rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!attendee) {
    return (
      <div className="p-6 lg:p-8 text-center text-[var(--text-muted)]">
        Attendee not found
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/admin/attendees")}
          className="p-1.5 rounded-md hover:bg-white/[0.06] text-[var(--text-muted)] transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <h1
          className="text-[20px] font-medium text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-display-org)" }}
        >
          {attendee.name}
        </h1>
      </div>

      <AttendeeProfile
        attendee={attendee}
        onUpdated={(updated) =>
          setAttendee((prev) => (prev ? { ...prev, ...updated } : prev))
        }
      />

      <TicketHistory tickets={attendee.ticket_history ?? []} />

      <GrantTicketForm attendeeId={id} onGranted={fetchAttendee} />
    </div>
  );
}
