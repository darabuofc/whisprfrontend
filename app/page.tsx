"use client";
import { useEffect, useState } from "react";
import { getEvents } from "@/lib/api";
import EventCard from "@/components/EventCard";

export default function HomePage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getEvents();
        setEvents(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="text-gray-400">Loading events…</div>;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {events.map((ev) => <EventCard key={ev.id} event={ev} />)}
      {!events.length && <div className="text-gray-500">No events yet.</div>}
    </div>
  );
}
