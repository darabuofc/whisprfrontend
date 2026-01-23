import { AlertTriangle, ArrowRight } from "lucide-react";

interface Alert {
  id: number;
  text: string;
}

interface AlertsPanelProps {
  alerts: Alert[];
  onFix?: (alertId: number) => void;
}

export default function AlertsPanel({ alerts, onFix }: AlertsPanelProps) {
  if (!alerts || alerts.length === 0) {
    return null;
  }

  return (
    <div className="relative bg-white/[0.02] border border-white/10 rounded-2xl p-6 ring-2 ring-amber-500/20 transition-all duration-300 overflow-hidden hover:border-white/20">
      {/* Animated warning stripe */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />

      <div className="flex items-start justify-between mb-5">
        <h3 className="text-xl font-semibold text-white">
          Alerts & Attention
        </h3>
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
          <AlertTriangle className="text-amber-400 animate-pulse" size={20} />
        </div>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="flex items-center justify-between gap-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl transition-all"
          >
            <div className="flex items-start gap-3 flex-1">
              <AlertTriangle
                className="text-amber-400 mt-0.5 flex-shrink-0"
                size={18}
              />
              <p className="text-sm text-white/70">{alert.text}</p>
            </div>
            <button
              onClick={() => onFix?.(alert.id)}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-lg text-sm font-medium transition-all active:scale-95 whitespace-nowrap group shadow-md shadow-amber-500/30"
            >
              Fix
              <ArrowRight
                size={14}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
