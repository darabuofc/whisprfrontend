import Link from "next/link";

export default function EventCard({ event }: { event: any }) {
  return (
    <Link href={`/events/${event.id}`} className="card hover:shadow-glow transition block">
      <div className="p-4">
        <div className="text-sm text-gray-400">{new Date(event.start_time).toLocaleString()}</div>
        <h3 className="text-lg font-semibold mt-1 text-accent-pink">{event.title}</h3>
        {event.tagline && <p className="text-gray-400 text-sm mt-1">{event.tagline}</p>}
        {event.location && <p className="text-xs text-gray-500 mt-2">{event.location}</p>}
      </div>
    </Link>
  );
}
