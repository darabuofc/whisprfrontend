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
    <div className="bg-white border-b border-neutral-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-3.5 text-sm font-medium whitespace-nowrap transition-all rounded-t-xl
                ${
                  activeTab === tab.id
                    ? "text-neutral-900 bg-neutral-50"
                    : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50/50"
                }
              `}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.id === "ops" && isToday && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-full">
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
