import type { ExploreEvent } from "@/lib/api";

// Dynamic date: 7 days from now
function getDemoDate(): string {
  return new Date(Date.now() + 7 * 86400000).toISOString();
}

// Shuffled lineup for variety
function getShuffledLineup() {
  const lineup = [
    { name: "KAEF", genre: "Deep House" },
    { name: "Noor Jehan Redux", genre: "Techno" },
    { name: "Saroor", genre: "Minimal" },
  ];
  return [...lineup].sort(() => Math.random() - 0.5);
}

export function getDemoEventFixture(): ExploreEvent {
  return {
    id: "onboarding-demo-event",
    name: "Whispr Demo Night",
    date: getDemoDate(),
    location: "Undisclosed Location, Karachi",
    cover: null,
    status: "published",
    user_relation: {
      is_registered: false,
      registration: null,
      has_ticket: false,
      ticket: null,
    },
    organization: {
      id: "onboarding-demo-org",
      name: "Whispr",
      logo: null,
      instagram_handle: "@whispr.pk",
      tagline: "Curated experiences, only.",
      website: null,
    },
  };
}

// Extended event detail fields used in the event detail page
export interface DemoEventDetail extends ExploreEvent {
  capacity: number;
  dress_code: string;
  description: string;
  screening_questions: { id: string; text: string }[];
  lineup: { name: string; genre: string }[];
  passes: { id: string; type: string; price: number; category: string }[];
}

export function getDemoEventDetailFixture(): DemoEventDetail {
  return {
    ...getDemoEventFixture(),
    capacity: 150,
    dress_code: "All black. No exceptions.",
    description:
      "An intimate night of deep house, techno, and minimal electronic music. Curated guest list. Undisclosed venue revealed 2 hours before the event.",
    screening_questions: [
      { id: "sq1", text: "How did you hear about us?" },
      { id: "sq2", text: "Describe your ideal night out" },
    ],
    lineup: getShuffledLineup(),
    passes: [
      {
        id: "pass-general",
        type: "General Admission",
        price: 3000,
        category: "individual",
      },
    ],
  };
}
