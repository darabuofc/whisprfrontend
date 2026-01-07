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
        return <FileText className="text-blue-400" size={16} />;
      case "approval":
        return <CheckCircle className="text-green-400" size={16} />;
      case "rejection":
        return <UserX className="text-red-400" size={16} />;
      case "checkin":
        return <UserCheck className="text-cyan-400" size={16} />;
      default:
        return <Activity className="text-gray-400" size={16} />;
    }
  };

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:bg-gray-900/70 transition-all">
      <div className="flex items-start justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Activity Feed</h3>
        <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
          <Activity className="text-cyan-400" size={20} />
        </div>
      </div>

      <div className="space-y-1">
        {activities.map((activity, index) => (
          <div key={activity.id}>
            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-800/50 transition-colors">
              <div className="mt-0.5 flex-shrink-0">
                {getIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-200">{activity.text}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Clock size={12} className="text-gray-500" />
                  <span className="text-xs text-gray-500">
                    {activity.timestamp}
                  </span>
                </div>
              </div>
            </div>
            {index < activities.length - 1 && (
              <div className="ml-6 h-6 w-px bg-gray-800" />
            )}
          </div>
        ))}
      </div>

      {activities.length === 0 && (
        <div className="text-center py-8">
          <Activity className="text-gray-600 mx-auto mb-2" size={32} />
          <p className="text-sm text-gray-500">No recent activity</p>
        </div>
      )}
    </div>
  );
}
