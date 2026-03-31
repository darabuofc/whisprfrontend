"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface TicketsPerEventChartProps {
  data: { event_name: string; tickets_sold: number }[];
}

export default function TicketsPerEventChart({ data }: TicketsPerEventChartProps) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
      <h3
        className="text-[11px] uppercase tracking-[0.15em] text-[var(--text-muted)] mb-6"
        style={{ fontFamily: "var(--font-mono-org)" }}
      >
        Tickets Sold Per Event (Top 5)
      </h3>
      <div className="h-[260px]">
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
              <XAxis
                dataKey="event_name"
                tick={{ fill: "#6B7280", fontSize: 10, fontFamily: "var(--font-mono-org)" }}
                tickLine={false}
                axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                tickFormatter={(val: string) =>
                  val.length > 15 ? val.slice(0, 15) + "..." : val
                }
              />
              <YAxis
                tick={{ fill: "#6B7280", fontSize: 10, fontFamily: "var(--font-mono-org)" }}
                tickLine={false}
                axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
              />
              <Tooltip
                contentStyle={{
                  background: "#1C1C1E",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "8px",
                  color: "#EDEDEB",
                  fontSize: 12,
                  fontFamily: "var(--font-mono-org)",
                }}
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
              />
              <Bar
                dataKey="tickets_sold"
                fill="#D4A574"
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-[var(--text-muted)] text-[13px]">
            No data available
          </div>
        )}
      </div>
    </div>
  );
}
