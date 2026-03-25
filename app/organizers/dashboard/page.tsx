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
          className="text-[var(--text-muted)] text-[12px] uppercase tracking-[0.08em]"
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
    <div className="max-w-[1100px] mx-auto px-6 sm:px-12 py-20 sm:py-20">
      {/* Pending Banner */}
      {isPending && (
        <div
          className="mb-10 px-5 py-4 border border-[var(--border-subtle)] rounded-[2px]"
          style={{ background: "var(--copper-dim)" }}
        >
          <p
            className="text-[12px] text-[var(--text-secondary)] uppercase tracking-[0.08em]"
            style={{ fontFamily: "var(--font-body-org)" }}
          >
            Account pending approval — you can create events once approved.
          </p>
        </div>
      )}

      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-12">
        <div>
          <p
            className="text-[13px] text-[var(--text-secondary)]"
            style={{ fontFamily: "var(--font-body-org)" }}
          >
            Welcome back,
          </p>
          <h1
            className="text-[32px] sm:text-[36px] text-[var(--text-primary)] uppercase leading-none mt-1"
            style={{ fontFamily: "var(--font-display-org)" }}
          >
            {organizer?.name || "Organizer"}
          </h1>
          <p
            className="text-[11px] text-[var(--text-muted)] mt-2 uppercase tracking-[0.08em]"
            style={{ fontFamily: "var(--font-body-org)" }}
          >
            {organization?.name || ""}
            {organization?.follower_count !== undefined && (
              <> · {organization.follower_count} followers</>
            )}
          </p>
        </div>

        {!isPending && (
          <button
            onClick={handleCreateEvent}
            disabled={creatingEvent}
            className="self-start px-6 py-3 bg-[var(--copper)] text-[var(--bg-base)] text-[11px] uppercase tracking-[0.15em] rounded-[2px] hover:opacity-90 transition-opacity duration-200 disabled:opacity-50"
            style={{ fontFamily: "var(--font-display-org)" }}
          >
            {creatingEvent ? "Creating..." : "+ New Event"}
          </button>
        )}
      </div>

      {/* Stat Strip */}
      <div className="mb-12">
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
      <QuickActions />
    </div>
  );
}
