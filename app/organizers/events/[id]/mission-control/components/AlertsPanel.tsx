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
    <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-xl p-6 ring-2 ring-orange-100 transition-all duration-300 overflow-hidden">
      {/* Animated warning stripe */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600" />

      <div className="flex items-start justify-between mb-5">
        <h3 className="text-xl font-semibold bg-gradient-to-r from-neutral-900 to-neutral-700 bg-clip-text text-transparent">
          Alerts & Attention
        </h3>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center shadow-sm">
          <AlertTriangle className="text-orange-600 animate-pulse" size={20} />
        </div>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="flex items-center justify-between gap-4 p-4 bg-orange-50/50 rounded-xl transition-all"
          >
            <div className="flex items-start gap-3 flex-1">
              <AlertTriangle
                className="text-orange-600 mt-0.5 flex-shrink-0"
                size={18}
              />
              <p className="text-sm text-neutral-700">{alert.text}</p>
            </div>
            <button
              onClick={() => onFix?.(alert.id)}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-lg text-sm font-medium transition-all active:scale-95 whitespace-nowrap group shadow-md shadow-orange-500/30"
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
