import type { OrganizerEventDetails } from "@/lib/api";

export function getDemoEventDashboardFixture(): OrganizerEventDetails {
  return {
    id: "onboarding-demo-event",
    name: "Whispr Demo Night",
    status: "published",
    date: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
    time: "21:00",
    venue: "Undisclosed Location, Karachi",
    cover: null,
    description:
      "An intimate night of deep house, techno, and minimal electronic music. Curated guest list. Undisclosed venue revealed 2 hours before the event.",
    stats: {
      approved: 42,
      pending: 15,
      rejected: 8,
      checked_in: 0,
    },
  };
}
