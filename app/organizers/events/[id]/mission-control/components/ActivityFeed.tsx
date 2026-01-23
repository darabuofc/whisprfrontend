import {
  FileText,
  CheckCircle,
  UserCheck,
  UserX,
  Clock,
  Activity,
} from "lucide-react";

interface ActivityItem {
  id: number;
  type: "submission" | "approval" | "rejection" | "checkin";
  text: string;
  timestamp: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  const getIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "submission":
        return <FileText className="text-[#B472FF]" size={16} />;
      case "approval":
        return <CheckCircle className="text-[#C1FF72]" size={16} />;
      case "rejection":
        return <UserX className="text-red-400" size={16} />;
      case "checkin":
        return <UserCheck className="text-cyan-400" size={16} />;
      default:
        return <Activity className="text-white/50" size={16} />;
    }
  };

  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:border-white/20">
      <div className="flex items-start justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Activity Feed</h3>
        <div className="w-10 h-10 rounded-xl bg-[#B472FF]/20 border border-[#B472FF]/30 flex items-center justify-center">
          <Activity className="text-[#B472FF]" size={20} />
        </div>
      </div>

      <div className="space-y-1">
        {activities.map((activity, index) => (
          <div key={activity.id}>
            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-all duration-200 group">
              <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                {getIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white/70 font-medium group-hover:text-white transition-colors">{activity.text}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Clock size={12} className="text-white/40" />
                  <span className="text-xs text-white/50">
                    {activity.timestamp}
                  </span>
                </div>
              </div>
            </div>
            {index < activities.length - 1 && (
              <div className="ml-8 h-4 w-px bg-white/10" />
            )}
          </div>
        ))}
      </div>

      {activities.length === 0 && (
        <div className="text-center py-12">
          <Activity className="text-white/20 mx-auto mb-3" size={32} />
          <p className="text-sm text-white/50">No recent activity</p>
        </div>
      )}
    </div>
  );
}
