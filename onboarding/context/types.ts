// Onboarding stage identifiers
export type Stage = "S0" | "S1" | "S2" | "S3" | "S4" | "S5" | "S6";

// Attendee tour phases within S2
export type AttendeePhase =
  | "discovery"
  | "application"
  | "review"
  | "approved"
  | "payment"
  | "ticket"
  | null;

// Applicant action types in S3
export type ApplicantAction = "approved" | "rejected" | "waitlisted";

// Persona during simulation
export type Persona = "attendee" | "organizer" | null;

// Tooltip placement hints
export type TooltipPlacement = "top" | "bottom" | "left" | "right";

// Tooltip configuration for guided sequences
export interface TooltipConfig {
  id: string;
  targetSelector: string;
  title: string;
  body: string;
  placement?: TooltipPlacement;
  sequence?: {
    group: string;
    index: number;
    total: number;
  };
  onDismiss?: () => void;
}

// Local simulation state (non-persisted, resets on refresh)
export interface SimulationState {
  // S2 Attendee Tour
  attendeePhase: AttendeePhase;
  applicationSubmitted: boolean;
  paymentSimulated: boolean;

  // S3 Organizer Tour
  applicantsActioned: number;
  applicantActions: Record<string, ApplicantAction>;
  showNotificationPreview: string | null;
  sampledApplicants: any[] | null;

  // S4 Event Setup
  guidedSetupChosen: boolean | null;
  draftEventData: Record<string, any>;
}

// Backend onboarding state response shape
export interface OnboardingStateResponse {
  is_onboarding: boolean;
  current_stage: Stage | null;
  completed_stages: Stage[];
  skipped_stages: Stage[];
  tooltip_state: Record<string, boolean>;
}

// Context value exposed to consumers
export interface OnboardingContextValue {
  // State from backend
  isOnboarding: boolean;
  currentStage: Stage | null;
  completedStages: Stage[];
  skippedStages: Stage[];
  tooltipState: Record<string, boolean>;

  // Derived
  isSimulationActive: boolean;
  currentPersona: Persona;

  // Loading state
  loading: boolean;

  // Actions (call backend API + update local state)
  advanceStage: (completed: Stage, next: Stage) => Promise<void>;
  skipStage: (skipped: Stage, next: Stage) => Promise<void>;
  navigateBack: (target: Stage) => Promise<void>;
  reinvoke: () => Promise<void>;
  dismissTooltip: (tooltipId: string) => Promise<void>;
  batchDismissTooltips: (tooltipIds: string[]) => Promise<void>;

  // Simulation-specific
  simulationState: SimulationState;
  updateSimulationState: (patch: Partial<SimulationState>) => void;
}

// Initial simulation state
export const INITIAL_SIMULATION_STATE: SimulationState = {
  attendeePhase: null,
  applicationSubmitted: false,
  paymentSimulated: false,
  applicantsActioned: 0,
  applicantActions: {},
  showNotificationPreview: null,
  sampledApplicants: null,
  guidedSetupChosen: null,
  draftEventData: {},
};

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
    label: "Attendee Experience",
    description: "See Whispr through your attendees' eyes",
    skippable: true,
  },
  S3: {
    label: "Organizer Tools",
    description: "Manage applicants and curate your guest list",
    skippable: true,
  },
  S4: {
    label: "Event Setup",
    description: "Create your first event",
    skippable: true,
  },
  S5: {
    label: "Dashboard Tour",
    description: "Get to know your dashboard",
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
