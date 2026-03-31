"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { createAdminOrganizer } from "@/lib/adminApi";
import { toast } from "sonner";

interface AddOrganizerModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function AddOrganizerModal({
  open,
  onClose,
  onCreated,
}: AddOrganizerModalProps) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    instagram: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createAdminOrganizer(form);
      toast.success("Organizer created + WhatsApp welcome sent");
      setForm({ name: "", phone: "", email: "", instagram: "", notes: "" });
      onCreated();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to create organizer");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-[#1C1C1E] border border-white/[0.06] rounded-2xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-[16px] font-medium text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-display-org)" }}
          >
            Add Organizer
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-white/[0.06] text-[var(--text-muted)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { key: "name", label: "Full Name *", required: true },
            { key: "phone", label: "Phone (WhatsApp) *", required: true },
            { key: "email", label: "Email", required: false },
            { key: "instagram", label: "Instagram Handle", required: false },
          ].map((field) => (
            <div key={field.key} className="space-y-1.5">
              <label
                className="text-[10px] uppercase tracking-[0.1em] text-[var(--text-secondary)]"
                style={{ fontFamily: "var(--font-mono-org)" }}
              >
                {field.label}
              </label>
              <input
                type="text"
                value={form[field.key as keyof typeof form]}
                onChange={(e) => handleChange(field.key, e.target.value)}
                required={field.required}
                className="w-full bg-black/40 border border-white/[0.06] rounded-lg px-3 py-2 text-[13px] text-[var(--text-primary)] placeholder:text-white/20 focus:border-[var(--copper)]/40 focus:outline-none transition-colors"
                style={{ fontFamily: "var(--font-body-org)" }}
              />
            </div>
          ))}

          <div className="space-y-1.5">
            <label
              className="text-[10px] uppercase tracking-[0.1em] text-[var(--text-secondary)]"
              style={{ fontFamily: "var(--font-mono-org)" }}
            >
              Notes (internal)
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              rows={2}
              className="w-full bg-black/40 border border-white/[0.06] rounded-lg px-3 py-2 text-[13px] text-[var(--text-primary)] placeholder:text-white/20 focus:border-[var(--copper)]/40 focus:outline-none transition-colors resize-none"
              style={{ fontFamily: "var(--font-body-org)" }}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-[12px] font-medium border border-white/[0.06] text-[var(--text-secondary)] hover:bg-white/[0.04] transition-colors"
              style={{ fontFamily: "var(--font-mono-org)" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-[var(--copper)] text-[#0A0A0A] rounded-lg text-[12px] font-semibold hover:bg-[#B8785C] transition-colors disabled:opacity-50"
              style={{ fontFamily: "var(--font-display-org)" }}
            >
              {saving ? "Creating..." : "Create Organizer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
