"use client";

import { useState, useEffect } from "react";
import { updateOrganization, Organization } from "@/lib/api";

interface OrganizationFormProps {
  initialData: Organization | null;
}

export default function OrganizationForm({ initialData }: OrganizationFormProps) {
  const [form, setForm] = useState({
    name: initialData?.name || "",
    tagline: initialData?.tagline || "",
    description: initialData?.description || "",
    logo: initialData?.logo || "",
    website: initialData?.website || "",
    instagram_handle: initialData?.instagram_handle || "",
    category: initialData?.category || "",
    city: initialData?.city || "",
  });
  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        tagline: initialData.tagline || "",
        description: initialData.description || "",
        logo: initialData.logo || "",
        website: initialData.website || "",
        instagram_handle: initialData.instagram_handle || "",
        category: initialData.category || "",
        city: initialData.city || "",
      });
    }
  }, [initialData]);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await updateOrganization(form);
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
          Organization Name
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className={inputClass}
          style={{ fontFamily: "var(--font-body-org)" }}
        />
      </div>

      <div>
        <label className={labelClass} style={{ fontFamily: "var(--font-body-org)" }}>
          Tagline
        </label>
        <input
          type="text"
          value={form.tagline}
          onChange={(e) => setForm({ ...form, tagline: e.target.value })}
          className={inputClass}
          style={{ fontFamily: "var(--font-body-org)" }}
          maxLength={255}
        />
      </div>

      <div>
        <label className={labelClass} style={{ fontFamily: "var(--font-body-org)" }}>
          Description
        </label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={4}
          className={inputClass + " resize-none"}
          style={{ fontFamily: "var(--font-body-org)" }}
        />
      </div>

      <div>
        <label className={labelClass} style={{ fontFamily: "var(--font-body-org)" }}>
          Logo URL
        </label>
        <input
          type="url"
          value={form.logo}
          onChange={(e) => setForm({ ...form, logo: e.target.value })}
          className={inputClass}
          style={{ fontFamily: "var(--font-body-org)" }}
          placeholder="https://..."
        />
      </div>

      <div>
        <label className={labelClass} style={{ fontFamily: "var(--font-body-org)" }}>
          Category / Genre
        </label>
        <input
          type="text"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className={inputClass}
          style={{ fontFamily: "var(--font-body-org)" }}
          placeholder="e.g. Electronic, Hip-Hop, Art"
        />
      </div>

      <div>
        <label className={labelClass} style={{ fontFamily: "var(--font-body-org)" }}>
          City
        </label>
        <input
          type="text"
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
          className={inputClass}
          style={{ fontFamily: "var(--font-body-org)" }}
        />
      </div>

      <div>
        <label className={labelClass} style={{ fontFamily: "var(--font-body-org)" }}>
          Website
        </label>
        <input
          type="url"
          value={form.website}
          onChange={(e) => setForm({ ...form, website: e.target.value })}
          className={inputClass}
          style={{ fontFamily: "var(--font-body-org)" }}
          placeholder="https://..."
        />
      </div>

      <div>
        <label className={labelClass} style={{ fontFamily: "var(--font-body-org)" }}>
          Instagram Handle
        </label>
        <input
          type="text"
          value={form.instagram_handle}
          onChange={(e) => setForm({ ...form, instagram_handle: e.target.value })}
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
          {saving ? "Saving..." : "Save Organization"}
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
