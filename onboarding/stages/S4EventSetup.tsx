"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOnboarding } from "../context/useOnboarding";
import { ChoiceScreen } from "../components/ChoiceScreen";
import { TooltipOverlay } from "../components/TooltipOverlay";
import { TransitionScreen } from "../components/TransitionScreen";
import { createOnboardingDraftEvent } from "@/lib/onboardingApi";
import { trackOnboardingEvent } from "../analytics";
import { toast } from "sonner";
import type { TooltipConfig } from "../context/types";

type S4Phase = "choice" | "guided" | "success";

export function S4EventSetup({
  orgName,
}: {
  orgName?: string;
}) {
  const { advanceStage, skipStage, updateSimulationState } = useOnboarding();
  const [phase, setPhase] = useState<S4Phase>("choice");
  const [submitting, setSubmitting] = useState(false);
  const [tooltipIdx, setTooltipIdx] = useState(0);
  const choiceScreenStart = Date.now();

  // Form state for guided setup
  const [eventForm, setEventForm] = useState({
    name: orgName ? `${orgName} Presents: ` : "",
    date: "",
    location: "",
    description: "",
    dress_code: "",
  });

  async function handleGuided() {
    trackOnboardingEvent("onboarding_s4_choice_made", {
      choice: "guided",
      time_on_screen_seconds: Math.round(
        (Date.now() - choiceScreenStart) / 1000
      ),
    });
    updateSimulationState({ guidedSetupChosen: true });
    setPhase("guided");
  }

  async function handleSkip() {
    trackOnboardingEvent("onboarding_s4_choice_made", {
      choice: "skip",
      time_on_screen_seconds: Math.round(
        (Date.now() - choiceScreenStart) / 1000
      ),
    });
    updateSimulationState({ guidedSetupChosen: false });

    try {
      // Both calls fire in parallel
      await Promise.all([
        skipStage("S4", "S5"),
        createOnboardingDraftEvent(null, false),
      ]);
    } catch (err) {
      toast.error("Failed to create draft event. Please try again.");
    }
  }

  async function handleSubmitEvent() {
    if (!eventForm.name.trim()) return;
    setSubmitting(true);

    try {
      await createOnboardingDraftEvent(eventForm, true);
      setPhase("success");
    } catch (err) {
      toast.error("Failed to create draft event. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSuccessContinue() {
    await advanceStage("S4", "S5");
  }

  // Guided setup tooltips
  const guidedTooltips: (TooltipConfig | null)[] = [
    {
      id: "s4_event_name",
      targetSelector: "[data-onboarding='event-name']",
      title: "Name your event",
      body: "This is what attendees see first. Make it memorable.",
      placement: "right",
      sequence: { group: "s4_guided", index: 1, total: 3 },
      onDismiss: () => setTooltipIdx(1),
    },
    {
      id: "s4_event_date",
      targetSelector: "[data-onboarding='event-date']",
      title: "Pick a date",
      body: "Your event goes live as soon as you publish. Draft it now, publish when ready.",
      placement: "right",
      sequence: { group: "s4_guided", index: 2, total: 3 },
      onDismiss: () => setTooltipIdx(2),
    },
    {
      id: "s4_event_location",
      targetSelector: "[data-onboarding='event-location']",
      title: "Set the venue",
      body: "You can keep it undisclosed until closer to the event \u2014 builds anticipation.",
      placement: "right",
      sequence: { group: "s4_guided", index: 3, total: 3 },
      onDismiss: () => setTooltipIdx(-1),
    },
  ];

  const activeTooltip =
    phase === "guided" && tooltipIdx >= 0 ? guidedTooltips[tooltipIdx] : null;

  return (
    <div className="pt-[40px]">
      <AnimatePresence mode="wait">
        {phase === "choice" && (
          <motion.div key="choice" exit={{ opacity: 0 }}>
            <ChoiceScreen onGuided={handleGuided} onSkip={handleSkip} />
          </motion.div>
        )}

        {phase === "guided" && (
          <motion.div
            key="guided"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="max-w-[600px] mx-auto px-6 py-8"
          >
            <h2
              className="text-[14px] uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-2"
              style={{ fontFamily: "var(--font-display-org, 'Space Grotesk', sans-serif)" }}
            >
              Create Your Event
            </h2>
            <p className="text-[13px] text-[#666] mb-8">
              This creates a real draft event. You can edit everything later.
            </p>

            <div className="space-y-5">
              {/* Event name */}
              <div data-onboarding="event-name">
                <label className="block text-[13px] text-[#CCC] mb-2">
                  Event name
                </label>
                <input
                  type="text"
                  value={eventForm.name}
                  onChange={(e) =>
                    setEventForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-[#333] bg-white/[0.07] px-4 py-3 text-[14px] text-white placeholder:text-[#666] focus:border-[#D4A574] focus:outline-none focus:ring-1 focus:ring-[#D4A574]/50 transition-all"
                  placeholder="Your event name"
                />
              </div>

              {/* Date */}
              <div data-onboarding="event-date">
                <label className="block text-[13px] text-[#CCC] mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={eventForm.date}
                  onChange={(e) =>
                    setEventForm((prev) => ({
                      ...prev,
                      date: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-[#333] bg-white/[0.07] px-4 py-3 text-[14px] text-white placeholder:text-[#666] focus:border-[#D4A574] focus:outline-none focus:ring-1 focus:ring-[#D4A574]/50 transition-all"
                />
              </div>

              {/* Location */}
              <div data-onboarding="event-location">
                <label className="block text-[13px] text-[#CCC] mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={eventForm.location}
                  onChange={(e) =>
                    setEventForm((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-[#333] bg-white/[0.07] px-4 py-3 text-[14px] text-white placeholder:text-[#666] focus:border-[#D4A574] focus:outline-none focus:ring-1 focus:ring-[#D4A574]/50 transition-all"
                  placeholder="Venue or 'Undisclosed'"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[13px] text-[#CCC] mb-2">
                  Description
                </label>
                <textarea
                  value={eventForm.description}
                  onChange={(e) =>
                    setEventForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={4}
                  className="w-full rounded-lg border border-[#333] bg-white/[0.07] px-4 py-3 text-[14px] text-white placeholder:text-[#666] focus:border-[#D4A574] focus:outline-none focus:ring-1 focus:ring-[#D4A574]/50 transition-all resize-none"
                  placeholder="Tell attendees what to expect..."
                />
              </div>

              {/* Dress code */}
              <div>
                <label className="block text-[13px] text-[#CCC] mb-2">
                  Dress code{" "}
                  <span className="text-[#666]">(optional)</span>
                </label>
                <input
                  type="text"
                  value={eventForm.dress_code}
                  onChange={(e) =>
                    setEventForm((prev) => ({
                      ...prev,
                      dress_code: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-[#333] bg-white/[0.07] px-4 py-3 text-[14px] text-white placeholder:text-[#666] focus:border-[#D4A574] focus:outline-none focus:ring-1 focus:ring-[#D4A574]/50 transition-all"
                  placeholder="e.g., All black. No exceptions."
                />
              </div>
            </div>

            <button
              onClick={handleSubmitEvent}
              disabled={!eventForm.name.trim() || submitting}
              className="mt-8 w-full py-3.5 rounded-lg text-[14px] font-medium text-[#111] transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "#D4A574" }}
            >
              {submitting ? "Creating..." : "Save as Draft"}
            </button>

            <TooltipOverlay
              tooltip={activeTooltip}
              onDismiss={() => {
                if (activeTooltip?.onDismiss) activeTooltip.onDismiss();
              }}
            />
          </motion.div>
        )}

        {phase === "success" && (
          <motion.div key="success" exit={{ opacity: 0 }}>
            <TransitionScreen
              title="Your event is saved as a draft"
              subtitle="When you're ready, hit Publish."
              ctaLabel="Continue to dashboard"
              onAdvance={handleSuccessContinue}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
