import { LayoutDashboard, ClipboardCheck, Users, Zap, Settings } from "lucide-react";

type TabType = "overview" | "approvals" | "attendees" | "ops" | "settings";

interface TabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isToday: boolean;
}

export default function Tabs({ activeTab, onTabChange, isToday }: TabsProps) {
  const tabs = [
    {
      id: "overview" as TabType,
      label: "Overview",
      icon: <LayoutDashboard size={18} />,
    },
    {
      id: "approvals" as TabType,
      label: "Approvals",
      icon: <ClipboardCheck size={18} />,
    },
    {
      id: "attendees" as TabType,
      label: "Attendees",
      icon: <Users size={18} />,
    },
    ...(isToday
      ? [
          {
            id: "ops" as TabType,
            label: "Ops Mode",
            icon: <Zap size={18} />,
          },
        ]
      : []),
    {
      id: "settings" as TabType,
      label: "Settings",
      icon: <Settings size={18} />,
    },
  ];

  return (
    <div className="bg-gray-900/30 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap transition-all
                ${
                  activeTab === tab.id
                    ? "text-white border-b-2 border-cyan-400 bg-gray-800/50"
                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/30"
                }
              `}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.id === "ops" && isToday && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
                  LIVE
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
