"use client";

interface StatStripProps {
  totalEvents: number;
  published: number;
  drafts: number;
  totalAttendees: number;
  revenue?: number;
}

function StatItem({
  value,
  label,
  copper,
  animIndex,
}: {
  value: number | string;
  label: string;
  copper?: boolean;
  animIndex: number;
}) {
  return (
    <div className={`stat-animate stat-animate-${animIndex} flex flex-col items-center py-5 px-4`}>
      <span
        className={`text-[40px] leading-none tabular-nums font-medium ${
          copper ? "text-[var(--copper)]" : "text-[var(--text-primary)]"
        }`}
        style={{ fontFamily: "var(--font-display-org)" }}
      >
        {value}
      </span>
      <span
        className="text-[11px] uppercase tracking-[0.10em] text-[var(--text-muted)] mt-2.5"
        style={{ fontFamily: "var(--font-mono-org)", fontWeight: 400 }}
      >
        {label}
      </span>
    </div>
  );
}

export default function StatStrip({
  totalEvents,
  published,
  drafts,
  totalAttendees,
  revenue = 0,
}: StatStripProps) {
  const stats = [
    { value: totalEvents, label: "Total Events", copper: false },
    { value: published, label: "Published", copper: false },
    { value: drafts, label: "Drafts", copper: false },
    { value: totalAttendees, label: "Attendees", copper: true },
    { value: revenue > 0 ? `${revenue.toLocaleString()}` : "0", label: "Revenue", copper: false },
  ];

  return (
    <div className="w-full border border-[var(--border-subtle)] rounded-md bg-[var(--bg-raised)]">
      {/* Desktop: horizontal with vertical dividers */}
      <div className="hidden sm:flex items-center justify-between">
        {stats.map((stat, i) => (
          <div key={stat.label} className="flex items-center flex-1">
            <div className="flex-1">
              <StatItem
                value={stat.value}
                label={stat.label}
                copper={stat.copper}
                animIndex={i + 1}
              />
            </div>
            {i < stats.length - 1 && (
              <div className="w-px h-14 bg-[var(--border-subtle)]" />
            )}
          </div>
        ))}
      </div>

      {/* Mobile: 2x3 grid */}
      <div className="grid grid-cols-2 gap-4 sm:hidden p-2">
        {stats.map((stat, i) => (
          <div key={stat.label} className={i === stats.length - 1 ? "col-span-2" : ""}>
            <StatItem
              value={stat.value}
              label={stat.label}
              copper={stat.copper}
              animIndex={i + 1}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
