import { api } from "./api";
import type { OnboardingStateResponse, Stage } from "@/onboarding/context/types";

// ----------------------------------------------------------
// STATE MANAGEMENT
// ----------------------------------------------------------

export async function getOnboardingState(): Promise<OnboardingStateResponse> {
  const res = await api.get("/onboarding/state");
  return res.data;
}

export async function advanceOnboardingStage(
  completedStage: Stage,
  nextStage: Stage
): Promise<OnboardingStateResponse> {
  const res = await api.put("/onboarding/advance", {
    completed_stage: completedStage,
    next_stage: nextStage,
  });
  return res.data;
}

export async function skipOnboardingStage(
  skippedStage: Stage,
  nextStage: Stage
): Promise<OnboardingStateResponse> {
  const res = await api.put("/onboarding/skip", {
    skipped_stage: skippedStage,
    next_stage: nextStage,
  });
  return res.data;
}

export async function navigateOnboardingBack(
  targetStage: Stage
): Promise<OnboardingStateResponse> {
  const res = await api.put("/onboarding/navigate-back", {
    target_stage: targetStage,
  });
  return res.data;
}

export async function reinvokeOnboarding(): Promise<OnboardingStateResponse> {
  const res = await api.post("/onboarding/reinvoke");
  return res.data;
}
