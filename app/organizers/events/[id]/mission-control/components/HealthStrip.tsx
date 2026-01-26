import { Users, Clock, UserX, CheckCircle2, Calendar } from "lucide-react";

interface Stats {
  approved: number;
  pending: number;
  rejected: number;
  checkedIn: number;
  daysLeft: number;
}

interface HealthStripProps {
  stats: Stats;
  isToday: boolean;
  loading?: boolean;
}

export default function HealthStrip({ stats, isToday, loading }: HealthStripProps) {
  if (loading) {
    return (
      <div className="bg-[#0a0a0a]/80 border-b border-white/[0.06] relative z-10">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-5 h-5 bg-white/5 rounded animate-pulse" />
                  <div className="w-10 h-7 bg-white/5 rounded animate-pulse" />
                </div>
                <div className="w-16 h-3 bg-white/5 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0a]/80 border-b border-white/[0.06] relative z-10">
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard
            icon={<Users className="text-emerald-400" size={18} />}
            label="Approved"
            value={stats.approved}
            variant="default"
          />
          <StatCard
            icon={<Clock className="text-amber-400" size={18} />}
            label="Pending"
            value={stats.pending}
            variant={stats.pending > 0 ? "highlight" : "default"}
          />
          <StatCard
            icon={<UserX className="text-red-400/80" size={18} />}
            label="Rejected"
            value={stats.rejected}
            variant="default"
          />
          {isToday && (
            <StatCard
              icon={<CheckCircle2 className="text-cyan-400" size={18} />}
              label="Checked In"
              value={stats.checkedIn}
              variant="default"
            />
          )}
          <StatCard
            icon={<Calendar className="text-violet-400" size={18} />}
            label={isToday ? "Status" : "Days Left"}
            value={isToday ? "LIVE" : stats.daysLeft}
            variant={isToday ? "live" : "default"}
          />
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  variant: "default" | "highlight" | "live";
}

function StatCard({ icon, label, value, variant }: StatCardProps) {
  const getCardStyles = () => {
    switch (variant) {
      case "highlight":
        return "bg-amber-500/[0.06] border-amber-500/20";
      case "live":
        return "bg-emerald-500/[0.06] border-emerald-500/20";
      default:
        return "bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.04]";
    }
  };

  return (
    <div
      className={`relative rounded-xl border p-5 transition-colors duration-200 ${getCardStyles()}`}
    >
      {variant === "live" && (
        <div className="absolute top-4 right-4">
          <div className="w-2 h-2 bg-emerald-400 rounded-full" />
        </div>
      )}
      <div className="flex items-center justify-between mb-3">
        <div className="opacity-80">{icon}</div>
        <div className="text-2xl font-semibold text-white/90 tabular-nums">
          {value}
        </div>
      </div>
      <div className="text-[11px] font-medium text-white/40 uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}
