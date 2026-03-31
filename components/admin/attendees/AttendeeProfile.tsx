"use client";

import { useState } from "react";
import { updateAdminAttendee } from "@/lib/adminApi";
import { toast } from "sonner";

interface AttendeeProfileProps {
  attendee: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  };
  onUpdated: (updated: any) => void;
}

const FIELDS = [
  { key: "name", label: "Name" },
  { key: "phone", label: "Phone" },
  { key: "email", label: "Email" },
];

export default function AttendeeProfile({
  attendee,
  onUpdated,
}: AttendeeProfileProps) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({
    name: attendee.name ?? "",
    phone: attendee.phone ?? "",
    email: attendee.email ?? "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateAdminAttendee(attendee.id, form);
      onUpdated(updated);
      setEditing(false);
      toast.success("Attendee updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h3
          className="text-[11px] uppercase tracking-[0.15em] text-[var(--text-muted)]"
          style={{ fontFamily: "var(--font-mono-org)" }}
        >
          Contact Details
        </h3>
        <button
          onClick={() => (editing ? handleSave() : setEditing(true))}
          disabled={saving}
          className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
            editing
              ? "bg-[var(--copper)] text-[#0A0A0A]"
              : "border border-white/[0.06] text-[var(--text-secondary)] hover:bg-white/[0.04]"
          }`}
          style={{ fontFamily: "var(--font-mono-org)" }}
        >
          {editing ? (saving ? "Saving..." : "Save") : "Edit"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4">
        {FIELDS.map((field) => (
          <div key={field.key}>
            <label
              className="text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)] mb-1.5 block"
              style={{ fontFamily: "var(--font-mono-org)" }}
            >
              {field.label}
            </label>
            {editing ? (
              <input
                type="text"
                value={form[field.key]}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, [field.key]: e.target.value }))
                }
                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-[13px] text-[var(--text-primary)] focus:border-[var(--copper)]/40 focus:outline-none transition-colors"
                style={{ fontFamily: "var(--font-body-org)" }}
              />
            ) : (
              <p className="text-[14px] text-[var(--text-primary)]">
                {attendee[field.key as keyof typeof attendee] || "—"}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
