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
    <div className={`stat-animate stat-animate-${animIndex} flex flex-col items-center py-4 px-3`}>
      <span
        className={`text-[36px] leading-none tabular-nums ${
          copper ? "text-[var(--copper)]" : "text-[var(--text-primary)]"
        }`}
        style={{ fontFamily: "var(--font-display-org)" }}
      >
        {value}
      </span>
      <span
        className="text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)] mt-2"
        style={{ fontFamily: "var(--font-body-org)", fontWeight: 400 }}
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
    { value: totalAttendees, label: "Total Attendees", copper: true },
    { value: revenue > 0 ? `${revenue.toLocaleString()}` : "0", label: "Revenue", copper: false },
  ];

  return (
    <div className="w-full">
      {/* Desktop: horizontal with vertical dividers */}
      <div className="hidden sm:flex items-center justify-between">
        {stats.map((stat, i) => (
          <div key={stat.label} className="flex items-center">
            <StatItem
              value={stat.value}
              label={stat.label}
              copper={stat.copper}
              animIndex={i + 1}
            />
            {i < stats.length - 1 && (
              <div className="w-px h-12 bg-[var(--border-subtle)] mx-2" />
            )}
          </div>
        ))}
      </div>

      {/* Mobile: 2x3 grid */}
      <div className="grid grid-cols-2 gap-4 sm:hidden">
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
