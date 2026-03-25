"use client";

import { useState } from "react";
import { updateOrganizerProfile } from "@/lib/api";

interface ProfileFormProps {
  initialData: {
    name?: string;
    email?: string;
    bio?: string;
    profile_image?: string;
    phone?: string;
    instagram?: string;
  };
}

export default function ProfileForm({ initialData }: ProfileFormProps) {
  const [form, setForm] = useState({
    full_name: initialData.name || "",
    bio: initialData.bio || "",
    profile_image: initialData.profile_image || "",
    contact_email: initialData.email || "",
    phone: initialData.phone || "",
    instagram: initialData.instagram || "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await updateOrganizerProfile(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full bg-[var(--bg-raised)] border border-[var(--border-subtle)] text-[var(--text-primary)] px-4 py-3 rounded-[2px] text-[13px] focus:border-[var(--border-copper)] focus:outline-none transition-colors duration-200";

  const labelClass =
    "block text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)] mb-2";

  return (
    <form onSubmit={handleSubmit} className="max-w-[560px] space-y-6">
      <div>
        <label className={labelClass} style={{ fontFamily: "var(--font-body-org)" }}>
          Full Name
        </label>
        <input
          type="text"
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          className={inputClass}
          style={{ fontFamily: "var(--font-body-org)" }}
        />
      </div>

      <div>
        <label className={labelClass} style={{ fontFamily: "var(--font-body-org)" }}>
          Bio
        </label>
        <textarea
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value.slice(0, 200) })}
          maxLength={200}
          rows={3}
          className={inputClass + " resize-none"}
          style={{ fontFamily: "var(--font-body-org)" }}
        />
        <p
          className="text-[10px] text-[var(--text-muted)] mt-1 text-right"
          style={{ fontFamily: "var(--font-body-org)" }}
        >
          {form.bio.length}/200
        </p>
      </div>

      <div>
        <label className={labelClass} style={{ fontFamily: "var(--font-body-org)" }}>
          Profile Image URL
        </label>
        <input
          type="url"
          value={form.profile_image}
          onChange={(e) => setForm({ ...form, profile_image: e.target.value })}
          className={inputClass}
          style={{ fontFamily: "var(--font-body-org)" }}
          placeholder="https://..."
        />
      </div>

      <div>
        <label className={labelClass} style={{ fontFamily: "var(--font-body-org)" }}>
          Contact Email
        </label>
        <input
          type="email"
          value={form.contact_email}
          onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
          className={inputClass}
          style={{ fontFamily: "var(--font-body-org)" }}
        />
      </div>

      <div>
        <label className={labelClass} style={{ fontFamily: "var(--font-body-org)" }}>
          Phone
        </label>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className={inputClass}
          style={{ fontFamily: "var(--font-body-org)" }}
        />
      </div>

      <div>
        <label className={labelClass} style={{ fontFamily: "var(--font-body-org)" }}>
          Instagram Handle
        </label>
        <input
          type="text"
          value={form.instagram}
          onChange={(e) => setForm({ ...form, instagram: e.target.value })}
          className={inputClass}
          style={{ fontFamily: "var(--font-body-org)" }}
          placeholder="@handle"
        />
      </div>

      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="w-full py-[14px] bg-[var(--copper)] text-[var(--bg-base)] text-[11px] uppercase tracking-[0.15em] rounded-[2px] hover:opacity-90 transition-opacity duration-200 disabled:opacity-50"
          style={{ fontFamily: "var(--font-display-org)" }}
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
        {saved && (
          <span
            className="text-[11px] text-[var(--status-live)] uppercase tracking-[0.08em] whitespace-nowrap"
            style={{ fontFamily: "var(--font-body-org)" }}
          >
            Saved
          </span>
        )}
      </div>
    </form>
  );
}
