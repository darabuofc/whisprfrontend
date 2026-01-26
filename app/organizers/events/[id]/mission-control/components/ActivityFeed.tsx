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
        return <FileText className="text-violet-400" size={14} />;
      case "approval":
        return <CheckCircle className="text-emerald-400" size={14} />;
      case "rejection":
        return <UserX className="text-red-400" size={14} />;
      case "checkin":
        return <UserCheck className="text-cyan-400" size={14} />;
      default:
        return <Activity className="text-white/40" size={14} />;
    }
  };

  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-white/90">Activity</h3>
          <p className="text-sm text-white/40 mt-1">Recent actions and events</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
          <Activity className="text-violet-400" size={18} />
        </div>
      </div>

      {activities.length > 0 ? (
        <div className="space-y-1">
          {activities.map((activity, index) => (
            <div key={activity.id}>
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/[0.02] transition-colors">
                <div className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-lg bg-white/[0.04] flex items-center justify-center">
                  {getIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/70">{activity.text}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Clock size={11} className="text-white/30" />
                    <span className="text-xs text-white/30">
                      {activity.timestamp}
                    </span>
                  </div>
                </div>
              </div>
              {index < activities.length - 1 && (
                <div className="ml-[22px] h-3 w-px bg-white/[0.04]" />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <div className="w-12 h-12 rounded-xl bg-white/[0.02] flex items-center justify-center mx-auto mb-3">
            <Activity className="text-white/20" size={20} />
          </div>
          <p className="text-sm text-white/40">No recent activity</p>
          <p className="text-xs text-white/20 mt-1">Actions will appear here</p>
        </div>
      )}
    </div>
  );
}
