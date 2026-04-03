"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, AlertCircle, DollarSign, Ticket, CreditCard, Wallet } from "lucide-react";
import { getEventRevenue, type RevenueData, type RevenueTransaction } from "@/lib/api";

interface RevenueTabProps {
  eventId: string;
}

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
          accent ? "bg-[#D4A574]/15 border border-[#D4A574]/20" : "bg-white/[0.04] border border-white/[0.06]"
        }`}>
          {icon}
        </div>
        <span className="text-xs font-medium text-white/40 uppercase tracking-wider">{label}</span>
      </div>
      <p
        className={`text-2xl font-bold tabular-nums ${accent ? "text-[#D4A574]" : "text-white/90"}`}
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  let classes = "";
  switch (normalized) {
    case "succeeded":
    case "paid":
      classes = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      break;
    case "failed":
      classes = "bg-red-500/10 text-red-400 border-red-500/20";
      break;
    case "initiated":
    case "pending":
      classes = "bg-amber-500/10 text-amber-400 border-amber-500/20";
      break;
    default:
      classes = "bg-white/[0.04] text-white/50 border-white/[0.08]";
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${classes}`}>
      {status}
    </span>
  );
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function RevenueTab({ eventId }: RevenueTabProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RevenueData | null>(null);

  const fetchRevenue = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const revenue = await getEventRevenue(eventId);
      setData(revenue);
    } catch (err: any) {
      setError(err.message || "Failed to load revenue data");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchRevenue();
  }, [fetchRevenue]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Stat cards skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-white/5 animate-pulse" />
                <div className="h-3 w-16 bg-white/5 rounded animate-pulse" />
              </div>
              <div className="h-8 w-24 bg-white/5 rounded animate-pulse" />
            </div>
          ))}
        </div>
        {/* Table skeleton */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
                <div className="h-4 w-20 bg-white/5 rounded animate-pulse" />
                <div className="h-4 w-16 bg-white/5 rounded animate-pulse" />
                <div className="h-4 w-16 bg-white/5 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8 text-center">
        <AlertCircle size={24} className="text-red-400 mx-auto mb-3" />
        <p className="text-sm text-red-400 mb-3">{error}</p>
        <button
          onClick={fetchRevenue}
          className="text-sm text-[#D4A574] hover:text-[#B8785C] transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!data) return null;

  const hasTransactions = data.transactions && data.transactions.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-medium text-white/90" style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>Revenue</h2>
        <p className="text-sm text-white/40 mt-1">Payment overview and transaction history</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Revenue"
          value={data.total_revenue_display}
          icon={<DollarSign size={18} className="text-white/40" />}
        />
        <StatCard
          label="Tickets Sold"
          value={String(data.tickets_sold)}
          icon={<Ticket size={18} className="text-white/40" />}
        />
        <StatCard
          label="Processing Fees"
          value={data.gateway_fees_display}
          icon={<CreditCard size={18} className="text-white/40" />}
        />
        <StatCard
          label="Outstanding"
          value={data.outstanding_balance_display}
          icon={<Wallet size={18} className="text-[#D4A574]" />}
          accent
        />
      </div>

      {/* Transactions Table */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/[0.06]">
          <h3 className="text-sm font-medium text-white/70" style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>Transactions</h3>
        </div>

        {!hasTransactions ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-white/[0.02] flex items-center justify-center mx-auto mb-4">
              <DollarSign size={20} className="text-white/20" />
            </div>
            <p className="text-sm text-white/50 font-medium">No payments yet</p>
            <p className="text-xs text-white/30 mt-1">
              Transactions will appear here once attendees start paying.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/[0.02] border-b border-white/[0.06]">
                <tr>
                  <th className="text-left px-6 py-3.5 text-[11px] font-medium uppercase tracking-wider text-white/30">Attendee</th>
                  <th className="text-left px-6 py-3.5 text-[11px] font-medium uppercase tracking-wider text-white/30">Pass Type</th>
                  <th className="text-right px-6 py-3.5 text-[11px] font-medium uppercase tracking-wider text-white/30">Amount</th>
                  <th className="text-right px-6 py-3.5 text-[11px] font-medium uppercase tracking-wider text-white/30">Net</th>
                  <th className="text-left px-6 py-3.5 text-[11px] font-medium uppercase tracking-wider text-white/30">Status</th>
                  <th className="text-left px-6 py-3.5 text-[11px] font-medium uppercase tracking-wider text-white/30">Method</th>
                  <th className="text-left px-6 py-3.5 text-[11px] font-medium uppercase tracking-wider text-white/30">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.transactions.map((tx) => {
                  const isFailed = tx.status.toLowerCase() === "failed";
                  return (
                    <tr
                      key={tx.id}
                      className={`border-b border-white/[0.03] ${isFailed ? "opacity-50" : "hover:bg-white/[0.02]"} transition-colors`}
                    >
                      <td className="px-6 py-4 text-sm text-white/70">{tx.attendee_name}</td>
                      <td className="px-6 py-4 text-sm text-white/50">{tx.pass_type}</td>
                      <td className="px-6 py-4 text-sm text-white/70 text-right tabular-nums" style={{ fontFamily: "var(--font-mono)" }}>
                        {tx.amount_display}
                      </td>
                      <td className="px-6 py-4 text-sm text-right tabular-nums" style={{ fontFamily: "var(--font-mono)" }}>
                        {tx.net_amount_display ? (
                          <span className="text-white/70">{tx.net_amount_display}</span>
                        ) : (
                          <span className="text-white/20">&mdash;</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={tx.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-white/50">{tx.method}</td>
                      <td className="px-6 py-4 text-sm text-white/40">{formatDate(tx.date)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer count */}
        {hasTransactions && (
          <div className="px-6 py-4 border-t border-white/[0.06] bg-white/[0.01]">
            <p className="text-sm text-white/30">
              <span className="text-white/60 font-medium">{data.transactions.length}</span>{" "}
              transaction{data.transactions.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
