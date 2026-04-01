"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown, Check, SkipForward, X } from "lucide-react";
import { useOnboarding } from "../context/useOnboarding";
import { STAGE_META, STAGE_ORDER } from "../context/types";
import type { Stage } from "../context/types";

export function ProgressWidget() {
  const {
    currentStage,
    completedStages,
    skippedStages,
    tooltipState,
    navigateBack,
    skipStage,
    advanceStage,
    batchDismissTooltips,
  } = useOnboarding();

  const [expanded, setExpanded] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        expanded &&
        widgetRef.current &&
        !widgetRef.current.contains(e.target as Node)
      ) {
        setExpanded(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [expanded]);

  if (!currentStage || currentStage === "S6") return null;

  // Progress calculation (exclude S6)
  const displayStages = STAGE_ORDER.filter((s) => s !== "S6");
  const completedCount = displayStages.filter(
    (s) => completedStages.includes(s) || skippedStages.includes(s)
  ).length;
  const progress = completedCount / displayStages.length;

  const currentMeta = STAGE_META[currentStage];
  const currentIdx = STAGE_ORDER.indexOf(currentStage);
  const nextStage =
    currentIdx < STAGE_ORDER.length - 1 ? STAGE_ORDER[currentIdx + 1] : null;

  // Determine "Next" action text
  function getNextAction(): string {
    if (!nextStage) return "Almost done";
    return STAGE_META[nextStage]?.label ?? "Next step";
  }

  // Handle skip for a stage
  async function handleSkip(stage: Stage) {
    const idx = STAGE_ORDER.indexOf(stage);
    const next = idx < STAGE_ORDER.length - 1 ? STAGE_ORDER[idx + 1] : "S6";

    // Skipping S2 auto-skips S3
    if (stage === "S2") {
      await skipStage("S2", "S3");
      await skipStage("S3", "S4");
    } else {
      await skipStage(stage, next as Stage);
    }
  }

  // Handle skip to dashboard
  async function handleSkipToDashboard() {
    // Skip all remaining stages
    let stage = currentStage;
    while (stage && stage !== "S6") {
      const idx = STAGE_ORDER.indexOf(stage);
      const next = STAGE_ORDER[idx + 1] as Stage;
      if (STAGE_META[stage].skippable) {
        await skipStage(stage, next);
      } else {
        await advanceStage(stage, next);
      }
      stage = next;
    }
  }

  // Handle dismiss all tooltips (S5)
  async function handleDismissAllTooltips() {
    const remaining = Object.entries(tooltipState)
      .filter(([, dismissed]) => !dismissed)
      .map(([id]) => id);
    if (remaining.length > 0) {
      await batchDismissTooltips(remaining);
    }
  }

  return (
    <motion.div
      ref={widgetRef}
      className="fixed z-[1000]"
      style={{ bottom: 16, left: 16 }}
      layout
    >
      <AnimatePresence mode="wait">
        {!expanded ? (
          // Collapsed state
          <motion.div
            key="collapsed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="cursor-pointer select-none"
            style={{ width: 280 }}
            onClick={() => setExpanded(true)}
          >
            <div
              className="rounded-lg border border-[#333] p-4"
              style={{ background: "#111111" }}
            >
              {/* Progress bar */}
              <div className="h-1 w-full rounded-full bg-[#333] mb-3">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "#D4A574" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress * 100}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="text-[13px] text-white font-semibold tracking-wide uppercase"
                    style={{ fontFamily: "var(--font-display-org, 'Space Grotesk', sans-serif)" }}
                  >
                    {currentMeta.label}
                  </p>
                  <p className="text-[12px] text-[#999] mt-0.5">
                    Next: {getNextAction()}
                  </p>
                </div>
                <ChevronUp className="w-4 h-4 text-[#666]" />
              </div>
            </div>
          </motion.div>
        ) : (
          // Expanded state
          <motion.div
            key="expanded"
            initial={{ opacity: 0, y: 20, height: 80 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: 20, height: 80 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{ width: 360, maxHeight: "calc(100vh - 32px)" }}
            className="rounded-lg border border-[#333] overflow-y-auto"
          >
            <div style={{ background: "#111111" }} className="p-5">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <p
                  className="text-[13px] text-white font-semibold tracking-wide uppercase"
                  style={{ fontFamily: "var(--font-display-org, 'Space Grotesk', sans-serif)" }}
                >
                  Onboarding Progress
                </p>
                <button
                  onClick={() => setExpanded(false)}
                  className="text-[#666] hover:text-white transition-colors"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* Progress bar */}
              <div className="h-1 w-full rounded-full bg-[#333] mb-5">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "#D4A574" }}
                  animate={{ width: `${progress * 100}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>

              {/* Stage list */}
              <div className="space-y-1">
                {displayStages.map((stage) => {
                  const meta = STAGE_META[stage];
                  const isCompleted = completedStages.includes(stage);
                  const isSkipped = skippedStages.includes(stage);
                  const isCurrent = stage === currentStage;
                  const isPending =
                    !isCompleted && !isSkipped && !isCurrent;

                  return (
                    <div
                      key={stage}
                      className={`flex items-center justify-between rounded-md px-3 py-2.5 transition-colors ${
                        isCurrent
                          ? "bg-[#D4A574]/10 border border-[#D4A574]/30"
                          : isCompleted || isSkipped
                          ? "cursor-pointer hover:bg-white/5"
                          : "opacity-40"
                      }`}
                      onClick={() => {
                        if ((isCompleted || isSkipped) && !isCurrent) {
                          navigateBack(stage);
                          setExpanded(false);
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        {/* Status icon */}
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                            isCompleted
                              ? "bg-[#D4A574] text-[#111]"
                              : isSkipped
                              ? "bg-[#333] text-[#666]"
                              : isCurrent
                              ? "border-2 border-[#D4A574] text-[#D4A574]"
                              : "border border-[#444] text-[#444]"
                          }`}
                        >
                          {isCompleted && <Check className="w-3 h-3" />}
                          {isSkipped && <SkipForward className="w-3 h-3" />}
                        </div>

                        <div>
                          <p
                            className={`text-[13px] ${
                              isSkipped
                                ? "line-through text-[#666]"
                                : isCurrent
                                ? "text-white font-medium"
                                : isCompleted
                                ? "text-[#CCC]"
                                : "text-[#666]"
                            }`}
                          >
                            {meta.label}
                          </p>
                          {isCurrent && (
                            <p className="text-[11px] text-[#999] mt-0.5">
                              {meta.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Skip link */}
                      {isCurrent && meta.skippable && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSkip(stage);
                          }}
                          className="text-[11px] text-[#999] hover:text-[#D4A574] transition-colors"
                        >
                          Skip
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* S5: Dismiss all tooltips */}
              {currentStage === "S5" && (
                <button
                  onClick={handleDismissAllTooltips}
                  className="mt-4 text-[12px] text-[#999] hover:text-[#D4A574] transition-colors w-full text-center"
                >
                  Dismiss all tooltips
                </button>
              )}

              {/* Skip to dashboard */}
              <button
                onClick={handleSkipToDashboard}
                className="mt-4 w-full py-2.5 rounded-md border border-[#333] text-[13px] text-[#999] hover:text-white hover:border-[#D4A574] transition-all"
              >
                Skip to dashboard
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
