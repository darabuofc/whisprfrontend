"use client";

import React, { createContext, useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  getOnboardingState,
  advanceOnboardingStage,
  skipOnboardingStage,
  navigateOnboardingBack,
  reinvokeOnboarding,
  dismissOnboardingTooltip,
  batchDismissOnboardingTooltips,
} from "@/lib/onboardingApi";
import type {
  Stage,
  Persona,
  OnboardingContextValue,
  SimulationState,
  OnboardingStateResponse,
} from "./types";
import { INITIAL_SIMULATION_STATE } from "./types";
import { ProgressWidget } from "../components/ProgressWidget";
import { ContextBanner } from "../components/ContextBanner";
import { PersonaSwitchInterstitial } from "../components/PersonaSwitchInterstitial";

export const OnboardingContext = createContext<OnboardingContextValue | null>(
  null
);

// Stages where the simulation is active (fixture data used)
const SIMULATION_STAGES: Stage[] = ["S2", "S3", "S4"];

// Routes that should not be redirected during onboarding simulation
const SIMULATION_ALLOWED_PREFIXES = [
  "/organizers/dashboard",
  "/organizers/events",
  "/attendees/dashboard",
  "/attendees/events",
];

function derivePersona(stage: Stage | null): Persona {
  if (stage === "S2") return "attendee";
  if (stage === "S3" || stage === "S4") return "organizer";
  return null;
}

interface OnboardingProviderProps {
  children: React.ReactNode;
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Backend state
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [currentStage, setCurrentStage] = useState<Stage | null>(null);
  const [completedStages, setCompletedStages] = useState<Stage[]>([]);
  const [skippedStages, setSkippedStages] = useState<Stage[]>([]);
  const [tooltipState, setTooltipState] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  // Local simulation state
  const [simulationState, setSimulationState] = useState<SimulationState>(
    INITIAL_SIMULATION_STATE
  );

  // Persona switch interstitial
  const [showInterstitial, setShowInterstitial] = useState(false);

  // Derived values
  const isSimulationActive =
    isOnboarding && currentStage !== null && SIMULATION_STAGES.includes(currentStage);
  const currentPersona = derivePersona(currentStage);

  // Apply backend state response to local state
  const applyState = useCallback((data: OnboardingStateResponse) => {
    setIsOnboarding(data.is_onboarding ?? false);
    setCurrentStage(data.current_stage ?? null);
    setCompletedStages(data.completed_stages ?? []);
    setSkippedStages(data.skipped_stages ?? []);
    setTooltipState(data.tooltip_state ?? {});
  }, []);

  // Fetch onboarding state on mount
  useEffect(() => {
    let cancelled = false;

    async function fetchState() {
      try {
        const data = await getOnboardingState();
        if (!cancelled) {
          applyState(data);
        }
      } catch {
        // On failure: treat as not onboarding. Do not block app load.
        if (!cancelled) {
          setIsOnboarding(false);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchState();
    return () => {
      cancelled = true;
    };
  }, [applyState]);

  // Route guarding during simulation
  useEffect(() => {
    if (!isSimulationActive || loading) return;

    const isAllowed = SIMULATION_ALLOWED_PREFIXES.some((prefix) =>
      pathname.startsWith(prefix)
    );

    if (!isAllowed && pathname !== "/organizers/setup") {
      toast.info("Let's finish the tour first, or skip to your dashboard.");
      router.replace("/organizers/dashboard");
    }
  }, [pathname, isSimulationActive, loading, router]);

  // Actions
  const advanceStage = useCallback(
    async (completed: Stage, next: Stage) => {
      try {
        // Show interstitial for S2→S3 transition
        if (completed === "S2" && next === "S3") {
          setShowInterstitial(true);
        }

        const data = await advanceOnboardingStage(completed, next);
        applyState(data);

        // Reset simulation state for new stage
        setSimulationState(INITIAL_SIMULATION_STATE);
      } catch (err: any) {
        if (err?.response?.status === 422) {
          toast.error("Onboarding state updated \u2014 refreshing.");
          const data = await getOnboardingState();
          applyState(data);
        } else {
          // Retry once on 5xx
          try {
            const data = await advanceOnboardingStage(completed, next);
            applyState(data);
            setSimulationState(INITIAL_SIMULATION_STATE);
          } catch {
            toast.error("Something went wrong. Please try again.");
          }
        }
      }
    },
    [applyState]
  );

  const skipStage = useCallback(
    async (skipped: Stage, next: Stage) => {
      try {
        const data = await skipOnboardingStage(skipped, next);
        applyState(data);
        setSimulationState(INITIAL_SIMULATION_STATE);
      } catch (err: any) {
        if (err?.response?.status === 422) {
          toast.error("Onboarding state updated \u2014 refreshing.");
          const data = await getOnboardingState();
          applyState(data);
        } else {
          try {
            const data = await skipOnboardingStage(skipped, next);
            applyState(data);
            setSimulationState(INITIAL_SIMULATION_STATE);
          } catch {
            toast.error("Something went wrong. Please try again.");
          }
        }
      }
    },
    [applyState]
  );

  const navigateBack = useCallback(
    async (target: Stage) => {
      try {
        const data = await navigateOnboardingBack(target);
        applyState(data);
        setSimulationState(INITIAL_SIMULATION_STATE);
      } catch (err: any) {
        if (err?.response?.status === 422) {
          toast.info("Cannot navigate back to that stage.");
        } else {
          try {
            const data = await navigateOnboardingBack(target);
            applyState(data);
            setSimulationState(INITIAL_SIMULATION_STATE);
          } catch {
            toast.error("Something went wrong. Please try again.");
          }
        }
      }
    },
    [applyState]
  );

  const reinvoke = useCallback(async () => {
    try {
      const data = await reinvokeOnboarding();
      applyState(data);
      setSimulationState(INITIAL_SIMULATION_STATE);
    } catch {
      toast.error("Could not restart onboarding. Please try again.");
    }
  }, [applyState]);

  const dismissTooltipAction = useCallback(
    async (tooltipId: string) => {
      // Mark dismissed locally immediately
      setTooltipState((prev) => ({ ...prev, [tooltipId]: true }));

      try {
        const result = await dismissOnboardingTooltip(tooltipId);
        if (result.all_dismissed && currentStage === "S5") {
          await advanceStage("S5", "S6");
        }
      } catch {
        // Dismissed locally anyway. Retry silently on next app load.
        console.warn("[onboarding] Failed to persist tooltip dismiss:", tooltipId);
      }
    },
    [currentStage, advanceStage]
  );

  const batchDismissTooltips = useCallback(
    async (tooltipIds: string[]) => {
      // Mark all dismissed locally
      setTooltipState((prev) => {
        const next = { ...prev };
        tooltipIds.forEach((id) => {
          next[id] = true;
        });
        return next;
      });

      try {
        await batchDismissOnboardingTooltips(tooltipIds);
        if (currentStage === "S5") {
          await advanceStage("S5", "S6");
        }
      } catch {
        console.warn("[onboarding] Failed to batch dismiss tooltips");
      }
    },
    [currentStage, advanceStage]
  );

  const updateSimulationState = useCallback(
    (patch: Partial<SimulationState>) => {
      setSimulationState((prev) => ({ ...prev, ...patch }));
    },
    []
  );

  const contextValue: OnboardingContextValue = {
    isOnboarding,
    currentStage,
    completedStages,
    skippedStages,
    tooltipState,
    isSimulationActive,
    currentPersona,
    loading,
    advanceStage,
    skipStage,
    navigateBack,
    reinvoke,
    dismissTooltip: dismissTooltipAction,
    batchDismissTooltips,
    simulationState,
    updateSimulationState,
  };

  return (
    <OnboardingContext.Provider value={contextValue}>
      {showInterstitial && (
        <PersonaSwitchInterstitial
          onComplete={() => setShowInterstitial(false)}
        />
      )}

      {isOnboarding && !loading && currentStage && currentStage !== "S6" && (
        <>
          {(currentStage === "S2" || currentStage === "S3") && (
            <ContextBanner persona={currentPersona} />
          )}
          <ProgressWidget />
        </>
      )}

      {children}
    </OnboardingContext.Provider>
  );
}
