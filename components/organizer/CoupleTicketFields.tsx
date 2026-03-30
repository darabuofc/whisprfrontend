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

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-2">
          Name
        </label>
        <input
          type="text"
          value={guest.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="Their full name"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#D4A574]/50 focus:border-transparent transition-all"
        />
      </div>

      <div>
        <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-2">
          Phone
        </label>
        <input
          type="tel"
          value={guest.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          placeholder="+1 (555) 000-0000"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#D4A574]/50 focus:border-transparent transition-all"
        />
      </div>

      <div>
        <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-2">
          Email <span className="normal-case tracking-normal text-neutral-600">(optional)</span>
        </label>
        <input
          type="email"
          value={guest.email}
          onChange={(e) => handleChange("email", e.target.value)}
          placeholder="their@email.com"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#D4A574]/50 focus:border-transparent transition-all"
        />
      </div>
    </div>
  );
}
