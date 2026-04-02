// Onboarding stage identifiers
export type Stage = "S0" | "S1" | "S2" | "S3" | "S4" | "S5" | "S6";

// Backend onboarding state response shape
export interface OnboardingStateResponse {
  is_onboarding: boolean;
  current_stage: Stage | null;
  completed_stages: Stage[];
  skipped_stages: Stage[];
}

// Context value exposed to consumers
export interface OnboardingContextValue {
  // State from backend
  isOnboarding: boolean;
  currentStage: Stage | null;
  completedStages: Stage[];
  skippedStages: Stage[];

  // Loading state
  loading: boolean;

  // Actions (call backend API + update local state)
  advanceStage: (completed: Stage, next: Stage) => Promise<void>;
  skipStage: (skipped: Stage, next: Stage) => Promise<void>;
  navigateBack: (target: Stage) => Promise<void>;
  reinvoke: () => Promise<void>;
}

// Stage metadata for display
export const STAGE_META: Record<
  Stage,
  { label: string; description: string; skippable: boolean }
> = {
  S0: {
    label: "Account Setup",
    description: "Create your organizer account",
    skippable: false,
  },
  S1: {
    label: "Organization Setup",
    description: "Set up your brand identity",
    skippable: false,
  },
  S2: {
    label: "Followers",
    description: "View your followers",
    skippable: true,
  },
  S3: {
    label: "Directory",
    description: "Explore the organizer directory",
    skippable: true,
  },
  S4: {
    label: "Create Event",
    description: "Create your first event",
    skippable: true,
  },
  S5: {
    label: "Event Settings",
    description: "Review your event settings",
    skippable: true,
  },
  S6: {
    label: "Complete",
    description: "Onboarding complete",
    skippable: false,
  },
};

// Ordered list of stages for progress calculation
export const STAGE_ORDER: Stage[] = [
  "S0",
  "S1",
  "S2",
  "S3",
  "S4",
  "S5",
  "S6",
];
