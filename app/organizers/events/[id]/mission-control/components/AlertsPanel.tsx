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
    <div className="bg-white rounded-2xl shadow-sm p-6 ring-2 ring-orange-100 transition-all">
      <div className="flex items-start justify-between mb-5">
        <h3 className="text-xl font-semibold text-neutral-900">
          Alerts & Attention
        </h3>
        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
          <AlertTriangle className="text-orange-600" size={20} />
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
              className="flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-all active:scale-95 whitespace-nowrap group"
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
