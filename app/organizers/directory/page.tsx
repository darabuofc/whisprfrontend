"use client";

import { useEffect, useRef, useState } from "react";
import { getDirectory } from "@/lib/api";
import DirectoryTable from "@/components/organizer/DirectoryTable";
import { useOnboarding } from "@/onboarding/context/useOnboarding";

export default function DirectoryPage() {
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  let onboarding: ReturnType<typeof useOnboarding> | null = null;
  try {
    onboarding = useOnboarding();
  } catch {
    // Not in onboarding context
  }

  const advancedRef = useRef(false);
  useEffect(() => {
    if (
      !advancedRef.current &&
      onboarding?.isOnboarding &&
      onboarding?.currentStage === "S3"
    ) {
      advancedRef.current = true;
      onboarding.advanceStage("S3", "S4");
    }
  }, [onboarding]);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const data = await getDirectory();
        setTotal(data.total);
      } catch {
        // endpoint may not exist yet
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
        Directory
      </h1>

      {!loading && (
        <p
          className="text-[36px] text-[var(--text-primary)] leading-none mb-10"
          style={{ fontFamily: "var(--font-display-org)" }}
        >
          {total}
        </p>
      )}

      <DirectoryTable />
    </div>
  );
}
