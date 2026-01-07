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
    <div className="bg-gray-900/50 border border-amber-500/30 rounded-xl p-6 hover:bg-gray-900/70 transition-all">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          Alerts & Attention
        </h3>
        <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
          <AlertTriangle className="text-amber-400" size={20} />
        </div>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="flex items-center justify-between gap-4 p-4 bg-gray-800/50 border border-gray-700 rounded-lg hover:border-amber-500/30 transition-colors"
          >
            <div className="flex items-start gap-3 flex-1">
              <AlertTriangle
                className="text-amber-400 mt-0.5 flex-shrink-0"
                size={18}
              />
              <p className="text-sm text-gray-200">{alert.text}</p>
            </div>
            <button
              onClick={() => onFix?.(alert.id)}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 rounded-lg text-sm font-medium transition-colors whitespace-nowrap group"
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
