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
    <div className="relative glass rounded-2xl p-6 ring-1 ring-amber-500/30 transition-all duration-300 overflow-hidden hover:bg-white/10">
      {/* Animated warning stripe */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />

      <div className="flex items-start justify-between mb-5">
        <h3 className="text-xl font-semibold text-whispr-text">
          Alerts & Attention
        </h3>
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
          <AlertTriangle className="text-amber-400 animate-pulse" size={20} />
        </div>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="flex items-center justify-between gap-4 p-4 bg-amber-500/10 rounded-xl transition-all border border-amber-500/20"
          >
            <div className="flex items-start gap-3 flex-1">
              <AlertTriangle
                className="text-amber-400 mt-0.5 flex-shrink-0"
                size={18}
              />
              <p className="text-sm text-whispr-text/80">{alert.text}</p>
            </div>
            <button
              onClick={() => onFix?.(alert.id)}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-lg text-sm font-medium transition-all active:scale-95 whitespace-nowrap group"
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
