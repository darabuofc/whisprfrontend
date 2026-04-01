"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Clock, Filter, Users } from "lucide-react";
import { useOnboarding } from "../context/useOnboarding";
import { TooltipOverlay } from "../components/TooltipOverlay";
import { NotificationPreviewCard } from "../components/NotificationPreviewCard";
import { getDemoEventDashboardFixture } from "../fixtures/demo-event-dashboard";
import { trackOnboardingEvent } from "../analytics";
import type { ApplicantDetail } from "../fixtures/applicant-pool";
import type { TooltipConfig, ApplicantAction } from "../context/types";

type FilterType = "all" | "pending" | "approved" | "rejected" | "waitlisted";

export function S3OrganizerTour() {
  const { simulationState, updateSimulationState, advanceStage } =
    useOnboarding();

  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [tooltipStep, setTooltipStep] = useState(0);
  const [notifPreview, setNotifPreview] = useState<{
    type: "approved" | "rejected";
    name: string;
  } | null>(null);

  const dashboard = getDemoEventDashboardFixture();
  const applicants =
    (simulationState.sampledApplicants as ApplicantDetail[]) ?? [];
  const actions = simulationState.applicantActions;
  const actioned = simulationState.applicantsActioned;

  // Filter applicants
  const filteredApplicants = useMemo(() => {
    if (filter === "all") return applicants;
    return applicants.filter((a) => {
      const action = actions[a.registration_id];
      if (filter === "pending") return !action;
      return action === filter;
    });
  }, [applicants, actions, filter]);

  // Handle action on an applicant
  const handleAction = useCallback(
    (applicantId: string, action: ApplicantAction) => {
      const applicant = applicants.find(
        (a) => a.registration_id === applicantId
      );
      if (!applicant) return;

      const newActions = {
        ...actions,
        [applicantId]: action,
      };
      const newActioned = actioned + 1;

      updateSimulationState({
        applicantActions: newActions,
        applicantsActioned: newActioned,
      });

      trackOnboardingEvent("onboarding_s3_applicant_actioned", {
        action,
        applicant_archetype: applicant.archetype,
        action_count: newActioned,
      });

      // Show notification preview
      if (action === "approved" || action === "rejected") {
        setNotifPreview({ type: action, name: applicant.name });
      }

      // Tooltip after first action
      if (newActioned === 1 && tooltipStep === 0) {
        setTooltipStep(1);
      }
      // Tooltip after 3 actions
      if (newActioned === 3 && tooltipStep <= 1) {
        setTooltipStep(2);
      }
    },
    [applicants, actions, actioned, updateSimulationState, tooltipStep]
  );

  // Bulk approve selected
  const handleBulkApprove = useCallback(() => {
    const newActions = { ...actions };
    selectedIds.forEach((id) => {
      if (!newActions[id]) {
        newActions[id] = "approved";
      }
    });

    const newActioned =
      actioned +
      Array.from(selectedIds).filter((id) => !actions[id]).length;

    updateSimulationState({
      applicantActions: newActions,
      applicantsActioned: newActioned,
    });

    trackOnboardingEvent("onboarding_s3_bulk_action_used", {
      count_selected: selectedIds.size,
    });

    setSelectedIds(new Set());
  }, [actions, actioned, selectedIds, updateSimulationState]);

  // Tooltip configs
  const tooltips: (TooltipConfig | null)[] = [
    // Initial tooltip
    {
      id: "s3_queue_intro",
      targetSelector: "[data-onboarding='applicant-queue']",
      title: "Your applicants",
      body: "These are your applicants. Review each one and decide who gets in.",
      placement: "right",
      onDismiss: () => setTooltipStep(-1),
    },
    // After first action
    {
      id: "s3_notification_hint",
      targetSelector: "[data-onboarding='applicant-queue']",
      title: "Instant notifications",
      body: "Notice the notification? That\u2019s what your attendees receive instantly.",
      placement: "right",
      onDismiss: () => setTooltipStep(-1),
    },
    // After 3 actions
    {
      id: "s3_filters_hint",
      targetSelector: "[data-onboarding='filter-bar']",
      title: "Filters & bulk actions",
      body: "You\u2019ve got the hang of it. Try the filters or use bulk approve for efficiency.",
      placement: "bottom",
      onDismiss: () => setTooltipStep(-1),
    },
  ];

  const activeTooltip = tooltipStep >= 0 ? tooltips[tooltipStep] : null;
  const canContinue = actioned >= 3;

  return (
    <div className="pt-[40px] max-w-[900px] mx-auto px-6 py-8">
      {/* Event Dashboard Header */}
      <div className="mb-8">
        <h2
          className="text-[14px] uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-2"
          style={{ fontFamily: "var(--font-display-org, 'Space Grotesk', sans-serif)" }}
        >
          {dashboard.name}
        </h2>
        <div className="flex gap-6 text-[13px]">
          <span className="text-green-400">
            {dashboard.stats.approved} approved
          </span>
          <span className="text-amber-400">
            {dashboard.stats.pending} pending
          </span>
          <span className="text-red-400">
            {dashboard.stats.rejected} rejected
          </span>
        </div>
      </div>

      {/* Filter bar */}
      <div
        data-onboarding="filter-bar"
        className="flex items-center gap-2 mb-6"
      >
        {(
          ["all", "pending", "approved", "rejected", "waitlisted"] as const
        ).map((f) => (
          <button
            key={f}
            onClick={() => {
              setFilter(f);
              if (f !== "all") {
                trackOnboardingEvent("onboarding_s3_filter_used", {
                  filter_type: f,
                });
              }
            }}
            className={`px-3 py-1.5 rounded-full text-[12px] transition-all ${
              filter === f
                ? "bg-[#D4A574] text-[#111]"
                : "bg-white/[0.07] text-[#999] hover:text-white"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}

        {/* Bulk approve */}
        {selectedIds.size > 0 && (
          <button
            onClick={handleBulkApprove}
            className="ml-auto px-4 py-1.5 rounded-full text-[12px] bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all"
          >
            Approve {selectedIds.size} selected
          </button>
        )}
      </div>

      {/* Applicant queue */}
      <div data-onboarding="applicant-queue" className="space-y-3">
        {filteredApplicants.map((applicant) => {
          const action = actions[applicant.registration_id];
          const isSelected = selectedIds.has(applicant.registration_id);

          return (
            <motion.div
              key={applicant.registration_id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl border p-4 transition-all ${
                action
                  ? "border-[#333]/50 opacity-70"
                  : isSelected
                  ? "border-[#D4A574] bg-[#D4A574]/5"
                  : "border-[#333] hover:border-[#444]"
              }`}
              style={{ background: "#1A1A1A" }}
            >
              <div className="flex items-start gap-4">
                {/* Selection checkbox (for pending only) */}
                {!action && (
                  <button
                    onClick={() => {
                      const next = new Set(selectedIds);
                      if (isSelected) next.delete(applicant.registration_id);
                      else next.add(applicant.registration_id);
                      setSelectedIds(next);
                    }}
                    className={`mt-1 w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all ${
                      isSelected
                        ? "border-[#D4A574] bg-[#D4A574]"
                        : "border-[#555]"
                    }`}
                  >
                    {isSelected && (
                      <Check className="w-3 h-3 text-[#111]" />
                    )}
                  </button>
                )}

                {/* Avatar */}
                <img
                  src={applicant.profile_picture}
                  alt={applicant.name}
                  className="w-10 h-10 rounded-full flex-shrink-0"
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[14px] text-white font-medium truncate">
                      {applicant.name}
                    </p>
                    {applicant.has_mutual_connection && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                        Mutual
                      </span>
                    )}
                    {applicant.is_repeat_attendee && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D4A574]/20 text-[#D4A574]">
                        Repeat
                      </span>
                    )}
                  </div>

                  <p className="text-[12px] text-[#999] mt-0.5">
                    {applicant.profession} &bull; {applicant.age} &bull;{" "}
                    {applicant.instagram}
                  </p>

                  {/* Screening answers */}
                  <div className="mt-3 space-y-2">
                    {applicant.screening_answers.map((sa, i) => (
                      <div key={i}>
                        <p className="text-[11px] text-[#666]">
                          {sa.question}
                        </p>
                        <p className="text-[12px] text-[#CCC]">{sa.answer}</p>
                      </div>
                    ))}
                  </div>

                  {/* Action status */}
                  {action && (
                    <p
                      className={`text-[12px] mt-3 font-medium ${
                        action === "approved"
                          ? "text-green-400"
                          : action === "rejected"
                          ? "text-red-400"
                          : "text-amber-400"
                      }`}
                    >
                      {action.charAt(0).toUpperCase() + action.slice(1)}
                    </p>
                  )}
                </div>

                {/* Action buttons */}
                {!action && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() =>
                        handleAction(applicant.registration_id, "approved")
                      }
                      className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-all"
                      title="Approve"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        handleAction(applicant.registration_id, "rejected")
                      }
                      className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                      title="Reject"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        handleAction(applicant.registration_id, "waitlisted")
                      }
                      className="p-2 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-all"
                      title="Waitlist"
                    >
                      <Clock className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Continue button (after 3+ actions) */}
      <AnimatePresence>
        {canContinue && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 text-center"
          >
            <button
              onClick={() => advanceStage("S3", "S4")}
              className="px-8 py-3 rounded-full text-[14px] font-medium text-[#111] transition-opacity hover:opacity-90"
              style={{ background: "#D4A574" }}
            >
              Continue
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tooltip overlay */}
      <TooltipOverlay
        tooltip={activeTooltip}
        onDismiss={() => {
          if (activeTooltip?.onDismiss) activeTooltip.onDismiss();
        }}
      />

      {/* Notification preview */}
      <NotificationPreviewCard
        visible={!!notifPreview}
        type={notifPreview?.type ?? "approved"}
        attendeeName={notifPreview?.name ?? ""}
        onDismiss={() => setNotifPreview(null)}
      />
    </div>
  );
}
