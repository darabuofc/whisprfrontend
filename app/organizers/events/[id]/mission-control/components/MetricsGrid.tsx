"use client";

interface Metric {
  label: string;
  value: string | number;
  status?: "normal" | "warning" | "danger" | "success";
}

interface MetricsGridProps {
  metrics: Metric[];
}

export default function MetricsGrid({ metrics }: MetricsGridProps) {
  const getValueColor = (status?: Metric["status"]) => {
    switch (status) {
      case "warning":
        return "text-[#F59E0B]";
      case "danger":
        return "text-[#EF4444]";
      case "success":
        return "text-[#10B981]";
      default:
        return "text-[#E5E7EB]";
    }
  };

  return (
    <div className="w-full border border-[#1A1A1A]">
      {/* Header */}
      <div className="border-b border-[#1A1A1A] bg-[#0A0A0A]">
        <div className="px-4 py-3">
          <h2 className="text-[12px] font-normal uppercase tracking-[0.15em] text-[#6B7280]">
            EVENT FLOW METRICS
          </h2>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[1px] bg-[#1A1A1A]">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="bg-[#0A0226] px-6 py-4 flex flex-col gap-1"
          >
            <div className="text-[10px] uppercase tracking-[0.15em] text-[#6B7280] font-normal">
              {metric.label}
            </div>
            <div
              className={`text-[20px] font-mono font-semibold ${getValueColor(
                metric.status
              )}`}
              style={{ fontFeatureSettings: '"tnum"' }}
            >
              {metric.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
