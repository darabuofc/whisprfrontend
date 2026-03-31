"use client";

import { useEffect, useState, useCallback } from "react";
import { getAdminEvents, type AdminEvent } from "@/lib/adminApi";
import EventsTable from "@/components/admin/events/EventsTable";
import EventsFilters from "@/components/admin/events/EventsFilters";
import Pagination from "@/components/admin/shared/Pagination";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page };
      if (status) params.status = status;
      if (debouncedSearch) params.search = debouncedSearch;
      const res = await getAdminEvents(params);
      setEvents(res.data);
      setLastPage(res.meta?.last_page ?? 1);
    } catch (err) {
      console.error("Failed to fetch events:", err);
    } finally {
      setLoading(false);
    }
  }, [page, status, debouncedSearch]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [status, debouncedSearch]);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <h1
        className="text-[20px] font-medium text-[var(--text-primary)] tracking-tight"
        style={{ fontFamily: "var(--font-display-org)" }}
      >
        Events
      </h1>

      <EventsFilters
        status={status}
        onStatusChange={setStatus}
        search={search}
        onSearchChange={setSearch}
      />

      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-white/[0.03] rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <EventsTable events={events} />
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
