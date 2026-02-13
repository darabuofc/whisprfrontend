"use client";

import { Check, X, Search, Filter, Users, Loader2, RotateCcw, CreditCard, Eye, AlertTriangle, MoreHorizontal, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { RegistrationListItem, LinkedAttendee } from "../page";

interface ApprovalsTableProps {
  registrations: RegistrationListItem[];
  loading: boolean;
  onApprove: (registrationId: string) => void;
  onReject: (registrationId: string) => void;
  onRevoke: (registrationId: string) => void;
  onMarkPaid: (registrationId: string) => void;
  statusFilter: string[];
  onStatusFilterChange: (status: string[]) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  genderMismatchOnly: boolean;
  onGenderMismatchOnlyChange: (value: boolean) => void;
  onRowClick?: (registration: RegistrationListItem) => void;
}

interface ActionLoadingState {
  id: string;
  action: string;
}

function ActionMenu({
  registration,
  actionLoading,
  onAction,
  onMarkPaid,
  onRevoke,
  onRowClick,
}: {
  registration: RegistrationListItem;
  actionLoading: ActionLoadingState | null;
  onAction: (id: string, actionName: string, callback: (id: string) => Promise<void> | void) => void;
  onMarkPaid: (id: string) => void;
  onRevoke: (id: string) => void;
  onRowClick?: (registration: RegistrationListItem) => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const normalizedStatus = registration.status?.toLowerCase() ?? "";
  const isLoading = actionLoading?.id === registration.registration_id;

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

  const menuItems: {
    label: string;
    icon: React.ReactNode;
    action: () => void;
    className: string;
  }[] = [];

  if (normalizedStatus === "approved") {
    menuItems.push({
      label: "Mark as Paid",
      icon: isLoading && actionLoading?.action === "markPaid" ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <CreditCard size={14} />
      ),
      action: () => {
        onAction(registration.registration_id, "markPaid", onMarkPaid);
        setOpen(false);
      },
      className: "text-blue-400 hover:bg-blue-500/10",
    });
    menuItems.push({
      label: "Reconsider",
      icon: isLoading && actionLoading?.action === "revoke" ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <RotateCcw size={14} />
      ),
      action: () => {
        onAction(registration.registration_id, "revoke", onRevoke);
        setOpen(false);
      },
      className: "text-amber-400 hover:bg-amber-500/10",
    });
  }

  if (normalizedStatus === "rejected") {
    menuItems.push({
      label: "Reconsider",
      icon: isLoading && actionLoading?.action === "revoke" ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <RotateCcw size={14} />
      ),
      action: () => {
        onAction(registration.registration_id, "revoke", onRevoke);
        setOpen(false);
      },
      className: "text-amber-400 hover:bg-amber-500/10",
    });
  }

  if (normalizedStatus === "paid") {
    menuItems.push({
      label: "View Details",
      icon: <Eye size={14} />,
      action: () => {
        onRowClick?.(registration);
        setOpen(false);
      },
      className: "text-white/60 hover:bg-white/[0.06]",
    });
  }

  if (menuItems.length === 0) return null;

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        disabled={isLoading}
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/40 hover:bg-white/[0.08] hover:text-white/70 transition-colors disabled:opacity-50"
      >
        {isLoading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <MoreHorizontal size={15} />
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-30 min-w-[160px] py-1 bg-[#141414] border border-white/[0.08] rounded-xl shadow-xl shadow-black/40">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={(e) => {
                e.stopPropagation();
                item.action();
              }}
              disabled={isLoading}
              className={`w-full px-3 py-2 flex items-center gap-2.5 text-sm transition-colors disabled:opacity-50 ${item.className}`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ApprovalsTable({
  registrations,
  loading,
  onApprove,
  onReject,
  onRevoke,
  onMarkPaid,
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchChange,
  genderMismatchOnly,
  onGenderMismatchOnlyChange,
  onRowClick,
}: ApprovalsTableProps) {
  const [actionLoading, setActionLoading] = useState<ActionLoadingState | null>(null);
  const [statusOpen, setStatusOpen] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);

  const handleAction = async (id: string, actionName: string, action: (id: string) => Promise<void> | void) => {
    setActionLoading({ id, action: actionName });
    try {
      await action(id);
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    if (!statusOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setStatusOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [statusOpen]);

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "incomplete", label: "Incomplete" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "paid", label: "Paid" },
  ];
  const statusLabelMap = new Map(statusOptions.map((option) => [option.value, option.label]));

  const handleStatusToggle = (value: string) => {
    const next = statusFilter.includes(value)
      ? statusFilter.filter((s) => s !== value)
      : [...statusFilter, value];
    onStatusFilterChange(next);
  };

  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "incomplete":
        return "bg-orange-500/10 text-orange-300 border-orange-500/20";
      case "approved":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "rejected":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "paid":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
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
            <button
              type="button"
              onClick={() => onGenderMismatchOnlyChange(!genderMismatchOnly)}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                genderMismatchOnly
                  ? "border-amber-500/40 bg-amber-500/15 text-amber-200"
                  : "border-white/[0.08] bg-white/[0.03] text-white/50 hover:text-white/70"
              }`}
              aria-pressed={genderMismatchOnly}
              title="Filter gender mismatches"
            >
              <AlertTriangle size={13} />
              Gender mismatch
            </button>
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
                        {statusFilter.length > 0 || searchQuery
                          ? "Try adjusting your filters"
                          : "Registrations will appear here"}
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              registrations.map((registration) => {
                const normalizedStatus = registration.status?.toLowerCase() ?? "";
                const isReviewable =
                  (normalizedStatus === "pending" ||
                    normalizedStatus === "incomplete" ||
                    registration.is_complete === false) &&
                  !["approved", "rejected", "paid"].includes(normalizedStatus);

                return (
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
                      {registration.profile_picture ? (
                        <img
                          src={registration.profile_picture}
                          alt={registration.name}
                          className="w-8 h-8 rounded-full object-cover border border-white/[0.08]"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                          <span className="text-sm font-medium text-emerald-400">
                            {registration.name?.charAt(0)?.toUpperCase() || "?"}
                          </span>
                        </div>
                      )}
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
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getStatusStyles(
                          registration.status
                        )}`}
                      >
                        {registration.status}
                      </span>
                      {registration.gender_mismatch && (
                        <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-200">
                          <AlertTriangle size={12} />
                          Gender mismatch (CNIC vs pass type)
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      {isReviewable && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAction(registration.registration_id, "approve", onApprove);
                            }}
                            disabled={actionLoading?.id === registration.registration_id}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Approve"
                          >
                            {actionLoading?.id === registration.registration_id && actionLoading.action === "approve" ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Check size={14} strokeWidth={2.5} />
                            )}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAction(registration.registration_id, "reject", onReject);
                            }}
                            disabled={actionLoading?.id === registration.registration_id}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Reject"
                          >
                            {actionLoading?.id === registration.registration_id && actionLoading.action === "reject" ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <X size={14} strokeWidth={2.5} />
                            )}
                          </button>
                        </>
                      )}
                      {(normalizedStatus === "approved" || normalizedStatus === "rejected" || normalizedStatus === "paid") && (
                        <ActionMenu
                          registration={registration}
                          actionLoading={actionLoading}
                          onAction={handleAction}
                          onMarkPaid={onMarkPaid}
                          onRevoke={onRevoke}
                          onRowClick={onRowClick}
                        />
                      )}
                    </div>
                  </td>
                </tr>
                );
              })
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
            {statusFilter.length > 0 && (
              <span>
                {" "}with status <span className="text-white/60">{statusFilter.map((s) => statusLabelMap.get(s) || s).join(", ")}</span>
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
