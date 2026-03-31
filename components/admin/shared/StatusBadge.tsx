"use client";

interface StatusBadgeProps {
  status: string;
}

const STATUS_STYLES: Record<string, string> = {
  live: "bg-emerald-500/10 text-emerald-400",
  active: "bg-emerald-500/10 text-emerald-400",
  published: "bg-emerald-500/10 text-emerald-400",
  draft: "bg-white/[0.06] text-white/40",
  pending: "bg-amber-500/10 text-amber-400",
  ended: "bg-white/[0.04] text-white/30",
  completed: "bg-white/[0.04] text-white/30",
  cancelled: "bg-red-500/10 text-red-400",
  suspended: "bg-red-500/10 text-red-400",
  paused: "bg-amber-500/10 text-amber-400",
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = status.toLowerCase();
  const style = STATUS_STYLES[normalized] ?? "bg-white/[0.06] text-white/40";

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] uppercase tracking-[0.08em] font-medium ${style}`}
      style={{ fontFamily: "var(--font-mono-org)" }}
    >
      {status}
    </span>
  );
}
