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
    <div className="bg-gray-900/50 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
          <StatCard
            icon={<Users className="text-green-400" size={24} />}
            label="Attendees"
            value={stats.approved}
            color="green"
          />
          <StatCard
            icon={<Clock className="text-amber-400" size={24} />}
            label="Pending"
            value={stats.pending}
            color="amber"
            highlight={stats.pending > 0}
          />
          <StatCard
            icon={<UserX className="text-red-400" size={24} />}
            label="Rejected"
            value={stats.rejected}
            color="red"
          />
          {isToday && (
            <StatCard
              icon={<CheckCircle2 className="text-cyan-400" size={24} />}
              label="Checked In"
              value={stats.checkedIn}
              color="cyan"
            />
          )}
          <StatCard
            icon={<Calendar className="text-purple-400" size={24} />}
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
    if (highlight) return "bg-amber-500/10 border-amber-500/30";
    return "bg-gray-800/40 border-gray-700/50";
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl border ${getBgColor()} p-4 transition-all hover:bg-gray-800/60`}
    >
      {isLive && (
        <div className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full animate-pulse mt-2 mr-2" />
      )}
      <div className="flex items-center justify-between mb-2">
        {icon}
        <div className={`text-3xl font-bold text-white`}>{value}</div>
      </div>
      <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">
        {label}
      </div>
      {highlight && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
      )}
    </div>
  );
}
