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

// Normalize error messages from API responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Extract the actual error message from the response if available
    const backendMessage =
      error?.response?.data?.message ||
      error?.response?.data?.detail ||
      error?.response?.data?.error;

    if (backendMessage) {
      error.message = backendMessage;
    }

    return Promise.reject(error);
  }
);

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

export interface EventOrganization {
  id: string;
  name: string | null;
  logo: string | null;
  instagram_handle: string | null;
  tagline: string | null;
  website: string | null;
}

export interface ExploreEvent {
  id: string;
  name: string;
  date: string | null;
  location: string | null;
  cover?: string | null;
  status?: string | null;
  user_relation: UserRelation;
  organization?: EventOrganization | null;
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
// FORGOT PASSWORD
// ----------------------------------------------------------

export async function sendAttendeeForgotPasswordOtp(whatsapp: string) {
  return (await api.post("/attendees/forgot-password/send-otp", { whatsapp })).data;
}

export async function resetAttendeePassword(whatsapp: string, otp: string, new_password: string) {
  return (await api.post("/attendees/forgot-password/reset", { whatsapp, otp, new_password })).data;
}

export async function sendOrganizerForgotPasswordOtp(whatsapp: string) {
  return (await api.post("/organizers/forgot-password/send-otp", { whatsapp })).data;
}

export async function resetOrganizerPassword(whatsapp: string, otp: string, new_password: string) {
  return (await api.post("/organizers/forgot-password/reset", { whatsapp, otp, new_password })).data;
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

    organization: e.organization
      ? {
          id: e.organization.id ?? "",
          name: e.organization.name ?? null,
          logo: e.organization.logo ?? null,
          instagram_handle: e.organization.instagram_handle ?? null,
          tagline: e.organization.tagline ?? null,
          website: e.organization.website ?? null,
        }
      : null,
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

// ----------------------------------------------------------
// ORGANIZATION API
// ----------------------------------------------------------

export interface Organization {
  id: string;
  name?: string;
  logo?: string;
  tagline?: string;
  website?: string;
  instagram_handle?: string;
}

export async function getOrganization(): Promise<Organization | null> {
  try {
    const res = await api.get("/organizers/organization");
    return res.data.organization || null;
  } catch (err: any) {
    if (err.response?.status === 404) return null;
    throw err;
  }
}

export async function updateOrganization(data: {
  logo?: string;
  tagline?: string;
  website?: string;
  instagram_handle?: string;
}): Promise<Organization> {
  const res = await api.put("/organizers/organization", data);
  return res.data.organization;
}

// ----------------------------------------------------------
// ORGANIZER REGISTRATION MANAGEMENT API
// ----------------------------------------------------------

export interface LinkedAttendee {
  id: string;
  name: string;
  email: string;
  whatsapp?: string;
  cnic?: string;
  instagram?: string;
  profile_picture?: string;
}

export interface RegistrationListItem {
  registration_id: string;
  status: string;
  name: string;
  type: string;
  pass_price: number | null;
  linked_attendees: LinkedAttendee[];
  created_date: string;
  actions: {
    canApprove: boolean;
    canReject: boolean;
  };
}

export interface RegistrationDetail {
  registration: any;
  attendees: {
    full_name: string;
    email: string;
    whatsapp?: string;
    instagram_handle?: string;
    profession?: string;
    bio?: string;
    age?: number;
    gender?: string;
    profile_picture?: string;
  }[];
}

export async function getEventRegistrations(
  eventId: string,
  params?: { status?: string; type?: string; search?: string }
): Promise<RegistrationListItem[]> {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append("status", params.status);
  if (params?.type) queryParams.append("type", params.type);
  if (params?.search) queryParams.append("search", params.search);

  const queryString = queryParams.toString();
  const url = `/registrations/event/${eventId}${queryString ? `?${queryString}` : ""}`;

  const res = await api.get(url);
  return res.data.registrations ?? [];
}

export async function getRegistrationDetail(
  registrationId: string
): Promise<RegistrationDetail> {
  const res = await api.get(`/registrations/${registrationId}`);
  return res.data;
}

export async function approveRegistration(registrationId: string): Promise<void> {
  await api.post(`/registrations/${registrationId}/approve`);
}

export async function rejectRegistration(registrationId: string): Promise<void> {
  await api.post(`/registrations/${registrationId}/reject`);
}

export async function revokeRegistration(registrationId: string): Promise<void> {
  await api.post(`/registrations/${registrationId}/revoke`);
}

export async function reconsiderRegistration(registrationId: string): Promise<void> {
  await api.post(`/registrations/${registrationId}/reconsider`);
}

// ----------------------------------------------------------
// ORGANIZER EVENT DETAILS API
// ----------------------------------------------------------

export interface OrganizerEventDetails {
  id: string;
  name: string;
  status: string;
  date: string | null;
  time: string | null;
  venue: string | null;
  cover: string | null;
  description: string | null;
  stats: {
    approved: number;
    pending: number;
    rejected: number;
    checked_in: number;
  };
}

export async function getOrganizerEventDetails(eventId: string): Promise<OrganizerEventDetails> {
  const res = await api.get(`/organizers/events/${eventId}`);
  const event = res.data.event;
  const fields = event.fields ?? {};

  return {
    id: event.id,
    name: fields.Name ?? "Untitled Event",
    status: fields.Status ?? "Draft",
    date: fields.Date ?? null,
    time: fields.Time ?? null,
    venue: fields.Location ?? null,
    cover: Array.isArray(fields.Cover) && fields.Cover.length > 0 ? fields.Cover[0]?.url ?? null : null,
    description: fields.Description ?? null,
    stats: {
      approved: fields.approved_count ?? 0,
      pending: fields.pending_count ?? 0,
      rejected: Array.isArray(fields.rejected_count) ? fields.rejected_count.length : (fields.rejected_count ?? 0),
      checked_in: Array.isArray(fields.checked_in_count) ? fields.checked_in_count.length : (fields.checked_in_count ?? 0),
    },
  };
}

// ----------------------------------------------------------
// DISCOUNT CODES API
// ----------------------------------------------------------

export interface DiscountCode {
  id: string;
  code: string;
  type: "percent" | "fixed";
  amount: number;
  active: boolean;
  created_at?: string;
}

export interface DiscountCodeCreate {
  code: string;
  type: "percent" | "fixed";
  amount: number;
  active?: boolean;
}

export interface DiscountValidationResult {
  original_price: number;
  discount_amount: number;
  final_price: number;
}

// Organizer: Create discount code
export async function createDiscountCode(
  eventId: string,
  data: DiscountCodeCreate
): Promise<DiscountCode> {
  const res = await api.post(`/organizers/events/${eventId}/discount-codes`, data);
  return res.data.discount_code;
}

// Organizer: List discount codes
export async function listDiscountCodes(eventId: string): Promise<DiscountCode[]> {
  const res = await api.get(`/organizers/events/${eventId}/discount-codes`);
  return res.data.discount_codes ?? [];
}

// Organizer: Update discount code
export async function updateDiscountCode(
  eventId: string,
  codeId: string,
  data: Partial<DiscountCodeCreate>
): Promise<DiscountCode> {
  const res = await api.put(`/organizers/events/${eventId}/discount-codes/${codeId}`, data);
  return res.data.discount_code;
}

// Organizer: Deactivate discount code
export async function deactivateDiscountCode(
  eventId: string,
  codeId: string
): Promise<void> {
  await api.delete(`/organizers/events/${eventId}/discount-codes/${codeId}`);
}

// Attendee: Validate discount code
export async function validateDiscountCode(
  eventId: string,
  passTypeId: string,
  discountCode: string
): Promise<DiscountValidationResult> {
  const res = await api.post(`/events/${eventId}/discounts/validate`, {
    pass_type_id: passTypeId,
    discount_code: discountCode,
  });
  return res.data;
}

// Attendee: Register with optional discount code
export async function registerForEventWithDiscount(
  eventId: string,
  passTypeId: string,
  discountCode?: string,
  answers?: { question_id: string; answer: string }[]
) {
  return (
    await api.post(`/events/${eventId}/registrations`, {
      pass_type_id: passTypeId,
      ...(discountCode && { discount_code: discountCode }),
      ...(answers && answers.length > 0 && { answers }),
    })
  ).data;
}

// ----------------------------------------------------------
// REGISTRATION QUESTIONS API
// ----------------------------------------------------------

export type QuestionType =
  | "text"
  | "textarea"
  | "select"
  | "multiselect"
  | "checkbox"
  | "yesno"
  | "number"
  | "file";

export interface RegistrationQuestion {
  id: string;
  event_id: string;
  question_text: string;
  question_type: QuestionType;
  is_required: boolean;
  options_json: string[] | null;
  order_index: number;
  created_at?: string;
}

export interface RegistrationQuestionCreate {
  question_text: string;
  question_type: QuestionType;
  is_required: boolean;
  options_json?: string[];
  order_index?: number;
}

export interface RegistrationAnswer {
  id: string;
  registration_id: string;
  question_id: string;
  answer_text: string;
  created_at?: string;
}

// Organizer: List registration questions for an event
export async function listRegistrationQuestions(
  eventId: string
): Promise<RegistrationQuestion[]> {
  const res = await api.get(`/organizer/events/${eventId}/registration-questions`);
  return res.data.questions ?? [];
}

// Organizer: Create a registration question
export async function createRegistrationQuestion(
  eventId: string,
  data: RegistrationQuestionCreate
): Promise<RegistrationQuestion> {
  const res = await api.post(`/organizer/events/${eventId}/registration-questions`, data);
  return res.data.question;
}

// Organizer: Update a registration question
export async function updateRegistrationQuestion(
  questionId: string,
  data: Partial<RegistrationQuestionCreate>
): Promise<RegistrationQuestion> {
  const res = await api.put(`/organizer/registration-questions/${questionId}`, data);
  return res.data.question;
}

// Organizer: Delete a registration question
export async function deleteRegistrationQuestion(questionId: string): Promise<void> {
  await api.delete(`/organizer/registration-questions/${questionId}`);
}

// Organizer: Reorder registration questions
export async function reorderRegistrationQuestions(
  eventId: string,
  questionIds: string[]
): Promise<void> {
  await api.put(`/organizer/events/${eventId}/registration-questions/reorder`, {
    question_ids: questionIds,
  });
}

// Attendee: Get registration questions for an event
export async function getEventRegistrationQuestions(
  eventId: string
): Promise<RegistrationQuestion[]> {
  const res = await api.get(`/events/${eventId}/registration-questions`);
  return res.data.questions ?? [];
}
