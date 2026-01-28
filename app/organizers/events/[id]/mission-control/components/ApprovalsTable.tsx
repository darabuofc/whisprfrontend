"use client";

import { Check, X, Search, Filter, Users, Loader2 } from "lucide-react";
import { useState } from "react";
import type { RegistrationListItem, LinkedAttendee } from "../page";

interface ApprovalsTableProps {
  registrations: RegistrationListItem[];
  loading: boolean;
  onApprove: (registrationId: string) => void;
  onReject: (registrationId: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRowClick?: (registration: RegistrationListItem) => void;
}

export default function ApprovalsTable({
  registrations,
  loading,
  onApprove,
  onReject,
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchChange,
  onRowClick,
}: ApprovalsTableProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await onApprove(id);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    try {
      await onReject(id);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "approved":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "rejected":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "revoked":
        return "bg-white/[0.04] text-white/40 border-white/[0.08]";
      default:
        return "bg-white/[0.04] text-white/50 border-white/[0.08]";
    }
  };

  const renderLinkedAttendees = (attendees: LinkedAttendee[]) => {
    if (!attendees || attendees.length === 0) {
      return <span className="text-white/30">—</span>;
    }

    if (attendees.length === 1) {
      return (
        <div className="flex items-center gap-2">
          {attendees[0].profile_picture ? (
            <img
              src={attendees[0].profile_picture}
              alt={attendees[0].name}
              className="w-6 h-6 rounded-full object-cover border border-white/[0.08]"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
              <span className="text-xs text-violet-400">
                {attendees[0].name?.charAt(0)?.toUpperCase() || "?"}
              </span>
            </div>
          )}
          <span className="text-white/60 text-sm">{attendees[0].name}</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1">
        <div className="flex -space-x-1.5">
          {attendees.slice(0, 3).map((attendee, index) => (
            <div key={attendee.id || index} className="relative">
              {attendee.profile_picture ? (
                <img
                  src={attendee.profile_picture}
                  alt={attendee.name}
                  className="w-6 h-6 rounded-full object-cover border-2 border-[#0a0a0a]"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-violet-500/10 flex items-center justify-center border-2 border-[#0a0a0a]">
                  <span className="text-xs text-violet-400">
                    {attendee.name?.charAt(0)?.toUpperCase() || "?"}
                  </span>
                </div>
              )}
            </div>
          ))}
          {attendees.length > 3 && (
            <div className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center border-2 border-[#0a0a0a]">
              <span className="text-[10px] text-white/40">+{attendees.length - 3}</span>
            </div>
          )}
        </div>
        <span className="text-white/30 text-sm ml-2">
          {attendees.length} linked
        </span>
      </div>
    );
  };

  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
      {/* Header with filters */}
      <div className="p-6 border-b border-white/[0.06]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-medium text-white/90">Registration Approvals</h2>
            <p className="text-sm text-white/40 mt-1">
              Review and manage registration requests
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={15} />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full sm:w-56 pl-9 pr-4 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/90 text-sm placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>
            {/* Status filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={15} />
              <select
                value={statusFilter}
                onChange={(e) => onStatusFilterChange(e.target.value)}
                className="pl-9 pr-8 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/90 text-sm focus:outline-none focus:border-white/20 appearance-none cursor-pointer"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/[0.02] border-b border-white/[0.06]">
            <tr>
              <th className="text-left px-6 py-3.5 text-[11px] font-medium uppercase tracking-wider text-white/30">
                Registration #
              </th>
              <th className="text-left px-6 py-3.5 text-[11px] font-medium uppercase tracking-wider text-white/30">
                Primary Attendee
              </th>
              <th className="text-left px-6 py-3.5 text-[11px] font-medium uppercase tracking-wider text-white/30">
                Pass Price
              </th>
              <th className="text-left px-6 py-3.5 text-[11px] font-medium uppercase tracking-wider text-white/30">
                Linked Attendees
              </th>
              <th className="text-left px-6 py-3.5 text-[11px] font-medium uppercase tracking-wider text-white/30">
                Status
              </th>
              <th className="text-right px-6 py-3.5 text-[11px] font-medium uppercase tracking-wider text-white/30">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
                    <span className="text-white/40 text-sm">Loading registrations...</span>
                  </div>
                </td>
              </tr>
            ) : registrations.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/[0.02] flex items-center justify-center">
                      <Users className="w-5 h-5 text-white/20" />
                    </div>
                    <div>
                      <p className="text-white/70 text-sm font-medium">No registrations found</p>
                      <p className="text-white/30 text-xs mt-1">
                        {statusFilter || searchQuery
                          ? "Try adjusting your filters"
                          : "Registrations will appear here"}
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              registrations.map((registration) => (
                <tr
                  key={registration.registration_id}
                  onClick={() => onRowClick?.(registration)}
                  className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono text-white/70 tabular-nums">
                      {registration.registration_id}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                        <span className="text-sm font-medium text-emerald-400">
                          {registration.name?.charAt(0)?.toUpperCase() || "?"}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white/80">{registration.name}</p>
                        <p className="text-xs text-white/30">{registration.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {registration.price !== null && registration.price !== undefined ? (
                      <span className="text-sm font-medium text-white/70 tabular-nums">
                        Rs. {registration.price.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-white/30">Free</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {renderLinkedAttendees(registration.linked_attendees)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getStatusStyles(
                        registration.status
                      )}`}
                    >
                      {registration.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {registration.actions?.canApprove && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApprove(registration.registration_id);
                          }}
                          disabled={actionLoading === registration.registration_id}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Approve"
                        >
                          {actionLoading === registration.registration_id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Check size={14} strokeWidth={2.5} />
                          )}
                        </button>
                      )}
                      {registration.actions?.canReject && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReject(registration.registration_id);
                          }}
                          disabled={actionLoading === registration.registration_id}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Reject"
                        >
                          {actionLoading === registration.registration_id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <X size={14} strokeWidth={2.5} />
                          )}
                        </button>
                      )}
                      {!registration.actions?.canApprove && !registration.actions?.canReject && (
                        <span className="text-xs text-white/20">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer with count */}
      {!loading && registrations.length > 0 && (
        <div className="px-6 py-4 border-t border-white/[0.06] bg-white/[0.01]">
          <p className="text-sm text-white/30">
            Showing <span className="text-white/60 font-medium">{registrations.length}</span>{" "}
            registration{registrations.length !== 1 ? "s" : ""}
            {statusFilter && (
              <span>
                {" "}with status <span className="text-white/60">{statusFilter}</span>
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
