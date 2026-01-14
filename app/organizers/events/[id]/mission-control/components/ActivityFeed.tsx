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
        return <FileText className="text-blue-600" size={16} />;
      case "approval":
        return <CheckCircle className="text-green-600" size={16} />;
      case "rejection":
        return <UserX className="text-neutral-500" size={16} />;
      case "checkin":
        return <UserCheck className="text-blue-600" size={16} />;
      default:
        return <Activity className="text-neutral-500" size={16} />;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl p-6 transition-all duration-300">
      <div className="flex items-start justify-between mb-6">
        <h3 className="text-xl font-semibold bg-gradient-to-r from-neutral-900 to-neutral-700 bg-clip-text text-transparent">Activity Feed</h3>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center shadow-sm">
          <Activity className="text-blue-600" size={20} />
        </div>
      </div>

      <div className="space-y-1">
        {activities.map((activity, index) => (
          <div key={activity.id}>
            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gradient-to-r hover:from-neutral-50 hover:to-blue-50/30 transition-all duration-200 group">
              <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                {getIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-neutral-700 font-medium group-hover:text-neutral-900 transition-colors">{activity.text}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Clock size={12} className="text-neutral-400" />
                  <span className="text-xs text-neutral-500">
                    {activity.timestamp}
                  </span>
                </div>
              </div>
            </div>
            {index < activities.length - 1 && (
              <div className="ml-8 h-4 w-px bg-neutral-200" />
            )}
          </div>
        ))}
      </div>

      {activities.length === 0 && (
        <div className="text-center py-12">
          <Activity className="text-neutral-300 mx-auto mb-3" size={32} />
          <p className="text-sm text-neutral-500">No recent activity</p>
        </div>
      )}
    </div>
  );
}
