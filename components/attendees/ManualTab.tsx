"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { invitePartnerManual } from "@/lib/api";
import { toast } from "sonner";

interface ManualTabProps {
  registrationId: string;
  onGuestAdded: () => void;
}

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#D4A574]/50 focus:border-transparent transition-all";

const labelClass = "block text-[10px] uppercase tracking-wider text-neutral-500 mb-2";

export default function ManualTab({ registrationId, onGuestAdded }: ManualTabProps) {
  const [form, setForm] = useState({ name: "", phone: "", cnic: "", email: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error("Name and phone are required");
      return;
    }
    setSubmitting(true);
    try {
      await invitePartnerManual(registrationId, {
        manual: true,
        name: form.name.trim(),
        phone: form.phone.trim(),
        cnic: form.cnic.trim(),
        email: form.email.trim() || undefined,
      });
      toast.success("Guest added successfully");
      onGuestAdded();
    } catch {
      toast.error("Failed to add guest. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label className={labelClass}>Name</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="Their full name"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Phone</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            placeholder="03XX XXXXXXX"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>CNIC</label>
          <input
            type="text"
            value={form.cnic}
            onChange={(e) => handleChange("cnic", e.target.value)}
            placeholder="XXXXX-XXXXXXX-X"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>
          Email <span className="normal-case tracking-normal text-neutral-600">(optional)</span>
        </label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => handleChange("email", e.target.value)}
          placeholder="their@email.com"
          className={inputClass}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting || !form.name.trim() || !form.phone.trim()}
        className="w-full py-3 rounded-xl bg-[#D4A574] hover:bg-[#B8785C] text-[#0A0A0A] text-sm font-semibold transition-all duration-300 disabled:opacity-40 disabled:hover:bg-[#D4A574] flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <Loader2 size={15} className="animate-spin" />
            Adding...
          </>
        ) : (
          "Add Guest"
        )}
      </button>
    </div>
  );
}
