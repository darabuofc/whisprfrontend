"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  getAdminEvent,
  updateAdminEvent,
  type AdminEventDetail,
} from "@/lib/adminApi";
import EventDetailHeader from "@/components/admin/events/EventDetailHeader";
import EventDetailFields from "@/components/admin/events/EventDetailFields";
import EventAttendeesTable from "@/components/admin/events/EventAttendeesTable";
import { toast } from "sonner";

export default function AdminEventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<AdminEventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await getAdminEvent(id);
        setEvent(res);
        setEditData({
          name: res.name,
          date: res.date,
          time: res.time ?? "",
          venue: res.venue ?? "",
          capacity: res.capacity,
          price: res.price ?? "",
          description: res.description ?? "",
        });
      } catch (err) {
        console.error("Failed to fetch event:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleFieldChange = (field: string, value: string) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateAdminEvent(id, editData);
      setEvent(updated);
      setEditing(false);
      toast.success("Event updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to update event");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const updated = await updateAdminEvent(id, { status: newStatus });
      setEvent(updated);
      toast.success(`Event ${newStatus}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  const handleToggleEdit = () => {
    if (editing) {
      handleSave();
    } else {
      setEditing(true);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
        <div className="h-8 w-64 bg-white/[0.04] rounded-lg animate-pulse" />
        <div className="h-64 bg-white/[0.04] rounded-2xl animate-pulse" />
        <div className="h-48 bg-white/[0.04] rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-6 lg:p-8 text-center text-[var(--text-muted)]">
        Event not found
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <EventDetailHeader
        name={event.name}
        status={event.status}
        organizerName={event.organizer_name}
        editing={editing}
        onToggleEdit={handleToggleEdit}
        onStatusChange={handleStatusChange}
      />

      {editing && (
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-[var(--copper)] text-[#0A0A0A] rounded-lg text-[13px] font-semibold hover:bg-[#B8785C] transition-colors disabled:opacity-50"
            style={{ fontFamily: "var(--font-display-org)" }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}

      <EventDetailFields
        event={event}
        editing={editing}
        editData={editData}
        onFieldChange={handleFieldChange}
      />

      <EventAttendeesTable eventId={id} attendees={event.attendees ?? []} />
    </div>
  );
}
