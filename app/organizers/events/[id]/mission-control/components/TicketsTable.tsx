"use client";

import { Search, Filter, Ticket, Loader2, ExternalLink, QrCode, Upload } from "lucide-react";
import { motion } from "framer-motion";
import type { OrganizerTicket, OrganizerTicketsSummary } from "@/lib/api";

interface TicketsTableProps {
  tickets: OrganizerTicket[];
  summary: OrganizerTicketsSummary;
  loading: boolean;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  passTypeFilter: string;
  onPassTypeFilterChange: (passType: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  passTypes: { id: string; name: string }[];
  onImportClick?: () => void;
}

export default function TicketsTable({
  tickets,
  summary,
  loading,
  statusFilter,
  onStatusFilterChange,
  passTypeFilter,
  onPassTypeFilterChange,
  searchQuery,
  onSearchChange,
  passTypes,
  onImportClick,
}: TicketsTableProps) {
  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "inactive":
        return "bg-white/[0.04] text-white/40 border-white/[0.08]";
      case "used":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "cancelled":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      default:
        return "bg-white/[0.04] text-white/50 border-white/[0.08]";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
          <p className="text-xs text-white/40 uppercase tracking-wider">Total Tickets</p>
          <p className="text-2xl font-semibold text-white/90 mt-1">{summary.total}</p>
        </div>
        {Object.entries(summary.by_status).slice(0, 3).map(([status, count]) => (
          <div key={status} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
            <p className="text-xs text-white/40 uppercase tracking-wider">{status}</p>
            <p className="text-2xl font-semibold text-white/90 mt-1">{count}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
        {/* Header with filters */}
        <div className="p-6 border-b border-white/[0.06]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-medium text-white/90">Event Tickets</h2>
              <p className="text-sm text-white/40 mt-1">
                View and manage all issued tickets
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {/* Import Button */}
              {onImportClick && (
                <motion.button
                  onClick={onImportClick}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium bg-[#C1FF72] text-black shadow-[0_0_20px_rgba(193,255,114,0.3)] hover:shadow-[0_0_30px_rgba(193,255,114,0.4)] transition-shadow"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Upload size={15} />
                  <span className="text-sm">Import</span>
                </motion.button>
              )}
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={15} />
                <input
                  type="text"
                  placeholder="Search name, email, phone..."
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
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Used">Used</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              {/* Pass Type filter */}
              {passTypes.length > 0 && (
                <div className="relative">
                  <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={15} />
                  <select
                    value={passTypeFilter}
                    onChange={(e) => onPassTypeFilterChange(e.target.value)}
                    className="pl-9 pr-8 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/90 text-sm focus:outline-none focus:border-white/20 appearance-none cursor-pointer"
                  >
                    <option value="">All Passes</option>
                    {passTypes.map((pt) => (
                      <option key={pt.id} value={pt.id}>
                        {pt.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/[0.02] border-b border-white/[0.06]">
              <tr>
                <th className="text-left px-6 py-3.5 text-[11px] font-medium uppercase tracking-wider text-white/30">
                  Attendee
                </th>
                <th className="text-left px-6 py-3.5 text-[11px] font-medium uppercase tracking-wider text-white/30">
                  Pass Type
                </th>
                <th className="text-left px-6 py-3.5 text-[11px] font-medium uppercase tracking-wider text-white/30">
                  Purchase Date
                </th>
                <th className="text-left px-6 py-3.5 text-[11px] font-medium uppercase tracking-wider text-white/30">
                  Status
                </th>
                <th className="text-left px-6 py-3.5 text-[11px] font-medium uppercase tracking-wider text-white/30">
                  Registration
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
                      <span className="text-white/40 text-sm">Loading tickets...</span>
                    </div>
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white/[0.02] flex items-center justify-center">
                        <Ticket className="w-5 h-5 text-white/20" />
                      </div>
                      <div>
                        <p className="text-white/70 text-sm font-medium">No tickets found</p>
                        <p className="text-white/30 text-xs mt-1">
                          {statusFilter || passTypeFilter || searchQuery
                            ? "Try adjusting your filters"
                            : "Tickets will appear here after registrations are paid"}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {ticket.attendee.profile_picture ? (
                          <img
                            src={ticket.attendee.profile_picture}
                            alt={ticket.attendee.name}
                            className="w-8 h-8 rounded-full object-cover border border-white/[0.08]"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
                            <span className="text-sm font-medium text-violet-400">
                              {ticket.attendee.name?.charAt(0)?.toUpperCase() || "?"}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-white/80">{ticket.attendee.name}</p>
                          <p className="text-xs text-white/40">{ticket.attendee.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-white/70">{ticket.pass_type.name}</p>
                        {ticket.pass_type.price > 0 && (
                          <p className="text-xs text-white/40 tabular-nums">
                            Rs. {ticket.pass_type.price.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-white/60">
                        {formatDate(ticket.purchase_date)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getStatusStyles(
                          ticket.status
                        )}`}
                      >
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-white/50 tabular-nums">
                        {ticket.registration.registration_id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {ticket.qr_code_url && (
                          <a
                            href={ticket.qr_code_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/50 hover:bg-white/[0.08] hover:text-white/80 transition-colors"
                            title="View QR Code"
                          >
                            <QrCode size={14} />
                          </a>
                        )}
                        {ticket.ticket_url && (
                          <a
                            href={ticket.ticket_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-8 px-3 flex items-center justify-center gap-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/50 hover:bg-white/[0.08] hover:text-white/80 transition-colors text-xs font-medium"
                            title="View Ticket PDF"
                          >
                            <ExternalLink size={13} />
                            Ticket
                          </a>
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
        {!loading && tickets.length > 0 && (
          <div className="px-6 py-4 border-t border-white/[0.06] bg-white/[0.01]">
            <p className="text-sm text-white/30">
              Showing <span className="text-white/60 font-medium">{tickets.length}</span>{" "}
              ticket{tickets.length !== 1 ? "s" : ""}
              {statusFilter && (
                <span>
                  {" "}with status <span className="text-white/60">{statusFilter}</span>
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
