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
}

export default function HealthStrip({ stats, isToday }: HealthStripProps) {
  return (
    <div className="bg-whispr-bg/50 border-b border-white/10 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5 lg:gap-6">
          <StatCard
            icon={<Users className="text-whispr-accent" size={22} />}
            label="Attendees"
            value={stats.approved}
            color="green"
          />
          <StatCard
            icon={<Clock className="text-amber-400" size={22} />}
            label="Pending"
            value={stats.pending}
            color="amber"
            highlight={stats.pending > 0}
          />
          <StatCard
            icon={<UserX className="text-red-400" size={22} />}
            label="Rejected"
            value={stats.rejected}
            color="red"
          />
          {isToday && (
            <StatCard
              icon={<CheckCircle2 className="text-cyan-400" size={22} />}
              label="Checked In"
              value={stats.checkedIn}
              color="cyan"
            />
          )}
          <StatCard
            icon={<Calendar className="text-whispr-purple" size={22} />}
            label={isToday ? "LIVE NOW" : "Days to Event"}
            value={isToday ? "LIVE" : stats.daysLeft}
            color="purple"
            isLive={isToday}
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
  color: "green" | "amber" | "red" | "cyan" | "purple";
  highlight?: boolean;
  isLive?: boolean;
}

function StatCard({
  icon,
  label,
  value,
  color,
  highlight,
  isLive,
}: StatCardProps) {
  const getBgColor = () => {
    if (highlight) return "bg-amber-500/10 ring-1 ring-amber-500/30";
    return "bg-white/5";
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl ${getBgColor()} p-5 transition-all duration-300 hover:scale-[1.02] hover:bg-white/10 group cursor-pointer border border-white/10`}
    >
      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

      {isLive && (
        <div className="absolute top-0 right-0 flex items-center gap-1.5 mt-3 mr-3">
          <div className="w-2 h-2 bg-whispr-accent rounded-full animate-pulse" />
        </div>
      )}
      <div className="flex items-center justify-between mb-3 relative z-10">
        {icon}
        <div className="text-3xl font-semibold text-whispr-text">{value}</div>
      </div>
      <div className="text-xs font-medium text-whispr-muted uppercase tracking-wider relative z-10">
        {label}
      </div>
    </div>
  );
}
