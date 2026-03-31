"use client";

import { useState } from "react";
import { updateAdminOrganizer } from "@/lib/adminApi";
import { toast } from "sonner";

interface OrganizerProfileProps {
  organizer: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    instagram?: string;
    status: string;
    notes?: string;
  };
  onUpdated: (updated: any) => void;
}

const FIELDS = [
  { key: "name", label: "Full Name" },
  { key: "phone", label: "Phone" },
  { key: "email", label: "Email" },
  { key: "instagram", label: "Instagram" },
  { key: "notes", label: "Notes" },
];

export default function OrganizerProfile({
  organizer,
  onUpdated,
}: OrganizerProfileProps) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({
    name: organizer.name ?? "",
    phone: organizer.phone ?? "",
    email: organizer.email ?? "",
    instagram: organizer.instagram ?? "",
    notes: organizer.notes ?? "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateAdminOrganizer(organizer.id, form);
      onUpdated(updated);
      setEditing(false);
      toast.success("Organizer updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusToggle = async () => {
    const newStatus =
      organizer.status.toLowerCase() === "active" ? "suspended" : "active";
    try {
      const updated = await updateAdminOrganizer(organizer.id, {
        status: newStatus,
      });
      onUpdated(updated);
      toast.success(`Organizer ${newStatus}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h3
          className="text-[11px] uppercase tracking-[0.15em] text-[var(--text-muted)]"
          style={{ fontFamily: "var(--font-mono-org)" }}
        >
          Profile
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleStatusToggle}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
              organizer.status.toLowerCase() === "active"
                ? "border border-red-500/20 text-red-400 hover:bg-red-500/10"
                : "border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10"
            }`}
            style={{ fontFamily: "var(--font-mono-org)" }}
          >
            {organizer.status.toLowerCase() === "active"
              ? "Suspend"
              : "Activate"}
          </button>
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
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
                {organizer[field.key as keyof typeof organizer] || "—"}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
