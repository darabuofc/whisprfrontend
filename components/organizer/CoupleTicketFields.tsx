"use client";

import { useState } from "react";

interface CoupleTicketFieldsProps {
  onChange: (guest: { name: string; phone: string; email: string }) => void;
}

export default function CoupleTicketFields({ onChange }: CoupleTicketFieldsProps) {
  const [guest, setGuest] = useState({ name: "", phone: "", email: "" });

  const handleChange = (field: string, value: string) => {
    const updated = { ...guest, [field]: value };
    setGuest(updated);
    onChange(updated);
  };

  const inputClass =
    "w-full bg-[var(--bg-raised)] border border-[var(--border-subtle)] text-[var(--text-primary)] px-4 py-3 rounded-[2px] text-[13px] focus:border-[var(--border-copper)] focus:outline-none transition-colors duration-200";

  const labelClass =
    "block text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)] mb-2";

  return (
    <div className="ml-4 pl-4 border-l border-[var(--border-subtle)] space-y-4">
      <p
        className="text-[12px] text-[var(--text-secondary)] uppercase tracking-[0.08em]"
        style={{ fontFamily: "var(--font-body-org)" }}
      >
        Your +1
      </p>

      <div>
        <label className={labelClass} style={{ fontFamily: "var(--font-body-org)" }}>
          Name
        </label>
        <input
          type="text"
          value={guest.name}
          onChange={(e) => handleChange("name", e.target.value)}
          className={inputClass}
          style={{ fontFamily: "var(--font-body-org)" }}
          required
        />
      </div>

      <div>
        <label className={labelClass} style={{ fontFamily: "var(--font-body-org)" }}>
          Phone
        </label>
        <input
          type="tel"
          value={guest.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          className={inputClass}
          style={{ fontFamily: "var(--font-body-org)" }}
          required
        />
      </div>

      <div>
        <label className={labelClass} style={{ fontFamily: "var(--font-body-org)" }}>
          Email (optional)
        </label>
        <input
          type="email"
          value={guest.email}
          onChange={(e) => handleChange("email", e.target.value)}
          className={inputClass}
          style={{ fontFamily: "var(--font-body-org)" }}
        />
      </div>
    </div>
  );
}
