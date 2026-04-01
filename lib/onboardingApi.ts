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

export async function dismissOnboardingTooltip(
  tooltipId: string
): Promise<{ all_dismissed: boolean }> {
  const res = await api.put("/onboarding/tooltip", {
    tooltip_id: tooltipId,
  });
  return res.data;
}

export async function batchDismissOnboardingTooltips(
  tooltipIds: string[]
): Promise<{ all_dismissed: boolean }> {
  const res = await api.put("/onboarding/tooltip", {
    tooltip_ids: tooltipIds,
  });
  return res.data;
}

// ----------------------------------------------------------
// WHATSAPP (fire-and-forget)
// ----------------------------------------------------------

export function sendWhatsappApplicationReceived(): void {
  api.post("/onboarding/whatsapp/application-received").catch((err) => {
    console.warn("[onboarding] WhatsApp application-received failed:", err);
  });
}

export function sendWhatsappApplicationApproved(): void {
  api.post("/onboarding/whatsapp/application-approved").catch((err) => {
    console.warn("[onboarding] WhatsApp application-approved failed:", err);
  });
}

export function sendWhatsappTicketConfirmed(): void {
  api.post("/onboarding/whatsapp/ticket-confirmed").catch((err) => {
    console.warn("[onboarding] WhatsApp ticket-confirmed failed:", err);
  });
}

// ----------------------------------------------------------
// DRAFT EVENT
// ----------------------------------------------------------

export async function createOnboardingDraftEvent(
  data: Record<string, any> | null,
  guided: boolean
): Promise<any> {
  const res = await api.post("/onboarding/create-draft-event", {
    ...data,
    guided,
  });
  return res.data;
}
