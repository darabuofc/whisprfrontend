"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { updateOrganization, Organization } from "@/lib/api";
import { toast } from "sonner";

interface EditOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  organization: Organization | null;
  onSaved?: () => void;
}

export default function EditOrganizationModal({
  isOpen,
  onClose,
  organization,
  onSaved,
}: EditOrganizationModalProps) {
  const [form, setForm] = useState({
    name: "",
    tagline: "",
    description: "",
    logo: "",
    website: "",
    instagram_handle: "",
    category: "",
    city: "",
  });
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && organization) {
      setForm({
        name: organization.name || "",
        tagline: organization.tagline || "",
        description: organization.description || "",
        logo: organization.logo || "",
        website: organization.website || "",
        instagram_handle: organization.instagram_handle || "",
        category: organization.category || "",
        city: organization.city || "",
      });
      setIsDirty(false);
      setSaving(false);
    }
  }, [isOpen, organization]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateOrganization(form);
      toast.success("Organization saved");
      onSaved?.();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to save organization");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full bg-[var(--bg-raised)] border border-[var(--border-subtle)] text-[var(--text-primary)] px-4 py-3 rounded-[2px] text-[13px] focus:border-[var(--border-copper)] focus:outline-none transition-colors duration-200";

  const labelClass =
    "block text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)] mb-2";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-2xl rounded-2xl border border-white/[0.08] bg-[#0A0A0A] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
                <h2
                  className="text-lg font-semibold text-white/90"
                  style={{ fontFamily: "var(--font-display-org)" }}
                >
                  Organization
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.04] text-white/40 hover:bg-white/[0.08] hover:text-white/60 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 max-h-[60vh] overflow-y-auto space-y-5">
                <div>
                  <label className={labelClass} style={{ fontFamily: "var(--font-body-org)" }}>
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
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
                    onChange={(e) => handleChange("tagline", e.target.value)}
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
                    onChange={(e) => handleChange("description", e.target.value)}
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
                    onChange={(e) => handleChange("logo", e.target.value)}
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
                    onChange={(e) => handleChange("category", e.target.value)}
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
                    onChange={(e) => handleChange("city", e.target.value)}
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
                    onChange={(e) => handleChange("website", e.target.value)}
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
                    onChange={(e) => handleChange("instagram_handle", e.target.value)}
                    className={inputClass}
                    style={{ fontFamily: "var(--font-body-org)" }}
                    placeholder="@handle"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-white/[0.06] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-sm text-white/70 bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] transition-colors"
                  style={{ fontFamily: "var(--font-body-org)" }}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!isDirty || saving}
                  className="px-5 py-2 rounded-lg text-sm font-medium text-[var(--bg-base)] bg-[var(--copper)] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  style={{ fontFamily: "var(--font-display-org)" }}
                >
                  {saving ? "Saving..." : "Save Organization"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
