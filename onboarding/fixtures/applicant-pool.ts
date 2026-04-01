import type { RegistrationListItem } from "@/lib/api";

// Utility to generate initials-based avatar placeholder
function avatarUrl(name: string): string {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
  // Use a deterministic color based on name
  const colors = [
    "D4A574", "B8785C", "7C6F64", "928374", "A89984",
    "83A598", "8EC07C", "FABD2F", "FE8019", "FB4934",
  ];
  const colorIdx =
    name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${colors[colorIdx]}&color=111111&size=128`;
}

// Screening answers for each archetype
function screeningAnswers(archetype: string) {
  const answers: Record<string, { q1: string; q2: string }> = {
    strong: {
      q1: "A friend who\u2019s been to your events recommended it.",
      q2: "Good music, interesting people, somewhere I haven\u2019t been before.",
    },
    poor: {
      q1: "Saw it on Instagram",
      q2: "idk just want to party lol",
    },
    borderline: {
      q1: "Found it through the Whispr app",
      q2: "Looking for something different from the usual club scene.",
    },
    mutual: {
      q1: "Ali Ahmed told me about Whispr",
      q2: "Live music and a curated crowd. I\u2019m tired of the usual spots.",
    },
    repeat: {
      q1: "Been to 3 of your events already!",
      q2: "The vibe. Nothing else in Karachi compares.",
    },
  };
  return answers[archetype] ?? answers.strong;
}

interface ApplicantProfile {
  name: string;
  archetype: "strong" | "poor" | "borderline" | "mutual" | "repeat";
  profession: string;
  age: number;
  gender: string;
  instagram: string;
  bio: string;
}

const PROFILES: ApplicantProfile[] = [
  // Strong fits (7)
  { name: "Aisha Khan", archetype: "strong", profession: "Architect", age: 27, gender: "female", instagram: "@aisha.designs", bio: "Minimalist by day, deep house by night." },
  { name: "Bilal Raza", archetype: "strong", profession: "Photographer", age: 29, gender: "male", instagram: "@bilalcaptures", bio: "Documenting Karachi\u2019s underground." },
  { name: "Sana Mirza", archetype: "strong", profession: "DJ / Producer", age: 25, gender: "female", instagram: "@sanamrzmusic", bio: "House, techno, and everything in between." },
  { name: "Omar Farooq", archetype: "strong", profession: "Creative Director", age: 31, gender: "male", instagram: "@omarfarooq.co", bio: "Building brands for the culture." },
  { name: "Zara Hussain", archetype: "strong", profession: "Fashion Designer", age: 26, gender: "female", instagram: "@zarahcouture", bio: "Desi minimalism. Karachi x Milan." },
  { name: "Hassan Ali", archetype: "strong", profession: "Software Engineer", age: 28, gender: "male", instagram: "@hassbuilds", bio: "Code by day, vinyl by night." },
  { name: "Nida Akhtar", archetype: "strong", profession: "Filmmaker", age: 30, gender: "female", instagram: "@nidaframes", bio: "Short films and long nights." },

  // Poor fits (5)
  { name: "Kamran Malik", archetype: "poor", profession: "Student", age: 19, gender: "male", instagram: "@kamzz_official", bio: "Living my best life \ud83d\ude0e" },
  { name: "Fatima Begum", archetype: "poor", profession: "Unemployed", age: 22, gender: "female", instagram: "@fatii_xo", bio: "party party party" },
  { name: "Asad Qureshi", archetype: "poor", profession: "Student", age: 20, gender: "male", instagram: "@asadq786", bio: "YOLO" },
  { name: "Mehreen Shah", archetype: "poor", profession: "Student", age: 21, gender: "female", instagram: "@mehreen_shah1", bio: "Just here for vibes" },
  { name: "Tariq Jameel", archetype: "poor", profession: "Salesman", age: 35, gender: "male", instagram: "@tariq.j.official", bio: "Business minded" },

  // Borderline (6)
  { name: "Amna Rizvi", archetype: "borderline", profession: "Marketing Manager", age: 27, gender: "female", instagram: "@amna.rizvi", bio: "Music lover, occasional dancer." },
  { name: "Faisal Ahmed", archetype: "borderline", profession: "Lawyer", age: 32, gender: "male", instagram: "@faisala32", bio: "Work hard, unwind harder." },
  { name: "Hira Patel", archetype: "borderline", profession: "Doctor", age: 29, gender: "female", instagram: "@hira.p", bio: "Exploring Karachi\u2019s creative scene." },
  { name: "Junaid Khan", archetype: "borderline", profession: "Graphic Designer", age: 24, gender: "male", instagram: "@junaidcreates", bio: "Pixels and bass." },
  { name: "Mahnoor Syed", archetype: "borderline", profession: "Content Creator", age: 23, gender: "female", instagram: "@mahnoor.creates", bio: "Documenting experiences." },
  { name: "Rehan Durrani", archetype: "borderline", profession: "Chef", age: 28, gender: "male", instagram: "@rehan.cooks", bio: "Feed the soul, not just the stomach." },

  // Mutual connection (1)
  { name: "Ali Ahmed", archetype: "mutual", profession: "Event Planner", age: 30, gender: "male", instagram: "@aliahmed.events", bio: "5 mutual friends. Karachi\u2019s event circuit." },

  // Repeat attendee (1)
  { name: "Sara Qasim", archetype: "repeat", profession: "Interior Designer", age: 28, gender: "female", instagram: "@saraq.interiors", bio: "3rd time applying. The vibes are always worth it." },
];

function profileToRegistration(
  profile: ApplicantProfile,
  index: number
): RegistrationListItem {
  const answers = screeningAnswers(profile.archetype);
  const createdDate = new Date(
    Date.now() - (index + 1) * 3600000
  ).toISOString();

  return {
    registration_id: `onboarding-applicant-${index}`,
    status: "pending",
    name: profile.name,
    type: "General Admission",
    price: 3000,
    profile_picture: avatarUrl(profile.name),
    linked_attendees: [],
    created_date: createdDate,
    is_complete: true,
    actions: {
      canApprove: true,
      canReject: true,
    },
  };
}

// Extended applicant detail for display
export interface ApplicantDetail {
  registration_id: string;
  name: string;
  age: number;
  gender: string;
  profession: string;
  instagram: string;
  bio: string;
  profile_picture: string;
  archetype: string;
  screening_answers: { question: string; answer: string }[];
  has_mutual_connection: boolean;
  is_repeat_attendee: boolean;
}

function profileToDetail(
  profile: ApplicantProfile,
  index: number
): ApplicantDetail {
  const answers = screeningAnswers(profile.archetype);
  return {
    registration_id: `onboarding-applicant-${index}`,
    name: profile.name,
    age: profile.age,
    gender: profile.gender,
    profession: profile.profession,
    instagram: profile.instagram,
    bio: profile.bio,
    profile_picture: avatarUrl(profile.name),
    archetype: profile.archetype,
    screening_answers: [
      { question: "How did you hear about us?", answer: answers.q1 },
      { question: "Describe your ideal night out", answer: answers.q2 },
    ],
    has_mutual_connection: profile.archetype === "mutual",
    is_repeat_attendee: profile.archetype === "repeat",
  };
}

// Full pool as RegistrationListItem[]
export const FULL_APPLICANT_POOL: RegistrationListItem[] = PROFILES.map(
  (p, i) => profileToRegistration(p, i)
);

// Full pool as ApplicantDetail[]
export const FULL_APPLICANT_DETAILS: ApplicantDetail[] = PROFILES.map(
  (p, i) => profileToDetail(p, i)
);

// Sample 8-12 applicants randomly
export function sampleApplicants(
  min = 8,
  max = 12
): { list: RegistrationListItem[]; details: ApplicantDetail[] } {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;

  // Create index array and shuffle
  const indices = Array.from({ length: PROFILES.length }, (_, i) => i);
  const shuffled = [...indices].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, count);

  return {
    list: selected.map((i) => profileToRegistration(PROFILES[i], i)),
    details: selected.map((i) => profileToDetail(PROFILES[i], i)),
  };
}
