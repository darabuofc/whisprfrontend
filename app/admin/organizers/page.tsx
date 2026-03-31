"use client";

import { useEffect, useState, useCallback } from "react";
import { getAdminOrganizers, type AdminOrganizer } from "@/lib/adminApi";
import OrganizersTable from "@/components/admin/organizers/OrganizersTable";
import AddOrganizerModal from "@/components/admin/organizers/AddOrganizerModal";
import Pagination from "@/components/admin/shared/Pagination";
import { Plus } from "lucide-react";

export default function AdminOrganizersPage() {
  const [organizers, setOrganizers] = useState<AdminOrganizer[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchOrganizers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminOrganizers({ page });
      setOrganizers(res.data);
      setLastPage(res.meta?.last_page ?? 1);
    } catch (err) {
      console.error("Failed to fetch organizers:", err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchOrganizers();
  }, [fetchOrganizers]);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1
          className="text-[20px] font-medium text-[var(--text-primary)] tracking-tight"
          style={{ fontFamily: "var(--font-display-org)" }}
        >
          Organizers
        </h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[var(--copper)] text-[#0A0A0A] rounded-lg text-[12px] font-semibold hover:bg-[#B8785C] transition-colors"
          style={{ fontFamily: "var(--font-display-org)" }}
        >
          <Plus size={14} />
          Add Organizer
        </button>
      </div>

      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-white/[0.03] rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <OrganizersTable organizers={organizers} />
            <Pagination
              currentPage={page}
              lastPage={lastPage}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      <AddOrganizerModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCreated={fetchOrganizers}
      />
    </div>
  );
}
