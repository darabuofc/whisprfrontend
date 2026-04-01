// Onboarding analytics event tracker
// Logs events to console in development. Replace with your analytics provider.

export function trackOnboardingEvent(
  eventName: string,
  properties?: Record<string, any>
) {
  if (process.env.NODE_ENV === "development") {
    console.log(`[onboarding:analytics] ${eventName}`, properties ?? {});
  }

  // TODO: Wire up to your analytics provider (e.g., Mixpanel, Amplitude, PostHog)
  // analytics.track(eventName, properties);
}
