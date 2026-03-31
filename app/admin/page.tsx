"use client";

import { useEffect, useState } from "react";
import { getAdminDashboard, type AdminDashboardData } from "@/lib/adminApi";
import KPICards from "@/components/admin/dashboard/KPICards";
import AdminActivityFeed from "@/components/admin/dashboard/AdminActivityFeed";
import UserGrowthChart from "@/components/admin/dashboard/UserGrowthChart";
import TicketsPerEventChart from "@/components/admin/dashboard/TicketsPerEventChart";

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await getAdminDashboard();
        setData(res);
      } catch (err) {
        console.error("Failed to fetch dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-white/[0.04] rounded-lg" />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-[1px]">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 bg-white/[0.04] rounded-lg" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-[320px] bg-white/[0.04] rounded-2xl" />
            <div className="h-[320px] bg-white/[0.04] rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  const kpis = data?.kpis ?? {
    total_users: 0,
    new_users_today: 0,
    active_events: 0,
    tickets_sold_today: 0,
    total_tickets_sold: 0,
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <h1
        className="text-[20px] font-medium text-[var(--text-primary)] tracking-tight"
        style={{ fontFamily: "var(--font-display-org)" }}
      >
        Dashboard
      </h1>

      <KPICards kpis={kpis} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UserGrowthChart data={data?.user_growth_30d ?? []} />
        <TicketsPerEventChart data={data?.tickets_per_event ?? []} />
      </div>

      <AdminActivityFeed activities={data?.activity_feed ?? []} />
    </div>
  );
}
