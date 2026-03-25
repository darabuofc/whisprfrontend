"use client";

import { useEffect, useState } from "react";
import { getOrganizerFollowers } from "@/lib/api";
import FollowerList from "@/components/organizer/FollowerList";

export default function FollowersPage() {
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const data = await getOrganizerFollowers();
        setTotal(data.total);
      } catch {
        // Endpoint may not exist yet — gracefully handle
      } finally {
        setLoading(false);
      }
    };
    fetchCount();
  }, []);

  return (
    <div className="max-w-[1100px] mx-auto px-6 sm:px-12 py-20">
      <h1
        className="text-[14px] uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-2"
        style={{ fontFamily: "var(--font-display-org)" }}
      >
        Followers
      </h1>

      {!loading && (
        <p
          className="text-[36px] text-[var(--copper)] leading-none mb-10"
          style={{ fontFamily: "var(--font-display-org)" }}
        >
          {total}
        </p>
      )}

      <FollowerList />
    </div>
  );
}
