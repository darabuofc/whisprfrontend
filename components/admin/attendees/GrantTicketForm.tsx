"use client";

import { useState, useEffect } from "react";
import { getAdminEvents, grantTicket, type AdminEvent } from "@/lib/adminApi";
import { toast } from "sonner";
import { Ticket } from "lucide-react";

interface GrantTicketFormProps {
  attendeeId: string;
  onGranted: () => void;
}

export default function GrantTicketForm({
  attendeeId,
  onGranted,
}: GrantTicketFormProps) {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [loading, setLoading] = useState(false);
  const [granting, setGranting] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await getAdminEvents({ per_page: 100, status: "live" });
        setEvents(res.data);
      } catch {
        // silently fail — dropdown will be empty
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleGrant = async () => {
    if (!selectedEventId) {
      toast.error("Please select an event");
      return;
    }
    setGranting(true);
    try {
      await grantTicket(attendeeId, { event_id: selectedEventId });
      toast.success("Ticket granted successfully");
      setSelectedEventId("");
      onGranted();
    } catch (err: any) {
      toast.error(err.message || "Failed to grant ticket");
    } finally {
      setGranting(false);
    }
  };

  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
      <h3
        className="text-[11px] uppercase tracking-[0.15em] text-[var(--text-muted)] mb-5"
        style={{ fontFamily: "var(--font-mono-org)" }}
      >
        Grant Ticket
      </h3>

      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
          disabled={loading}
          className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-[13px] text-[var(--text-primary)] focus:border-[var(--copper)]/40 focus:outline-none transition-colors appearance-none cursor-pointer"
          style={{ fontFamily: "var(--font-body-org)" }}
        >
          <option value="" className="bg-[#1C1C1E]">
            {loading ? "Loading events..." : "Select an event"}
          </option>
          {events.map((event) => (
            <option key={event.id} value={event.id} className="bg-[#1C1C1E]">
              {event.name}
            </option>
          ))}
        </select>

        <button
          onClick={handleGrant}
          disabled={granting || !selectedEventId}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-[var(--copper)] text-[#0A0A0A] rounded-lg text-[12px] font-semibold hover:bg-[#B8785C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          style={{ fontFamily: "var(--font-display-org)" }}
        >
          <Ticket size={14} />
          {granting ? "Granting..." : "Grant Ticket"}
        </button>
      </div>
    </div>
  );
}
