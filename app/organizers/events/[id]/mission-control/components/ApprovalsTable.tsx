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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "approved":
        return "bg-whispr-accent/20 text-whispr-accent border-whispr-accent/30";
      case "rejected":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "revoked":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      default:
        return "bg-white/10 text-whispr-muted border-white/10";
    }
  };

  const renderLinkedAttendees = (attendees: LinkedAttendee[]) => {
    if (!attendees || attendees.length === 0) {
      return <span className="text-whispr-muted">-</span>;
    }

    if (attendees.length === 1) {
      return (
        <div className="flex items-center gap-2">
          {attendees[0].profile_picture ? (
            <img
              src={attendees[0].profile_picture}
              alt={attendees[0].name}
              className="w-6 h-6 rounded-full object-cover border border-white/10"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-whispr-purple/20 flex items-center justify-center border border-whispr-purple/30">
              <span className="text-xs text-whispr-purple">
                {attendees[0].name?.charAt(0)?.toUpperCase() || "?"}
              </span>
            </div>
          )}
          <span className="text-whispr-text/80 text-sm">{attendees[0].name}</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1">
        <div className="flex -space-x-2">
          {attendees.slice(0, 3).map((attendee, index) => (
            <div key={attendee.id || index} className="relative">
              {attendee.profile_picture ? (
                <img
                  src={attendee.profile_picture}
                  alt={attendee.name}
                  className="w-6 h-6 rounded-full object-cover border-2 border-whispr-bg"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-whispr-purple/20 flex items-center justify-center border-2 border-whispr-bg">
                  <span className="text-xs text-whispr-purple">
                    {attendee.name?.charAt(0)?.toUpperCase() || "?"}
                  </span>
                </div>
              )}
            </div>
          ))}
          {attendees.length > 3 && (
            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center border-2 border-whispr-bg">
              <span className="text-xs text-whispr-muted">+{attendees.length - 3}</span>
            </div>
          )}
        </div>
        <span className="text-whispr-muted text-sm ml-2">
          {attendees.length} linked
        </span>
      </div>
    );
  };

  return (
    <div className="glass rounded-2xl overflow-hidden">
      {/* Header with filters */}
      <div className="p-6 border-b border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-whispr-text">Registration Approvals</h2>
            <p className="text-sm text-whispr-muted mt-1">
              Review and manage registration requests
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-whispr-muted" size={16} />
              <input
                type="text"
                placeholder="Search registrations..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-whispr-text placeholder-whispr-muted focus:outline-none focus:border-whispr-accent/50 focus:ring-1 focus:ring-whispr-accent/30 transition-all"
              />
            </div>
            {/* Status filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-whispr-muted" size={16} />
              <select
                value={statusFilter}
                onChange={(e) => onStatusFilterChange(e.target.value)}
                className="pl-10 pr-8 py-2.5 bg-white/5 border border-white/10 rounded-xl text-whispr-text focus:outline-none focus:border-whispr-accent/50 appearance-none cursor-pointer"
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
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="text-left px-6 py-4 text-[11px] font-medium uppercase tracking-[0.12em] text-whispr-muted">
                Registration #
              </th>
              <th className="text-left px-6 py-4 text-[11px] font-medium uppercase tracking-[0.12em] text-whispr-muted">
                Primary Attendee
              </th>
              <th className="text-left px-6 py-4 text-[11px] font-medium uppercase tracking-[0.12em] text-whispr-muted">
                Linked Attendees
              </th>
              <th className="text-left px-6 py-4 text-[11px] font-medium uppercase tracking-[0.12em] text-whispr-muted">
                Status
              </th>
              <th className="text-right px-6 py-4 text-[11px] font-medium uppercase tracking-[0.12em] text-whispr-muted">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-whispr-accent animate-spin" />
                    <span className="text-whispr-muted">Loading registrations...</span>
                  </div>
                </td>
              </tr>
            ) : registrations.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                      <Users className="w-8 h-8 text-whispr-muted" />
                    </div>
                    <div>
                      <p className="text-whispr-text font-medium">No registrations found</p>
                      <p className="text-whispr-muted text-sm mt-1">
                        {statusFilter || searchQuery
                          ? "Try adjusting your filters"
                          : "Registrations will appear here when submitted"}
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              registrations.map((registration) => (
                <tr
                  key={registration.registration_id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4">
                    <span
                      className="text-sm font-mono text-whispr-text"
                      style={{ fontFeatureSettings: '"tnum"' }}
                    >
                      {registration.registration_id}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-whispr-accent/10 flex items-center justify-center border border-whispr-accent/20">
                        <span className="text-sm font-medium text-whispr-accent">
                          {registration.name?.charAt(0)?.toUpperCase() || "?"}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-whispr-text">{registration.name}</p>
                        <p className="text-xs text-whispr-muted">{registration.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {renderLinkedAttendees(registration.linked_attendees)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
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
                          onClick={() => handleApprove(registration.registration_id)}
                          disabled={actionLoading === registration.registration_id}
                          className="w-9 h-9 flex items-center justify-center rounded-lg bg-whispr-accent/10 border border-whispr-accent/20 text-whispr-accent hover:bg-whispr-accent hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Approve"
                        >
                          {actionLoading === registration.registration_id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Check size={16} strokeWidth={2.5} />
                          )}
                        </button>
                      )}
                      {registration.actions?.canReject && (
                        <button
                          onClick={() => handleReject(registration.registration_id)}
                          disabled={actionLoading === registration.registration_id}
                          className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Reject"
                        >
                          {actionLoading === registration.registration_id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <X size={16} strokeWidth={2.5} />
                          )}
                        </button>
                      )}
                      {!registration.actions?.canApprove && !registration.actions?.canReject && (
                        <span className="text-xs text-whispr-muted">No actions</span>
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
        <div className="px-6 py-4 border-t border-white/10 bg-white/5">
          <p className="text-sm text-whispr-muted">
            Showing <span className="text-whispr-text font-medium">{registrations.length}</span>{" "}
            registration{registrations.length !== 1 ? "s" : ""}
            {statusFilter && (
              <span>
                {" "}
                with status <span className="text-whispr-accent">{statusFilter}</span>
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
