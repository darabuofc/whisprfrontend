"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, Ticket, Tag, FileQuestion, CreditCard } from "lucide-react";
import GeneralSettingsTab from "./GeneralSettingsTab";
import PassTypesTab from "./PassTypesTab";
import DiscountCodesTab from "./DiscountCodesTab";
import RegistrationQuestionsTab from "./RegistrationQuestionsTab";
import PaymentSettingsTab from "./PaymentSettingsTab";

type SettingsSubTab = "general" | "passes" | "discounts" | "questions" | "payments";

interface SettingsTabProps {
  eventId: string;
}

export default function SettingsTab({ eventId }: SettingsTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<SettingsSubTab>("general");

  const subTabs = [
    {
      id: "general" as SettingsSubTab,
      label: "General",
      icon: <Settings size={18} />,
      description: "Event details & configuration",
    },
    {
      id: "passes" as SettingsSubTab,
      label: "Pass Types",
      icon: <Ticket size={18} />,
      description: "Manage ticket types & pricing",
    },
    {
      id: "discounts" as SettingsSubTab,
      label: "Discount Codes",
      icon: <Tag size={18} />,
      description: "Create promotional codes",
    },
    {
      id: "questions" as SettingsSubTab,
      label: "Screening Questions",
      icon: <FileQuestion size={18} />,
      description: "Registration form questions",
    },
    {
      id: "payments" as SettingsSubTab,
      label: "Payments",
      icon: <CreditCard size={18} />,
      description: "Payment configuration",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Subtab Navigation */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-2">
        <div className="flex flex-wrap gap-2">
          {subTabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300
                ${
                  activeSubTab === tab.id
                    ? "bg-gradient-to-r from-[#C1FF72]/20 to-[#C1FF72]/5 text-white border border-[#C1FF72]/30"
                    : "text-white/50 hover:text-white/80 hover:bg-white/[0.04]"
                }
              `}
            >
              <span
                className={`transition-colors duration-300 ${
                  activeSubTab === tab.id ? "text-[#C1FF72]" : "text-white/40"
                }`}
              >
                {tab.icon}
              </span>
              <div className="text-left">
                <div className="font-medium">{tab.label}</div>
                <div className="text-[10px] text-white/30 hidden sm:block">{tab.description}</div>
              </div>
              {activeSubTab === tab.id && (
                <motion.div
                  layoutId="activeSubTabIndicator"
                  className="absolute inset-0 rounded-xl border border-[#C1FF72]/20"
                  style={{ zIndex: -1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Subtab Content */}
      <motion.div
        key={activeSubTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeSubTab === "general" && <GeneralSettingsTab eventId={eventId} />}
        {activeSubTab === "passes" && <PassTypesTab eventId={eventId} />}
        {activeSubTab === "discounts" && <DiscountCodesTab eventId={eventId} />}
        {activeSubTab === "questions" && <RegistrationQuestionsTab eventId={eventId} />}
        {activeSubTab === "payments" && <PaymentSettingsTab eventId={eventId} />}
      </motion.div>
    </div>
  );
}
