"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  getAdminOrganizer,
  type AdminOrganizerDetail,
} from "@/lib/adminApi";
import OrganizerProfile from "@/components/admin/organizers/OrganizerProfile";
import OrganizerEventsList from "@/components/admin/organizers/OrganizerEventsList";
import StatusBadge from "@/components/admin/shared/StatusBadge";

export default function AdminOrganizerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [organizer, setOrganizer] = useState<AdminOrganizerDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrganizer = async () => {
      try {
        const res = await getAdminOrganizer(id);
        setOrganizer(res);
      } catch (err) {
        console.error("Failed to fetch organizer:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrganizer();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-white/[0.04] rounded-lg animate-pulse" />
        <div className="h-48 bg-white/[0.04] rounded-2xl animate-pulse" />
        <div className="h-32 bg-white/[0.04] rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!organizer) {
    return (
      <div className="p-6 lg:p-8 text-center text-[var(--text-muted)]">
        Organizer not found
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/admin/organizers")}
          className="p-1.5 rounded-md hover:bg-white/[0.06] text-[var(--text-muted)] transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-3">
          <h1
            className="text-[20px] font-medium text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-display-org)" }}
          >
            {organizer.name}
          </h1>
          <StatusBadge status={organizer.status} />
        </div>
      </div>

      <OrganizerProfile
        organizer={organizer}
        onUpdated={(updated) =>
          setOrganizer((prev) => (prev ? { ...prev, ...updated } : prev))
        }
      />

      <OrganizerEventsList events={organizer.events ?? []} />
    </div>
  );
}
