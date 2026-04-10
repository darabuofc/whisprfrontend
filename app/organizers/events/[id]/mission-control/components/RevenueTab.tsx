"use client";

import { useState, useEffect, useCallback } from "react";
import {
  AlertCircle,
  Banknote,
  Globe,
  Landmark,
  Receipt,
  Wallet,
  CircleDollarSign,
  ArrowUpRight,
  Ticket,
  DollarSign,
} from "lucide-react";
import { getEventRevenue, type RevenueData } from "@/lib/api";

interface RevenueTabProps {
  eventId: string;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/30 mb-3"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {children}
    </h3>
  );
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
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center ${
            accent
              ? "bg-[#D4A574]/15 border border-[#D4A574]/20"
              : "bg-white/[0.04] border border-white/[0.06]"
          }`}
        >
          {icon}
        </div>
        <span className="text-xs font-medium text-white/40 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p
        className={`text-2xl font-bold tabular-nums ${
          accent ? "text-[#D4A574]" : "text-white/90"
        }`}
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
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${classes}`}
    >
      {status}
    </span>
  );
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "\u2014";
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const sameYear = date.getFullYear() === now.getFullYear();
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      ...(sameYear ? {} : { year: "numeric" }),
    });
  } catch {
    return dateStr;
  }
}

function formatGateway(gateway: string): string {
  if (!gateway) return "\u2014";
  return gateway.charAt(0).toUpperCase() + gateway.slice(1);
}

function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 ${className}`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg bg-white/5 animate-pulse" />
        <div className="h-3 w-16 bg-white/5 rounded animate-pulse" />
      </div>
      <div className="h-8 w-24 bg-white/5 rounded animate-pulse" />
    </div>
  );
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
        {/* Header skeleton */}
        <div>
          <div className="h-6 w-24 bg-white/5 rounded animate-pulse" />
          <div className="h-4 w-48 bg-white/5 rounded animate-pulse mt-2" />
        </div>

        {/* Revenue section skeleton — 5 cards */}
        <div>
          <div className="h-3 w-16 bg-white/5 rounded animate-pulse mb-3" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} />
            ))}
            <SkeletonCard className="col-span-2 sm:col-span-1" />
          </div>
        </div>

        {/* Payouts + Tickets skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="md:col-span-2">
            <div className="h-3 w-14 bg-white/5 rounded animate-pulse mb-3" />
            <div className="grid grid-cols-2 gap-3">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </div>
          <div className="md:col-span-1">
            <div className="h-3 w-14 bg-white/5 rounded animate-pulse mb-3" />
            <SkeletonCard />
          </div>
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

  const { summary } = data;
  const hasTransactions = data.transactions && data.transactions.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2
          className="text-lg font-medium text-white/90"
          style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
        >
          Revenue
        </h2>
        <p className="text-sm text-white/40 mt-1">
          Payment overview and transaction history
        </p>
      </div>

      {/* Revenue Cards */}
      <div>
        <SectionLabel>Revenue</SectionLabel>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard
            label="Manual Revenue"
            value={summary.manual_revenue_display}
            icon={<Banknote size={18} className="text-white/40" />}
          />
          <StatCard
            label="Online Revenue"
            value={summary.online_revenue_display}
            icon={<Globe size={18} className="text-white/40" />}
          />
          <StatCard
            label="Whispr Fee"
            value={summary.platform_fees_display}
            icon={<Receipt size={18} className="text-white/40" />}
          />
          <StatCard
            label="Gateway Fee"
            value={summary.gateway_fees_display}
            icon={<Landmark size={18} className="text-white/40" />}
          />
          <StatCard
            label="Net Revenue"
            value={summary.net_revenue_display}
            icon={<Wallet size={18} className="text-[#D4A574]" />}
            accent
          />
        </div>
      </div>

      {/* Payouts + Tickets */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="md:col-span-2">
          <SectionLabel>Payouts</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Outstanding"
              value={summary.outstanding_balance_display}
              icon={
                <CircleDollarSign size={18} className="text-[#D4A574]" />
              }
              accent
            />
            <StatCard
              label="Paid Out"
              value={summary.paid_out_display}
              icon={<ArrowUpRight size={18} className="text-white/40" />}
            />
          </div>
        </div>
        <div className="md:col-span-1">
          <SectionLabel>Tickets</SectionLabel>
          <StatCard
            label="Tickets Sold"
            value={String(summary.tickets_sold)}
            icon={<Ticket size={18} className="text-white/40" />}
          />
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/[0.06]">
          <h3
            className="text-sm font-medium text-white/70"
            style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
          >
            Transactions
          </h3>
        </div>

        {!hasTransactions ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-white/[0.02] flex items-center justify-center mx-auto mb-4">
              <DollarSign size={20} className="text-white/20" />
            </div>
            <p className="text-sm text-white/50 font-medium">
              No payments yet
            </p>
            <p className="text-xs text-white/30 mt-1">
              Transactions will appear here once attendees start paying.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/[0.02] border-b border-white/[0.06]">
                  <tr>
                    <th className="text-left px-6 py-3.5 text-[11px] font-medium uppercase tracking-wider text-white/30">
                      Reg. ID
                    </th>
                    <th className="text-left px-6 py-3.5 text-[11px] font-medium uppercase tracking-wider text-white/30">
                      Pass Type
                    </th>
                    <th className="text-right px-6 py-3.5 text-[11px] font-medium uppercase tracking-wider text-white/30">
                      Amount
                    </th>
                    <th className="text-right px-6 py-3.5 text-[11px] font-medium uppercase tracking-wider text-white/30">
                      Discount
                    </th>
                    <th className="text-right px-6 py-3.5 text-[11px] font-medium uppercase tracking-wider text-white/30">
                      Net Amount
                    </th>
                    <th className="text-left px-6 py-3.5 text-[11px] font-medium uppercase tracking-wider text-white/30">
                      Status
                    </th>
                    <th className="text-left px-6 py-3.5 text-[11px] font-medium uppercase tracking-wider text-white/30">
                      Method
                    </th>
                    <th className="text-left px-6 py-3.5 text-[11px] font-medium uppercase tracking-wider text-white/30">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.transactions.map((tx) => {
                    const isFailed = tx.status.toLowerCase() === "failed";
                    return (
                      <tr
                        key={tx.txn_id}
                        className={`border-b border-white/[0.03] ${
                          isFailed
                            ? "opacity-50"
                            : "hover:bg-white/[0.02]"
                        } transition-colors`}
                      >
                        <td
                          className="px-6 py-4 text-sm text-white/70"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          {tx.registration_id}
                        </td>
                        <td className="px-6 py-4 text-sm text-white/50">
                          {tx.pass_type}
                        </td>
                        <td
                          className="px-6 py-4 text-sm text-white/70 text-right tabular-nums"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          {tx.amount_display}
                        </td>
                        <td
                          className="px-6 py-4 text-sm text-right tabular-nums"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          {tx.discount_amount_display ? (
                            <span className="text-amber-400/70">
                              {tx.discount_amount_display}
                            </span>
                          ) : (
                            <span className="text-white/20">&mdash;</span>
                          )}
                        </td>
                        <td
                          className="px-6 py-4 text-sm text-white/70 text-right tabular-nums"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          {tx.organizer_net_display}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={tx.status} />
                        </td>
                        <td className="px-6 py-4 text-sm text-white/50 capitalize">
                          {formatGateway(tx.gateway)}
                        </td>
                        <td className="px-6 py-4 text-sm text-white/40">
                          {formatDate(tx.completed_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile card layout */}
            <div className="md:hidden divide-y divide-white/[0.06]">
              {data.transactions.map((tx) => {
                const isFailed = tx.status.toLowerCase() === "failed";
                return (
                  <div
                    key={tx.txn_id}
                    className={`p-4 space-y-2 ${isFailed ? "opacity-50" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p
                          className="text-sm font-medium text-white/70 truncate"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          {tx.registration_id}
                        </p>
                        <p className="text-xs text-white/40">{tx.pass_type}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p
                          className="text-sm font-medium text-white/70 tabular-nums"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          {tx.amount_display}
                        </p>
                        <p
                          className="text-xs text-white/50 tabular-nums"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          Net: {tx.organizer_net_display}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={tx.status} />
                      <span className="text-xs text-white/40">
                        {formatGateway(tx.gateway)}
                      </span>
                      {tx.discount_amount_display && (
                        <span className="text-xs text-amber-400/70">
                          -{tx.discount_amount_display}
                        </span>
                      )}
                      <span className="text-xs text-white/30 ml-auto">
                        {formatDate(tx.completed_at)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Footer count */}
        {hasTransactions && (
          <div className="px-6 py-4 border-t border-white/[0.06] bg-white/[0.01]">
            <p className="text-sm text-white/30">
              <span className="text-white/60 font-medium">
                {data.transactions.length}
              </span>{" "}
              transaction{data.transactions.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
