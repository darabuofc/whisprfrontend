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
    <div className="bg-whispr-bg/50 border-b border-white/10 relative z-10">
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
                    ? "text-whispr-accent bg-white/5 border-b-2 border-whispr-accent"
                    : "text-whispr-muted hover:text-whispr-text hover:bg-white/5"
                }
              `}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.id === "ops" && isToday && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-whispr-accent/20 text-whispr-accent rounded-full border border-whispr-accent/30">
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
