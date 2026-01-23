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
    <div className="bg-black/40 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile scroll indicator */}
        <div className="relative">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-3.5 text-sm font-medium whitespace-nowrap transition-all rounded-t-xl
                  ${
                    activeTab === tab.id
                      ? "text-white bg-white/10"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  }
                `}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.id === "ops" && isToday && (
                  <span className="ml-1 px-2 py-0.5 text-xs bg-[#C1FF72]/20 text-[#C1FF72] rounded-full border border-[#C1FF72]/30">
                    LIVE
                  </span>
                )}
              </button>
            ))}
          </div>
          {/* Scroll fade indicator for mobile */}
          <div className="absolute right-0 top-0 bottom-1 w-8 bg-gradient-to-l from-black/40 to-transparent pointer-events-none sm:hidden" />
        </div>
      </div>
    </div>
  );
}
