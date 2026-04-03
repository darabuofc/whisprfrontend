"use client";

import { useState } from "react";
import { Search, Link, PenLine, CheckCircle2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import SearchTab from "./SearchTab";
import JoinCodeTab from "./JoinCodeTab";
import ManualTab from "./ManualTab";

interface AddPlusOneSectionProps {
  registrationId: string;
  joinCode: string;
  onGuestAdded: () => void;
}

interface InvitedUser {
  name: string;
  avatar_url: string | null;
}

const tabs = [
  { key: "search" as const, label: "Search", icon: Search },
  { key: "joincode" as const, label: "Join Code", icon: Link },
  { key: "manual" as const, label: "Manual", icon: PenLine },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
}

export default function AddPlusOneSection({
  registrationId,
  joinCode,
  onGuestAdded,
}: AddPlusOneSectionProps) {
  const [activeTab, setActiveTab] = useState<"search" | "joincode" | "manual">("search");
  const [invitedUser, setInvitedUser] = useState<InvitedUser | null>(null);

  const handleGuestAdded = (user: { name: string; avatar_url: string | null }) => {
    setInvitedUser(user);
    onGuestAdded();
  };

  if (invitedUser) {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-black/20 p-3 mb-3">
        <div className="flex items-center gap-3">
          {invitedUser.avatar_url ? (
            <img
              src={invitedUser.avatar_url}
              alt={invitedUser.name}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#D4A574]/15 flex items-center justify-center text-sm font-semibold text-[#D4A574] flex-shrink-0">
              {getInitials(invitedUser.name)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{invitedUser.name}</p>
            <p className="text-[11px] text-neutral-500">Invited</p>
          </div>
          <CheckCircle2 size={18} className="text-[#D4A574] flex-shrink-0" />
        </div>
      </div>
    );
  }

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
            <SearchTab registrationId={registrationId} onGuestAdded={handleGuestAdded} />
          )}
          {activeTab === "joincode" && <JoinCodeTab joinCode={joinCode} />}
          {activeTab === "manual" && (
            <ManualTab registrationId={registrationId} onGuestAdded={handleGuestAdded} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
