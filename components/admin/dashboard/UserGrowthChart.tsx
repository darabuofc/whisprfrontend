"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { format } from "date-fns";

interface UserGrowthChartProps {
  data: { date: string; count: number }[];
}

export default function UserGrowthChart({ data }: UserGrowthChartProps) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
      <h3
        className="text-[11px] uppercase tracking-[0.15em] text-[var(--text-muted)] mb-6"
        style={{ fontFamily: "var(--font-mono-org)" }}
      >
        User Growth (30 days)
      </h3>
      <div className="h-[260px]">
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#6B7280", fontSize: 10, fontFamily: "var(--font-mono-org)" }}
                tickLine={false}
                axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                tickFormatter={(val: string) => {
                  try {
                    return format(new Date(val), "MMM d");
                  } catch {
                    return val;
                  }
                }}
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
                labelFormatter={(val) => {
                  try {
                    return format(new Date(String(val)), "MMM d, yyyy");
                  } catch {
                    return String(val);
                  }
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#D4A574"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#D4A574" }}
              />
            </LineChart>
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
