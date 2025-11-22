"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import { Registration } from "@/types/registration";
import { Loader2, MapPin, CalendarDays } from "lucide-react";
import {
  getEventRegistrations,
  updateRegistrationStatus,
} 

from "@/lib/api"; // ✅ use central api helpers

export default function RegistrationsPage() {
  const { id: eventId } = useParams(); // URL: /organizer/events/[eventId]/registrations

  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [eventDetails, setEventDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [passFilter, setPassFilter] = useState("all");

  // Modal
  const [selected, setSelected] = useState<Registration | null>(null);

  console.log("✅ Component mounted. eventId:", eventId);


  /** 🔹 Fetch Registrations */
  useEffect(() => {

    console.log("🎯 useEffect triggered with:", { eventId, statusFilter, passFilter, search });
    if (!eventId) {
      console.log("⚠️ eventId missing — aborting fetch");
      return;
    }  
    const fetchRegistrations = async () => {
      if (!eventId) return;

      setLoading(true);
      setError(null);

      try {
        // ✅ Call central API helper
        const data = await getEventRegistrations(eventId as string, {
          status: statusFilter !== "all" ? statusFilter : undefined,
          type: passFilter !== "all" ? passFilter : undefined,
          search: search || undefined,
        });

        setEventDetails(data.event || null);

        // ✅ Normalize backend → frontend
        setRegistrations(
          (data.registrations || []).map((r: any) => ({
            id: r.registration_id || "",
            buyer: r.name || "Unknown",
            passType: r.type || "Unknown",
            attendees: r.linked_attendees || [],
            date: r.created_date || "",
            status: (r.status || "pending").toLowerCase(),
            event: r.event || null,
            actions: r.actions || {},
          }))
        );
      } catch (err: any) {
        setError(err.message || "Failed to load registrations");
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, [eventId, statusFilter, passFilter, search]);

  /** 🔹 Handle Approve / Reject / Revoke / Reconsider */
  const handleAction = async (
    id: string,
    action: "approve" | "reject" | "revoke" | "reconsider"
  ) => {
    try {
      await updateRegistrationStatus(id, action);

      // Optimistic UI update
      setRegistrations((prev) =>
        prev.map((r) => {
          if (r.id !== id) return r;
          let newStatus = r.status;
          if (action === "approve") newStatus = "approved";
          if (action === "reject") newStatus = "rejected";
          if (["revoke", "reconsider"].includes(action))
            newStatus = "pending";
          return { ...r, status: newStatus };
        })
      );
    } catch (err: any) {
      console.error(err);
      alert(`Error: Could not ${action} registration.`);
    }
  };

  /** 🔹 Derived filters for display */
  const filtered = useMemo(() => {
    return registrations.filter((r) => {
      const matchesSearch =
        r.id.toLowerCase().includes(search.toLowerCase()) ||
        r.buyer.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ? true : r.status === statusFilter;
      const matchesPass =
        passFilter === "all" ? true : r.passType === passFilter;
      return matchesSearch && matchesStatus && matchesPass;
    });
  }, [registrations, search, statusFilter, passFilter]);

  /** 🔹 Stats Bar Data */
  const stats = [
    {
      label: "Pending",
      value: registrations.filter((r) => r.status === "pending").length,
      key: "pending",
    },
    {
      label: "Approved",
      value: registrations.filter((r) => r.status === "approved").length,
      key: "approved",
    },
    {
      label: "Rejected",
      value: registrations.filter((r) => r.status === "rejected").length,
      key: "rejected",
    },
  ];

  // ------------------- Render -------------------
  if (loading)
    return (
      <div className="flex justify-center items-center h-[80vh] text-gray-400">
        <Loader2 className="animate-spin mr-2" /> Loading registrations...
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-[80vh] text-red-400">
        ⚠️ {error}
      </div>
    );

  return (
    <div className="p-6 text-white space-y-6">
      {/* 🔹 Event Header */}
      {eventDetails && (
        <div className="bg-[#111] p-5 rounded-2xl border border-gray-800 shadow-lg">
          <h1 className="text-2xl font-semibold mb-2">
            {eventDetails.name || "Event"}
          </h1>
          <div className="flex flex-wrap gap-4 text-gray-400 text-sm">
            {eventDetails.date && (
              <div className="flex items-center gap-2">
                <CalendarDays size={16} /> {eventDetails.date}
              </div>
            )}
            {eventDetails.location && (
              <div className="flex items-center gap-2">
                <MapPin size={16} /> {eventDetails.location}
              </div>
            )}
            <div className="ml-auto text-gray-500 italic">
              {registrations.length} registration
              {registrations.length !== 1 && "s"}
            </div>
          </div>
        </div>
      )}

      {/* 🔹 Stats Bar */}
    </div>
  );
}
