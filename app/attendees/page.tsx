// app/attendees/page.tsx
"use client";
export const dynamic = "force-dynamic";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function AttendeesContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");
  const [attendees, setAttendees] = useState<string[]>([]);

  useEffect(() => {
    // Example: simulate loading attendees
    setTimeout(() => {
      setAttendees(["Ayesha", "Bilal", "Hamza", "Zara"]);
    }, 800);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <h1 className="text-3xl font-bold mb-4">Whispr Attendees</h1>

      {ref && (
        <p className="text-lime-400 mb-6">
          Invitation Code: <span className="font-mono">{ref}</span>
        </p>
      )}

      {attendees.length === 0 ? (
        <p className="text-gray-400 animate-pulse">Loading attendees...</p>
      ) : (
        <ul className="space-y-2">
          {attendees.map((name) => (
            <li
              key={name}
              className="bg-neutral-900 px-4 py-2 rounded-lg border border-lime-500/30"
            >
              {name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AttendeesPage() {
  return (
    <Suspense fallback={<div className="text-center p-10 text-gray-400">Loading...</div>}>
      <AttendeesContent />
    </Suspense>
  );
}
