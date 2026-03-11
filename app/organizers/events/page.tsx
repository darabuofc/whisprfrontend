"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function OrganizerEventsPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("whispr_token") || localStorage.getItem("token")
        : null;
    const role = typeof window !== "undefined" ? localStorage.getItem("whispr_role") : null;

    if (!token) {
      router.replace("/auth?role=organizer");
      return;
    }
    if (role && role !== "organizer") {
      router.replace(role === "attendee" ? "/attendees/dashboard" : "/auth");
      return;
    }

    setAuthorized(true);
  }, [router]);

  if (!authorized) return <div className="p-8">Checking access...</div>;

  return (
    <div className="card p-6">
      <h1 className="text-xl font-semibold text-accent-pink mb-2" style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>Organizer — Events</h1>
      <p className="text-gray-400 text-sm" style={{ fontFamily: "var(--font-body)" }}>Build this page to create and manage events.</p>
    </div>
  );
}
