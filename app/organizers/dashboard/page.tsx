"use client";

import { useEffect, useState } from "react";
import { getOrganizer, getEvents, createDraftEvent } from "@/lib/api"; // helper functions
import { Plus, Calendar } from "lucide-react";

interface Event {
  id: string;
  fields: {
    Name?: string;
    Date?: string;
    Location?: string;
    Status?: string;
  };
}

export default function OrganizerDashboard() {
  const [organizer, setOrganizer] = useState<any>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch organizer + events on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const org = await getOrganizer(); // /me endpoint (JWT)
        const evs = await getEvents();    // /organizer/events
        setOrganizer(org);
        setEvents(evs);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreateEvent = async () => {
    try {
      const draft = await createDraftEvent(); // POST /organizer/events/start
      window.location.href = `/organizers/events/${draft.id}/onboarding`; // redirect to flow
    } catch (e) {
      console.error(e);
      alert("Failed to create event");
    }
  };

  if (loading) return <div className="p-8">Loading dashboard...</div>;

  return (
    <div className="pt-20 container mx-auto p-8 space-y-8">
      {/* Organizer Profile */}
      {organizer && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-md">
          <h2 className="text-xl font-bold mb-2">Welcome back, {organizer.name} 👋</h2>
          <p className="text-gray-400">{organizer.email}</p>
          <p className="text-sm text-gray-500 mt-1">Role: {organizer.role}</p>
        </div>
      )}

      {/* Create Event Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Your Events</h3>
        <button
          onClick={handleCreateEvent}
          className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-xl transition"
        >
          <Plus size={18} /> Create Event
        </button>
      </div>

      {/* Events List */}
      {events.length === 0 ? (
        <p className="text-gray-500">No events yet. Click "Create Event" to start!</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="bg-gray-800 border border-gray-700 rounded-xl p-5 shadow hover:shadow-lg transition"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold">{ev.fields.Name || "Untitled Event"}</h4>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    ev.fields.Status === "published"
                      ? "bg-green-600/20 text-green-400"
                      : "bg-yellow-600/20 text-yellow-400"
                  }`}
                >
                  {ev.fields.Status || "draft"}
                </span>
              </div>
              <p className="text-sm text-gray-400 flex items-center gap-2">
                <Calendar size={14} />
                {ev.fields.Date || "No date set"}
              </p>
              <p className="text-sm text-gray-500 mt-1">{ev.fields.Location || "No location"}</p>

              <a
                href={`/organizers/events/${ev.id}`}
                className="block mt-4 text-cyan-400 hover:text-cyan-300 text-sm font-medium"
              >
                Manage →
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
