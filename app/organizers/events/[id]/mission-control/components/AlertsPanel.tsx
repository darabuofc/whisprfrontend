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
    <div className="bg-amber-500/[0.04] border border-amber-500/20 rounded-2xl p-6">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-lg font-medium text-white/90">Attention Needed</h3>
          <p className="text-sm text-white/40 mt-1">{alerts.length} issue{alerts.length !== 1 ? 's' : ''} requiring action</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
          <AlertTriangle className="text-amber-400" size={18} />
        </div>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="flex items-center justify-between gap-4 p-4 bg-white/[0.02] rounded-xl border border-white/[0.04]"
          >
            <div className="flex items-start gap-3 flex-1">
              <AlertTriangle
                className="text-amber-400 mt-0.5 flex-shrink-0"
                size={16}
              />
              <p className="text-sm text-white/70">{alert.text}</p>
            </div>
            <button
              onClick={() => onFix?.(alert.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
            >
              Fix
              <ArrowRight size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
