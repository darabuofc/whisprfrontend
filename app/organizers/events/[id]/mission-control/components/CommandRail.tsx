"use client";

import { ClipboardCheck, Users, Activity, Settings, ListTodo } from "lucide-react";

interface CommandRailProps {
  activeView: "queue" | "approvals" | "attendees" | "log" | "settings";
  onViewChange: (view: "queue" | "approvals" | "attendees" | "log" | "settings") => void;
}

export default function CommandRail({ activeView, onViewChange }: CommandRailProps) {
  const items = [
    { id: "queue" as const, icon: ListTodo, label: "Operations Queue" },
    { id: "approvals" as const, icon: ClipboardCheck, label: "Approvals" },
    { id: "attendees" as const, icon: Users, label: "Attendees" },
    { id: "log" as const, icon: Activity, label: "System Log" },
  ];

  return (
    <div className="fixed left-0 top-12 bottom-0 w-16 bg-[#0F0F0F] border-r border-[#1A1A1A] z-40 flex flex-col">
      <div className="flex-1 py-4">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`
                w-full h-16 flex items-center justify-center relative
                transition-colors
                ${isActive ? "text-[#F59E0B]" : "text-[#6B7280] hover:text-[#9CA3AF]"}
              `}
              title={item.label}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#F59E0B]" />
              )}
              <Icon size={24} strokeWidth={1.5} />
            </button>
          );
        })}
      </div>

      {/* Settings at bottom */}
      <div className="border-t border-[#1A1A1A]">
        <button
          onClick={() => onViewChange("settings")}
          className={`
            w-full h-16 flex items-center justify-center relative
            transition-colors
            ${activeView === "settings" ? "text-[#F59E0B]" : "text-[#6B7280] hover:text-[#9CA3AF]"}
          `}
          title="Settings"
        >
          {activeView === "settings" && (
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#F59E0B]" />
          )}
          <Settings size={24} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
