"use client";

import { useState } from "react";
import { Search, Link, PenLine } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import SearchTab from "./SearchTab";
import JoinCodeTab from "./JoinCodeTab";
import ManualTab from "./ManualTab";

interface AddPlusOneSectionProps {
  registrationId: string;
  joinCode: string;
  onGuestAdded: () => void;
}

const tabs = [
  { key: "search" as const, label: "Search", icon: Search },
  { key: "joincode" as const, label: "Join Code", icon: Link },
  { key: "manual" as const, label: "Manual", icon: PenLine },
];

export default function AddPlusOneSection({
  registrationId,
  joinCode,
  onGuestAdded,
}: AddPlusOneSectionProps) {
  const [activeTab, setActiveTab] = useState<"search" | "joincode" | "manual">("search");

  return (
    <div className="rounded-xl border border-white/[0.06] bg-black/20 p-3 space-y-3 mb-3">
      {/* Header */}
      <div>
        <h4 className="text-sm font-semibold text-white">Add your +1</h4>
        <p className="text-[11px] text-neutral-500 mt-0.5">
          Find them on Whispr, share your join code, or enter their details
        </p>
      </div>

      {/* Tab tiles */}
      <div className="flex gap-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-medium border transition-all duration-200 ${
                isActive
                  ? "bg-[#D4A574]/[0.08] border-[#D4A574]/20 text-[#D4A574]"
                  : "bg-white/[0.04] border-white/[0.06] text-neutral-500 hover:text-neutral-400 hover:bg-white/[0.06]"
              }`}
            >
              <Icon size={13} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
        >
          {activeTab === "search" && (
            <SearchTab registrationId={registrationId} onGuestAdded={onGuestAdded} />
          )}
          {activeTab === "joincode" && <JoinCodeTab joinCode={joinCode} />}
          {activeTab === "manual" && (
            <ManualTab registrationId={registrationId} onGuestAdded={onGuestAdded} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
