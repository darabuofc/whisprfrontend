"use client";

import { useEffect, useState, useCallback } from "react";
import { getAdminAttendees, type AdminAttendee } from "@/lib/adminApi";
import AttendeesTable from "@/components/admin/attendees/AttendeesTable";
import Pagination from "@/components/admin/shared/Pagination";
import { Search } from "lucide-react";

export default function AdminAttendeesPage() {
  const [attendees, setAttendees] = useState<AdminAttendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchAttendees = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page };
      if (debouncedSearch) params.search = debouncedSearch;
      const res = await getAdminAttendees(params);
      setAttendees(res.data);
      setLastPage(res.meta?.last_page ?? 1);
    } catch (err) {
      console.error("Failed to fetch attendees:", err);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchAttendees();
  }, [fetchAttendees]);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <h1
        className="text-[20px] font-medium text-[var(--text-primary)] tracking-tight"
        style={{ fontFamily: "var(--font-display-org)" }}
      >
        Attendees
      </h1>

      <div className="relative max-w-md">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or phone..."
          className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg pl-9 pr-4 py-2 text-[13px] text-[var(--text-primary)] placeholder:text-white/20 focus:border-[var(--copper)]/40 focus:outline-none transition-colors"
          style={{ fontFamily: "var(--font-body-org)" }}
        />
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
            <AttendeesTable attendees={attendees} />
            <Pagination
              currentPage={page}
              lastPage={lastPage}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
