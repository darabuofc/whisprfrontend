import axios from "axios";

// ----------------------------------------------------------
// ADMIN AXIOS INSTANCES
// JWT-based auth (Authorization: Bearer <token>)
// ----------------------------------------------------------

const BACKEND_BASE =
  (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api").replace(
    /\/api$/,
    ""
  );

// ----------------------------------------------------------
// TOKEN MANAGEMENT
// ----------------------------------------------------------

const TOKEN_KEY = "admin_token";

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

function setAdminToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

function clearAdminToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

/** For all admin endpoints under /api/admin/* */
export const adminApi = axios.create({
  baseURL: BACKEND_BASE + "/api/admin",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
adminApi.interceptors.request.use((config) => {
  const token = getAdminToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize error messages
const errorInterceptor = (error: any) => {
  const backendMessage =
    error?.response?.data?.message ||
    error?.response?.data?.detail ||
    error?.response?.data?.error;
  if (backendMessage) {
    error.message = backendMessage;
  }
  return Promise.reject(error);
};

adminApi.interceptors.response.use((r) => r, errorInterceptor);

// ----------------------------------------------------------
// TYPES
// ----------------------------------------------------------

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    per_page: number;
    last_page: number;
    current_page: number;
  };
}

export interface ActivityFeedItem {
  id: string;
  type: string;
  description: string;
  timestamp: string;
}

export interface AdminDashboardData {
  kpis: {
    total_users: number;
    new_users_today: number;
    active_events: number;
    tickets_sold_today: number;
    total_tickets_sold: number;
  };
  activity_feed: ActivityFeedItem[];
  user_growth_30d: { date: string; count: number }[];
  tickets_per_event: { event_name: string; tickets_sold: number }[];
}

export interface AdminEvent {
  id: string;
  name: string;
  organizer_name: string;
  organizer_id?: string;
  date: string;
  status: string;
  tickets_sold: number;
  capacity: number;
  cover_image?: string;
}

export interface AdminEventDetail {
  id: string;
  name: string;
  organizer_name: string;
  organizer_id?: string;
  date: string;
  time?: string;
  venue?: string;
  description?: string;
  capacity: number;
  price?: number;
  status: string;
  tickets_sold: number;
  cover_image?: string;
  attendees: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    ticket_type?: string;
    status: string;
  }[];
}

export interface AdminOrganizer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  instagram?: string;
  events_count: number;
  status: string;
  created_at: string;
  notes?: string;
}

export interface AdminOrganizerDetail extends AdminOrganizer {
  events: {
    id: string;
    name: string;
    date: string;
    status: string;
    tickets_sold: number;
  }[];
}

export interface AdminAttendee {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  tickets_count: number;
  last_active?: string;
}

export interface AdminAttendeeDetail extends AdminAttendee {
  gender?: string;
  age?: number;
  ticket_history: {
    id: string;
    event_name: string;
    event_id: string;
    ticket_type?: string;
    date: string;
    status: string;
  }[];
}

// ----------------------------------------------------------
// AUTH
// ----------------------------------------------------------

export async function adminLogin(
  username: string,
  password: string
): Promise<{ message: string }> {
  const res = await adminApi.post("/login", { username, password });
  if (res.data.token) {
    setAdminToken(res.data.token);
  }
  return res.data;
}

export async function adminLogout(): Promise<void> {
  try {
    await adminApi.post("/logout");
  } finally {
    clearAdminToken();
  }
}

export async function adminAuthCheck(): Promise<{ authenticated: boolean }> {
  const res = await adminApi.get("/auth/check");
  return res.data;
}

// ----------------------------------------------------------
// DASHBOARD
// ----------------------------------------------------------

export async function getAdminDashboard(): Promise<AdminDashboardData> {
  const res = await adminApi.get("/dashboard");
  return res.data;
}

// ----------------------------------------------------------
// EVENTS
// ----------------------------------------------------------

export async function getAdminEvents(
  params?: Record<string, string | number>
): Promise<PaginatedResponse<AdminEvent>> {
  const res = await adminApi.get("/events", { params });
  return res.data;
}

export async function getAdminEvent(id: string): Promise<AdminEventDetail> {
  const res = await adminApi.get(`/events/${id}`);
  return res.data;
}

export async function updateAdminEvent(
  id: string,
  data: Record<string, any>
): Promise<AdminEventDetail> {
  const res = await adminApi.patch(`/events/${id}`, data);
  return res.data;
}

export async function exportEventAttendees(id: string): Promise<Blob> {
  const res = await adminApi.get(`/events/${id}/attendees/export`, {
    responseType: "blob",
  });
  return res.data as Blob;
}

// ----------------------------------------------------------
// ORGANIZERS
// ----------------------------------------------------------

export async function getAdminOrganizers(
  params?: Record<string, string | number>
): Promise<PaginatedResponse<AdminOrganizer>> {
  const res = await adminApi.get("/organizers", { params });
  return res.data;
}

export async function createAdminOrganizer(
  data: Record<string, any>
): Promise<AdminOrganizer> {
  const res = await adminApi.post("/organizers", data);
  return res.data;
}

export async function getAdminOrganizer(
  id: string
): Promise<AdminOrganizerDetail> {
  const res = await adminApi.get(`/organizers/${id}`);
  return res.data;
}

export async function updateAdminOrganizer(
  id: string,
  data: Record<string, any>
): Promise<AdminOrganizer> {
  const res = await adminApi.patch(`/organizers/${id}`, data);
  return res.data;
}

// ----------------------------------------------------------
// ATTENDEES
// ----------------------------------------------------------

export async function getAdminAttendees(
  params?: Record<string, string | number>
): Promise<PaginatedResponse<AdminAttendee>> {
  const res = await adminApi.get("/attendees", { params });
  return res.data;
}

export async function createAdminAttendee(
  data: Record<string, any>
): Promise<AdminAttendee> {
  const res = await adminApi.post("/attendees", data);
  return res.data;
}

export async function getAdminAttendee(
  id: string
): Promise<AdminAttendeeDetail> {
  const res = await adminApi.get(`/attendees/${id}`);
  return res.data;
}

export async function updateAdminAttendee(
  id: string,
  data: Record<string, any>
): Promise<AdminAttendee> {
  const res = await adminApi.patch(`/attendees/${id}`, data);
  return res.data;
}

export async function grantTicket(
  attendeeId: string,
  data: { event_id: string; pass_type_id?: string }
): Promise<{ message: string }> {
  const res = await adminApi.post(`/attendees/${attendeeId}/tickets`, data);
  return res.data;
}
