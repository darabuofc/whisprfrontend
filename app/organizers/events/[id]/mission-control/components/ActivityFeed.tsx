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
        return <FileText className="text-whispr-purple" size={16} />;
      case "approval":
        return <CheckCircle className="text-whispr-accent" size={16} />;
      case "rejection":
        return <UserX className="text-red-400" size={16} />;
      case "checkin":
        return <UserCheck className="text-cyan-400" size={16} />;
      default:
        return <Activity className="text-whispr-muted" size={16} />;
    }
  };

  return (
    <div className="glass rounded-2xl p-6 transition-all duration-300 hover:bg-white/10">
      <div className="flex items-start justify-between mb-6">
        <h3 className="text-xl font-semibold text-whispr-text">Activity Feed</h3>
        <div className="w-10 h-10 rounded-xl bg-whispr-purple/10 flex items-center justify-center border border-whispr-purple/20">
          <Activity className="text-whispr-purple" size={20} />
        </div>
      </div>

      <div className="space-y-1">
        {activities.map((activity, index) => (
          <div key={activity.id}>
            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-all duration-200 group">
              <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-200 border border-white/10">
                {getIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-whispr-text/80 font-medium group-hover:text-whispr-text transition-colors">{activity.text}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Clock size={12} className="text-whispr-muted" />
                  <span className="text-xs text-whispr-muted">
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
          <Activity className="text-whispr-muted/30 mx-auto mb-3" size={32} />
          <p className="text-sm text-whispr-muted">No recent activity</p>
        </div>
      )}
    </div>
  );
}
