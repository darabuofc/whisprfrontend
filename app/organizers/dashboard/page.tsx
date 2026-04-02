"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getEvents,
  createDraftEvent,
  getOrganizer,
  getOrganization,
  Organization,
} from "@/lib/api";
import StatStrip from "@/components/organizer/StatStrip";
import EventGrid from "@/components/organizer/EventGrid";
import QuickActions from "@/components/organizer/QuickActions";

interface Event {
  id: string;
  fields: {
    Name?: string;
    Date?: string;
    Location?: string;
    Status?: string;
    Cover?: string[];
  };
}

interface Organizer {
  id: string;
  name: string;
  email: string;
  role: string;
  approval_status: string;
}

export default function OrganizerDashboard() {
  const router = useRouter();
  const [organizer, setOrganizer] = useState<Organizer | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingEvent, setCreatingEvent] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [org, evs, orgData] = await Promise.all([
          getOrganizer(),
          getEvents(),
          getOrganization(),
        ]);
        setOrganizer(org);
        setEvents(evs);
        setOrganization(orgData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreateEvent = async () => {
    if (organizer?.approval_status === "Pending") return;
    try {
      setCreatingEvent(true);
      const draft = await createDraftEvent();
      window.location.href = `/organizers/events/${draft.id}/onboarding`;
    } catch (e) {
      console.error(e);
    } finally {
      setCreatingEvent(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p
          className="text-[var(--text-muted)] text-[13px] uppercase tracking-[0.08em]"
          style={{ fontFamily: "var(--font-body-org)" }}
        >
          Loading...
        </p>
      </div>
    );
  }

  const publishedEvents = events.filter((e) => e.fields.Status === "published");
  const draftEvents = events.filter((e) => e.fields.Status !== "published");
  const isPending = organizer?.approval_status === "Pending";

  return (
    <div data-onboarding="dashboard-overview" className="max-w-[1100px] mx-auto px-6 sm:px-12 py-20 sm:py-20">
      {/* Pending Banner */}
      {isPending && (
        <div
          className="mb-10 px-6 py-5 border border-[var(--border-copper)] rounded-md"
          style={{ background: "var(--copper-dim)" }}
        >
          <p
            className="text-[13px] text-[var(--text-secondary)] uppercase tracking-[0.06em]"
            style={{ fontFamily: "var(--font-body-org)" }}
          >
            Account pending approval — you can create events once approved.
          </p>
        </div>
      )}

      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5 mb-14">
        <div>
          <p
            className="text-[14px] text-[var(--text-secondary)]"
            style={{ fontFamily: "var(--font-body-org)" }}
          >
            Welcome back,
          </p>
          <h1
            className="text-[36px] sm:text-[42px] text-[var(--text-primary)] uppercase leading-none mt-1 font-medium"
            style={{ fontFamily: "var(--font-display-org)" }}
          >
            {organizer?.name || "Organizer"}
          </h1>
          <p
            className="text-[13px] text-[var(--text-muted)] mt-3 uppercase tracking-[0.06em]"
            style={{ fontFamily: "var(--font-mono-org)" }}
          >
            {organization?.name || ""}
            {organization?.follower_count !== undefined && (
              <> · {organization.follower_count} followers</>
            )}
          </p>
        </div>

        {!isPending && (
          <button
            data-onboarding="create-event-btn"
            onClick={handleCreateEvent}
            disabled={creatingEvent}
            className="self-start px-7 py-3.5 bg-[var(--copper)] text-[var(--bg-base)] text-[13px] uppercase tracking-[0.12em] rounded-md hover:opacity-90 transition-opacity duration-200 disabled:opacity-50 font-medium"
            style={{ fontFamily: "var(--font-display-org)" }}
          >
            {creatingEvent ? "Creating..." : "+ New Event"}
          </button>
        )}
      </div>

      {/* Stat Strip */}
      <div className="mb-14">
        <StatStrip
          totalEvents={events.length}
          published={publishedEvents.length}
          drafts={draftEvents.length}
          totalAttendees={0}
        />
      </div>

      {/* Events Grid */}
      <EventGrid events={events} onCreateEvent={handleCreateEvent} />

      {/* Quick Actions */}
      <QuickActions
        organization={organization}
        onOrganizationSaved={() => getOrganization().then(setOrganization)}
      />
    </div>
  );
}
