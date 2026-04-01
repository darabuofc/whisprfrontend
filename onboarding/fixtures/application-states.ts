import type { RegistrationItem } from "@/lib/api";
import type { AttendeePhase } from "../context/types";

function relativeDate(minutesAgo: number): string {
  return new Date(Date.now() - minutesAgo * 60000).toISOString();
}

// Application status fixtures keyed by attendee phase
export function getApplicationFixture(
  phase: AttendeePhase
): RegistrationItem | null {
  if (!phase) return null;

  const base: RegistrationItem = {
    registration_airtable_id: "onboarding-app-001",
    registration_id: "onboarding-app-001",
    status: "pending",
    type: "General Admission",
    is_primary: true,
    primary_attendee: null,
    linked_attendees: [],
    remaining_slots: 0,
    is_complete: true,
    event: {
      id: "onboarding-demo-event",
      name: "Whispr Demo Night",
      date: new Date(Date.now() + 7 * 86400000).toISOString(),
      location: "Undisclosed Location, Karachi",
      cover: null,
    },
    pass: {
      id: "pass-general",
      type: "General Admission",
      price: 3000,
      category: "individual",
      max_group: null,
    },
    share_link: "",
  };

  switch (phase) {
    case "discovery":
      return null;

    case "application":
      return {
        ...base,
        status: "draft",
      };

    case "review":
      return {
        ...base,
        status: "pending",
      };

    case "approved":
      return {
        ...base,
        status: "approved",
      };

    case "payment":
      return {
        ...base,
        status: "approved",
      };

    case "ticket":
      return {
        ...base,
        status: "confirmed",
      };

    default:
      return null;
  }
}
