"use client";

import { format } from "date-fns";

interface EventDetailFieldsProps {
  event: Record<string, any>;
  editing: boolean;
  editData: Record<string, any>;
  onFieldChange: (field: string, value: string) => void;
}

const FIELDS = [
  { key: "name", label: "Event Name", type: "text" },
  { key: "date", label: "Date", type: "date" },
  { key: "time", label: "Time", type: "text" },
  { key: "venue", label: "Venue", type: "text" },
  { key: "capacity", label: "Capacity", type: "number" },
  { key: "price", label: "Price", type: "number" },
  { key: "description", label: "Description", type: "textarea" },
];

export default function EventDetailFields({
  event,
  editing,
  editData,
  onFieldChange,
}: EventDetailFieldsProps) {
  const formatValue = (key: string, value: any): string => {
    if (value == null || value === "") return "—";
    if (key === "date") {
      try {
        return format(new Date(value), "MMMM d, yyyy");
      } catch {
        return String(value);
      }
    }
    if (key === "price") return `PKR ${Number(value).toLocaleString()}`;
    return String(value);
  };

  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
      <h3
        className="text-[11px] uppercase tracking-[0.15em] text-[var(--text-muted)] mb-5"
        style={{ fontFamily: "var(--font-mono-org)" }}
      >
        Event Details
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        {FIELDS.map((field) => (
          <div
            key={field.key}
            className={field.type === "textarea" ? "md:col-span-2" : ""}
          >
            <label
              className="text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)] mb-1.5 block"
              style={{ fontFamily: "var(--font-mono-org)" }}
            >
              {field.label}
            </label>
            {editing ? (
              field.type === "textarea" ? (
                <textarea
                  value={editData[field.key] ?? ""}
                  onChange={(e) => onFieldChange(field.key, e.target.value)}
                  rows={3}
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-[13px] text-[var(--text-primary)] focus:border-[var(--copper)]/40 focus:outline-none transition-colors resize-none"
                  style={{ fontFamily: "var(--font-body-org)" }}
                />
              ) : (
                <input
                  type={field.type}
                  value={editData[field.key] ?? ""}
                  onChange={(e) => onFieldChange(field.key, e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-[13px] text-[var(--text-primary)] focus:border-[var(--copper)]/40 focus:outline-none transition-colors"
                  style={{ fontFamily: "var(--font-body-org)" }}
                />
              )
            ) : (
              <p
                className="text-[14px] text-[var(--text-primary)]"
                style={{ fontFamily: "var(--font-body-org)" }}
              >
                {formatValue(field.key, event[field.key])}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
