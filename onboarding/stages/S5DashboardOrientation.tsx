"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useOnboarding } from "../context/useOnboarding";
import { TooltipOverlay } from "../components/TooltipOverlay";
import { trackOnboardingEvent } from "../analytics";
import type { TooltipConfig } from "../context/types";

// S5 tooltip configurations keyed by route/section
const S5_TOOLTIPS: (TooltipConfig & { route?: string })[] = [
  {
    id: "s5_dashboard_overview",
    targetSelector: "[data-onboarding='dashboard-overview']",
    title: "Your dashboard",
    body: "This is your command center. Event stats, applicant activity, and quick actions \u2014 all in one place.",
    placement: "bottom",
    route: "/organizers/dashboard",
  },
  {
    id: "s5_create_event",
    targetSelector: "[data-onboarding='create-event-btn']",
    title: "Create events",
    body: "Launch new events from here. Each event gets its own applicant queue, passes, and settings.",
    placement: "bottom",
    route: "/organizers/dashboard",
  },
  {
    id: "s5_event_card",
    targetSelector: "[data-onboarding='event-card']",
    title: "Event management",
    body: "Click any event to access its mission control \u2014 registrations, passes, discounts, and more.",
    placement: "right",
    route: "/organizers/dashboard",
  },
  {
    id: "s5_sidebar_events",
    targetSelector: "[data-onboarding='sidebar-events']",
    title: "Events section",
    body: "All your events, past and upcoming. Filter, search, and manage from here.",
    placement: "right",
    route: "/organizers/events",
  },
  {
    id: "s5_sidebar_followers",
    targetSelector: "[data-onboarding='sidebar-followers']",
    title: "Your followers",
    body: "People who follow your organization get notified when you publish new events.",
    placement: "right",
    route: "/organizers/followers",
  },
  {
    id: "s5_sidebar_directory",
    targetSelector: "[data-onboarding='sidebar-directory']",
    title: "Organizer directory",
    body: "Discover other organizers on Whispr. Build your network.",
    placement: "right",
    route: "/organizers/directory",
  },
  {
    id: "s5_org_profile",
    targetSelector: "[data-onboarding='sidebar-organization']",
    title: "Organization profile",
    body: "Update your logo, tagline, and links. This is what attendees see when they discover you.",
    placement: "right",
    route: "/organizers/organization",
  },
  {
    id: "s5_settings",
    targetSelector: "[data-onboarding='sidebar-settings']",
    title: "Settings",
    body: "Auto-approve rules, notification preferences, and account settings live here.",
    placement: "right",
    route: "/organizers/settings",
  },
];

export function S5DashboardOrientation() {
  const { tooltipState, dismissTooltip, currentStage } = useOnboarding();
  const pathname = usePathname();
  const [activeTooltip, setActiveTooltip] = useState<TooltipConfig | null>(
    null
  );

  // Find next undismissed tooltip for current route
  const findNextTooltip = useCallback(() => {
    if (currentStage !== "S5") return null;

    for (const tooltip of S5_TOOLTIPS) {
      // Skip already dismissed
      if (tooltipState[tooltip.id]) continue;

      // Check route match (if specified)
      if (tooltip.route && !pathname.startsWith(tooltip.route)) continue;

      // Check target element exists
      const target = document.querySelector(tooltip.targetSelector);
      if (!target) continue;

      return tooltip;
    }
    return null;
  }, [tooltipState, pathname, currentStage]);

  // Show tooltip when route changes or tooltip state changes
  useEffect(() => {
    if (currentStage !== "S5") return;

    // Small delay to let DOM render
    const timer = setTimeout(() => {
      const next = findNextTooltip();
      if (next) {
        setActiveTooltip(next);
        trackOnboardingEvent("onboarding_s5_tooltip_viewed", {
          tooltip_id: next.id,
          section: pathname,
        });
      } else {
        setActiveTooltip(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [pathname, tooltipState, currentStage, findNextTooltip]);

  if (currentStage !== "S5") return null;

  return (
    <TooltipOverlay
      tooltip={activeTooltip}
      onDismiss={() => {
        if (activeTooltip) {
          dismissTooltip(activeTooltip.id);
          setActiveTooltip(null);
        }
      }}
    />
  );
}
