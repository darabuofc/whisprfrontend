"use client";

import React, { createContext, useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  getOnboardingState,
  advanceOnboardingStage,
  skipOnboardingStage,
  navigateOnboardingBack,
  reinvokeOnboarding,
} from "@/lib/onboardingApi";
import type { Stage, OnboardingContextValue, OnboardingStateResponse } from "./types";
import { ProgressWidget } from "../components/ProgressWidget";

export const OnboardingContext = createContext<OnboardingContextValue | null>(
  null
);

interface OnboardingProviderProps {
  children: React.ReactNode;
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  // Backend state
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [currentStage, setCurrentStage] = useState<Stage | null>(null);
  const [completedStages, setCompletedStages] = useState<Stage[]>([]);
  const [skippedStages, setSkippedStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);

  // Apply backend state response to local state
  const applyState = useCallback((data: OnboardingStateResponse) => {
    setIsOnboarding(data.is_onboarding ?? false);
    setCurrentStage(data.current_stage ?? null);
    setCompletedStages(data.completed_stages ?? []);
    setSkippedStages(data.skipped_stages ?? []);
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

  // Actions
  const advanceStage = useCallback(
    async (completed: Stage, next: Stage) => {
      try {
        const data = await advanceOnboardingStage(completed, next);
        applyState(data);
      } catch (err: any) {
        if (err?.response?.status === 422) {
          toast.error("Onboarding state updated \u2014 refreshing.");
          const data = await getOnboardingState();
          applyState(data);
        } else {
          try {
            const data = await advanceOnboardingStage(completed, next);
            applyState(data);
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
      } catch (err: any) {
        if (err?.response?.status === 422) {
          toast.error("Onboarding state updated \u2014 refreshing.");
          const data = await getOnboardingState();
          applyState(data);
        } else {
          try {
            const data = await skipOnboardingStage(skipped, next);
            applyState(data);
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
      } catch (err: any) {
        if (err?.response?.status === 422) {
          toast.info("Cannot navigate back to that stage.");
        } else {
          try {
            const data = await navigateOnboardingBack(target);
            applyState(data);
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
    } catch {
      toast.error("Could not restart onboarding. Please try again.");
    }
  }, [applyState]);

  const contextValue: OnboardingContextValue = {
    isOnboarding,
    currentStage,
    completedStages,
    skippedStages,
    loading,
    advanceStage,
    skipStage,
    navigateBack,
    reinvoke,
  };

  return (
    <OnboardingContext.Provider value={contextValue}>
      {isOnboarding && !loading && currentStage && currentStage !== "S6" && (
        <ProgressWidget />
      )}
      {children}
    </OnboardingContext.Provider>
  );
}
