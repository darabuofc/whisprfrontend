import axios from "axios";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

// ----------------------------------------------------------
// AXIOS INSTANCE
// ----------------------------------------------------------

export const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// Auto-attach JWT
api.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("whispr_token") || localStorage.getItem("token")
      : null;

  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  return config;
});

// ----------------------------------------------------------
// CORE TYPES
// ----------------------------------------------------------

export interface RegisterResponse {
  message: string;
  otp?: string | null;
}

export interface VerifyOtpResponse {
  message: string;
  token: string;
}

export interface LoginResponse {
  token: string;
}

export interface ApiResponse {
  message: string;
  [key: string]: any;
}

// ----------------------------------------------------------
// PROFILE TYPE
// ----------------------------------------------------------

export interface Profile {
  id: string;
  fullName: string;
  gender: string;
  age: number;
  email: string;
  registeredNumber: string;
  whatsappVerified: boolean;
  instagramHandle?: string;
  profession?: string;
  bio?: string;
  isOnboarded: boolean;
  profilePicture: string | null;
}

// ----------------------------------------------------------
// EXPLORE EVENTS TYPES
// ----------------------------------------------------------

export interface EventRegistrationRelation {
  id: string | null;
  status: string | null;
  registration_id: string | null;
  pass_type: string | null;
}

export interface EventTicketRelation {
  id: string | null;
  pass_type: string | null;
}

export interface UserRelation {
  is_registered: boolean;
  registration: EventRegistrationRelation | null;
  has_ticket: boolean;
  ticket: EventTicketRelation | null;
}

export interface ExploreEvent {
  id: string;
  name: string;
  date: string | null;
  location: string | null;
  cover?: string | null;
  status?: string | null;
  user_relation: UserRelation;
}

// ----------------------------------------------------------
// REGISTRATIONS + TICKETS TYPES
// ----------------------------------------------------------

export interface RegistrationItem {
  registration_airtable_id: string;
  registration_id: string;
  status: string;
  type: string | null;
  is_primary: boolean;
  primary_attendee: string | null;
  linked_attendees: string[];
  remaining_slots: number;
  is_complete: boolean;

  event: {
    id: string;
    name: string | null;
    date: string | null;
    location: string | null;
    cover: string | null;
  };

  pass: {
    id: string;
    type: string | null;
    price: number | null;
    category: string | null;
    max_group: number | null;
  };

  share_link: string;
}

export interface TicketItem {
  id: string;
  event: {
    id: string;
    name: string | null;
    date: string | null;
    location: string | null;
  } | null;
  pass_type?: string | null;
  purchase_date?: string | null;
  status: string;
  qr_code?: string | null;
}

// ----------------------------------------------------------
// AUTH API
// ----------------------------------------------------------

export async function register(phone: string, password: string) {
  return (await api.post<RegisterResponse>("/auth/register", { phone, password })).data;
}

export async function verifyOtp(phone: string, otp: string) {
  const res = await api.post<VerifyOtpResponse>("/auth/verify-otp", { phone, otp });
  if (res.data.token) {
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("whispr_token", res.data.token);
    localStorage.setItem("whispr_role", "attendee");
  }
  return res.data;
}

export async function login(phone: string, password: string) {
  const res = await api.post<LoginResponse>("/login", { phone, password });
  if (res.data.token) {
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("whispr_token", res.data.token);
    localStorage.setItem("whispr_role", "attendee");
  }
  return res.data;
}

// ----------------------------------------------------------
// ONBOARDING
// ----------------------------------------------------------

export async function sendWhatsappOtp(whatsapp: string) {
  return (await api.post("/attendees/onboarding/whatsapp/send-otp", { whatsapp })).data;
}

export async function verifyWhatsappOtp(whatsapp: string, otp: string) {
  return (await api.post("/attendees/onboarding/whatsapp/verify", { whatsapp, otp })).data;
}

export async function saveBasics(dob: string, cnic: string) {
  return (await api.post("/attendees/onboarding/basics", { dob, cnic })).data;
}

export async function saveProfile(data: FormData) {
  return (
    await api.post("/attendees/onboarding/profile", data, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  ).data;
}

export async function getOnboardingStatus() {
  return (await api.get("/attendees/onboarding/status")).data;
}

// ----------------------------------------------------------
// PROFILE
// ----------------------------------------------------------

export async function getMe(): Promise<Profile> {
  const res = await api.get("/attendees/me");
  const a = res.data.attendee;

  return {
    id: a.id,
    fullName: a.full_name,
    email: a.email,
    registeredNumber: a.registered_number,
    whatsappVerified: a.whatsapp_verified,
    instagramHandle: a.instagram_handle,
    profession: a.profession,
    bio: a.bio,
    isOnboarded: a.is_onboarded,
    gender: a.gender,
    age: a.age,
    profilePicture: a.profile_picture ?? null,
  };
}

// ----------------------------------------------------------
// EXPLORE EVENTS — ✔ FINAL
// ----------------------------------------------------------

export async function getAttendeeEvents(): Promise<ExploreEvent[]> {
  const res = await api.get("/attendees/me/explore-events");
  const events = res.data.events ?? [];

  return events.map((e: any) => ({
    id: e.id,
    name: e.name,
    date: e.date ?? null,
    location: e.location ?? null,
    cover: e.cover ?? null,
    status: e.status ?? null,

    user_relation: {
      is_registered: e.user_relation?.is_registered ?? false,
      has_ticket: e.user_relation?.has_ticket ?? false,

      registration: e.user_relation?.registration
        ? {
            id: e.user_relation.registration.id ?? null,
            status: e.user_relation.registration.status ?? null,
            registration_id: e.user_relation.registration.registration_id ?? null,
            pass_type: e.user_relation.registration.pass_type ?? null,
          }
        : null,

      ticket: e.user_relation?.ticket
        ? {
            id: e.user_relation.ticket.id ?? null,
            pass_type: e.user_relation.ticket.pass_type ?? null,
          }
        : null,
    },
  }));
}

// ----------------------------------------------------------
// REGISTRATIONS + TICKETS
// ----------------------------------------------------------

export async function getRegistrations(): Promise<RegistrationItem[]> {
  const res = await api.get("/attendees/me/registrations");
  return res.data.registrations ?? [];
}

export async function getTickets(): Promise<TicketItem[]> {
  const res = await api.get("/attendees/me/tickets");
  return res.data.tickets ?? [];
}

// ----------------------------------------------------------
// EVENT ACTIONS
// ----------------------------------------------------------

export async function getEventById(id: string) {
  return (await api.get(`/events/${id}`)).data;
}

export async function getEventPasses(eventId: string) {
  return (await api.get(`/events/${eventId}/passes`)).data.passes;
}

export async function registerForEvent(eventId: string, passTypeId?: string) {
  return (
    await api.post(`/events/${eventId}/registrations`, {
      pass_type_id: passTypeId || "default",
    })
  ).data;
}

export async function joinExistingRegistration(joinCode: string) {
  return (await api.post(`/registrations/join`, { join_code: joinCode })).data;
}

// ----------------------------------------------------------
// ORGANIZER API
// ----------------------------------------------------------

export async function getOrganizer() {
  return (await api.get("/organizers/me")).data.organizer;
}

export async function getEvents() {
  return (await api.get("/organizers/events")).data.events;
}

export async function createDraftEvent() {
  return (await api.post("/organizers/events/start")).data.event;
}

export async function updateEvent(id: string, data: any) {
  return (await api.post(`/organizers/events/${id}/update`, data)).data.event;
}

export async function addPassTypes(id: string, data: any) {
  return (await api.post(`/organizers/events/${id}/pass-types`, data)).data.pass_types;
}

export async function publishEvent(id: string) {
  return (await api.post(`/organizers/events/${id}/publish`)).data.event;
}
