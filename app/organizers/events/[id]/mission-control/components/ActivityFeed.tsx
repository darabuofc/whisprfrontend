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
    <div className="bg-white rounded-2xl shadow-sm p-6 transition-all">
      <div className="flex items-start justify-between mb-6">
        <h3 className="text-xl font-semibold text-neutral-900">Activity Feed</h3>
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
          <Activity className="text-blue-600" size={20} />
        </div>
      </div>

      <div className="space-y-1">
        {activities.map((activity, index) => (
          <div key={activity.id}>
            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors">
              <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center">
                {getIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-neutral-700 font-medium">{activity.text}</p>
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
