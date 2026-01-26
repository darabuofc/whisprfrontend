/**
 * OAuth utility functions for handling Google authentication flow
 */

export interface OAuthCallbackResponse {
  message: string;
  organizer?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  attendee?: {
    id: string;
    name: string;
    email: string;
    role: string;
    is_onboarded?: boolean;
  };
  token: string;
}

/**
 * Store user session after successful OAuth authentication
 */
export function persistOAuthSession(
  token: string,
  role: "organizer" | "attendee",
  userData?: any
) {
  if (typeof window === "undefined") return;

  localStorage.setItem("whispr_token", token);
  localStorage.setItem("token", token);
  localStorage.setItem("whispr_role", role);

  if (userData) {
    localStorage.setItem("user", JSON.stringify(userData));
  }
}

/**
 * Initiate Google OAuth flow for organizers
 */
export function initiateOrganizerOAuth() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://127.0.0.1:8000';
  window.location.href = `${apiBase}/auth/google/organizer`;
}

/**
 * Initiate Google OAuth flow for attendees
 */
export function initiateAttendeeOAuth() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://127.0.0.1:8000';
  window.location.href = `${apiBase}/auth/google/attendee`;
}

/**
 * Handle OAuth callback and extract user data
 * This function would be called on the callback page
 */
export function handleOAuthCallback(response: OAuthCallbackResponse): {
  token: string;
  role: "organizer" | "attendee";
  user: any;
  isOnboarded: boolean;
} {
  const { token, organizer, attendee } = response;

  if (organizer) {
    return {
      token,
      role: "organizer",
      user: organizer,
      isOnboarded: true, // Organizers don't need onboarding
    };
  }

  if (attendee) {
    return {
      token,
      role: "attendee",
      user: attendee,
      isOnboarded: attendee.is_onboarded ?? false,
    };
  }

  throw new Error("Invalid OAuth response: missing user data");
}

/**
 * Save a custom redirect URL to be used after authentication
 */
export function savePostAuthRedirect(url: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("whispr_post_auth_redirect", url);
}

/**
 * Get and clear the saved post-auth redirect URL
 */
export function getAndClearPostAuthRedirect(): string | null {
  if (typeof window === "undefined") return null;
  const url = localStorage.getItem("whispr_post_auth_redirect");
  if (url) {
    localStorage.removeItem("whispr_post_auth_redirect");
  }
  return url;
}

/**
 * Get redirect URL after successful authentication
 * Checks for saved redirect URL first, then falls back to default
 */
export function getPostAuthRedirect(
  role: "organizer" | "attendee",
  isOnboarded: boolean
): string {
  // Check for saved redirect URL first (for users coming from event pages, etc.)
  const savedRedirect = getAndClearPostAuthRedirect();

  if (role === "organizer") {
    return savedRedirect || "/organizers/dashboard";
  }

  // For attendees, only use saved redirect if they're onboarded
  // Otherwise they need to complete onboarding first
  if (isOnboarded && savedRedirect) {
    return savedRedirect;
  }

  return isOnboarded ? "/attendees/dashboard" : "/attendees/onboarding";
}
