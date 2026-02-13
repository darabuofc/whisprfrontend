"use client";

import { Search, Filter, Ticket, Loader2, ExternalLink, QrCode, Upload, ChevronDown, Check, MoreHorizontal, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { OrganizerTicket, OrganizerTicketsSummary } from "@/lib/api";

interface TicketsTableProps {
  tickets: OrganizerTicket[];
  summary: OrganizerTicketsSummary;
  loading: boolean;
  statusFilter: string[];
  onStatusFilterChange: (status: string[]) => void;
  passTypeFilter: string[];
  onPassTypeFilterChange: (passType: string[]) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  passTypes: { id: string; name: string }[];
  onImportClick?: () => void;
  onResendTicket?: (ticketId: string) => Promise<void> | void;
}

function TicketActionMenu({
  ticket,
  onResendTicket,
}: {
  ticket: OrganizerTicket;
  onResendTicket?: (ticketId: string) => Promise<void> | void;
}) {
  const [open, setOpen] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const canResend = Boolean(onResendTicket);

  const handleResend = async () => {
    if (!onResendTicket || isResending) return;
    setIsResending(true);
    try {
      await onResendTicket(ticket.id);
      setOpen(false);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/40 hover:bg-white/[0.08] hover:text-white/70 transition-colors"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <MoreHorizontal size={15} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-30 min-w-[170px] py-1 bg-[#141414] border border-white/[0.08] rounded-xl shadow-xl shadow-black/40">
          {ticket.ticket_url && (
            <a
              href={ticket.ticket_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full px-3 py-2 flex items-center gap-2.5 text-sm text-white/70 hover:bg-white/[0.06]"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={14} />
              View Ticket
            </a>
          )}
          {ticket.qr_code_url && (
            <a
              href={ticket.qr_code_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full px-3 py-2 flex items-center gap-2.5 text-sm text-white/70 hover:bg-white/[0.06]"
              onClick={(e) => e.stopPropagation()}
            >
              <QrCode size={14} />
              View QR
            </a>
          )}
          {canResend && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleResend();
              }}
              disabled={isResending}
              className="w-full px-3 py-2 flex items-center gap-2.5 text-sm text-emerald-300 hover:bg-emerald-500/10 disabled:opacity-50"
            >
              {isResending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Resend Ticket
            </button>
          )}
        </div>
      )}
    </div>
  );
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
  onResendTicket,
}: TicketsTableProps) {
  const [statusOpen, setStatusOpen] = useState(false);
  const [passTypeOpen, setPassTypeOpen] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);
  const passTypeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!statusOpen && !passTypeOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (statusRef.current && statusRef.current.contains(e.target as Node)) return;
      if (passTypeRef.current && passTypeRef.current.contains(e.target as Node)) return;
      setStatusOpen(false);
      setPassTypeOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [statusOpen, passTypeOpen]);

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "used", label: "Used" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const statusLabelMap = new Map(statusOptions.map((option) => [option.value, option.label]));
  const passTypeLabelMap = new Map(passTypes.map((pt) => [pt.id, pt.name]));

  const handleStatusToggle = (value: string) => {
    const next = statusFilter.includes(value)
      ? statusFilter.filter((s) => s !== value)
      : [...statusFilter, value];
    onStatusFilterChange(next);
  };

  const handlePassTypeToggle = (value: string) => {
    const next = passTypeFilter.includes(value)
      ? passTypeFilter.filter((s) => s !== value)
      : [...passTypeFilter, value];
    onPassTypeFilterChange(next);
  };
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
              <div ref={statusRef} className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={15} />
                <button
                  type="button"
                  onClick={() => setStatusOpen((prev) => !prev)}
                  className="pl-9 pr-9 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/90 text-sm focus:outline-none focus:border-white/20 cursor-pointer inline-flex items-center gap-2"
                  aria-expanded={statusOpen}
                  aria-haspopup="listbox"
                >
                  <span className="text-white/80">
                    {statusFilter.length === 0 ? "All Status" : `Status (${statusFilter.length})`}
                  </span>
                  <ChevronDown size={14} className="text-white/40" />
                </button>
                {statusOpen && (
                  <div className="absolute right-0 mt-2 min-w-[200px] z-30 rounded-xl border border-white/[0.08] bg-[#141414] shadow-xl shadow-black/40 p-2">
                    {statusOptions.map((option) => {
                      const checked = statusFilter.includes(option.value);
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleStatusToggle(option.value)}
                          className="w-full px-2 py-2 rounded-lg flex items-center gap-2 text-sm text-white/80 hover:bg-white/[0.06]"
                          role="option"
                          aria-selected={checked}
                        >
                          <span
                            className={`w-4 h-4 rounded border flex items-center justify-center ${
                              checked
                                ? "bg-[#C1FF72] border-[#C1FF72] text-black"
                                : "border-white/[0.2] text-transparent"
                            }`}
                          >
                            <Check size={12} />
                          </span>
                          {option.label}
                        </button>
                      );
                    })}
                    {statusFilter.length > 0 && (
                      <button
                        type="button"
                        onClick={() => onStatusFilterChange([])}
                        className="mt-1 w-full px-2 py-2 rounded-lg text-xs text-white/50 hover:text-white/70 hover:bg-white/[0.06]"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                )}
              </div>
              {/* Pass Type filter */}
              {passTypes.length > 0 && (
                <div ref={passTypeRef} className="relative">
                  <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={15} />
                  <button
                    type="button"
                    onClick={() => setPassTypeOpen((prev) => !prev)}
                    className="pl-9 pr-9 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/90 text-sm focus:outline-none focus:border-white/20 cursor-pointer inline-flex items-center gap-2"
                    aria-expanded={passTypeOpen}
                    aria-haspopup="listbox"
                  >
                    <span className="text-white/80">
                      {passTypeFilter.length === 0 ? "All Passes" : `Passes (${passTypeFilter.length})`}
                    </span>
                    <ChevronDown size={14} className="text-white/40" />
                  </button>
                  {passTypeOpen && (
                    <div className="absolute right-0 mt-2 min-w-[220px] z-30 rounded-xl border border-white/[0.08] bg-[#141414] shadow-xl shadow-black/40 p-2 max-h-64 overflow-auto">
                      {passTypes.map((pt) => {
                        const checked = passTypeFilter.includes(pt.id);
                        return (
                          <button
                            key={pt.id}
                            type="button"
                            onClick={() => handlePassTypeToggle(pt.id)}
                            className="w-full px-2 py-2 rounded-lg flex items-center gap-2 text-sm text-white/80 hover:bg-white/[0.06]"
                            role="option"
                            aria-selected={checked}
                          >
                            <span
                              className={`w-4 h-4 rounded border flex items-center justify-center ${
                                checked
                                  ? "bg-[#C1FF72] border-[#C1FF72] text-black"
                                  : "border-white/[0.2] text-transparent"
                              }`}
                            >
                              <Check size={12} />
                            </span>
                            {pt.name}
                          </button>
                        );
                      })}
                      {passTypeFilter.length > 0 && (
                        <button
                          type="button"
                          onClick={() => onPassTypeFilterChange([])}
                          className="mt-1 w-full px-2 py-2 rounded-lg text-xs text-white/50 hover:text-white/70 hover:bg-white/[0.06]"
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                  )}
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
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
                      <span className="text-white/40 text-sm">Loading tickets...</span>
                    </div>
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white/[0.02] flex items-center justify-center">
                        <Ticket className="w-5 h-5 text-white/20" />
                      </div>
                      <div>
                        <p className="text-white/70 text-sm font-medium">No tickets found</p>
                        <p className="text-white/30 text-xs mt-1">
                          {statusFilter.length > 0 || passTypeFilter.length > 0 || searchQuery
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
                      <div className="flex items-center justify-end">
                        <TicketActionMenu ticket={ticket} onResendTicket={onResendTicket} />
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
            {statusFilter.length > 0 && (
              <span>
                {" "}with status <span className="text-white/60">{statusFilter.map((s) => statusLabelMap.get(s) || s).join(", ")}</span>
              </span>
            )}
            {passTypeFilter.length > 0 && (
              <span>
                {" "}and pass <span className="text-white/60">{passTypeFilter.map((id) => passTypeLabelMap.get(id) || id).join(", ")}</span>
              </span>
            )}
          </p>
        </div>
      )}
      </div>
    </div>
  );
}
