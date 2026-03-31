"use client";

import { Search } from "lucide-react";

interface EventsFiltersProps {
  status: string;
  onStatusChange: (status: string) => void;
  search: string;
  onSearchChange: (search: string) => void;
}

const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "live", label: "Live" },
  { value: "draft", label: "Draft" },
  { value: "ended", label: "Ended" },
  { value: "cancelled", label: "Cancelled" },
];

export default function EventsFilters({
  status,
  onStatusChange,
  search,
  onSearchChange,
}: EventsFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search events..."
          className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg pl-9 pr-4 py-2 text-[13px] text-[var(--text-primary)] placeholder:text-white/20 focus:border-[var(--copper)]/40 focus:outline-none transition-colors"
          style={{ fontFamily: "var(--font-body-org)" }}
        />
      </div>
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-[13px] text-[var(--text-primary)] focus:border-[var(--copper)]/40 focus:outline-none transition-colors appearance-none cursor-pointer min-w-[120px]"
        style={{ fontFamily: "var(--font-body-org)" }}
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#1C1C1E]">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
