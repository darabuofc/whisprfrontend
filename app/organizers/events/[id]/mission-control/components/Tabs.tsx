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
      icon: <LayoutDashboard size={16} />,
    },
    {
      id: "approvals" as TabType,
      label: "Approvals",
      icon: <ClipboardCheck size={16} />,
    },
    {
      id: "attendees" as TabType,
      label: "Attendees",
      icon: <Users size={16} />,
    },
    ...(isToday
      ? [
          {
            id: "ops" as TabType,
            label: "Ops Mode",
            icon: <Zap size={16} />,
          },
        ]
      : []),
    {
      id: "settings" as TabType,
      label: "Settings",
      icon: <Settings size={16} />,
    },
  ];

  return (
    <div className="bg-[#0a0a0a]/80 border-b border-white/[0.06] relative z-10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors
                ${
                  activeTab === tab.id
                    ? "text-white border-b-2 border-white"
                    : "text-white/40 hover:text-white/70 border-b-2 border-transparent"
                }
              `}
            >
              <span className={activeTab === tab.id ? "opacity-100" : "opacity-60"}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
              {tab.id === "ops" && isToday && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-emerald-500/10 text-emerald-400 rounded-full">
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
