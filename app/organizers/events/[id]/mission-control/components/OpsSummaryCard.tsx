import { ArrowRight, Clock, CheckCircle2 } from "lucide-react";

interface OpsData {
  pendingApprovals: number;
  avgApprovalTime: string;
}

interface OpsSummaryCardProps {
  ops: OpsData;
  onGoToApprovals?: () => void;
}

export default function OpsSummaryCard({
  ops,
  onGoToApprovals,
}: OpsSummaryCardProps) {
  return (
    <div className="relative glass rounded-2xl p-6 transition-all duration-300 overflow-hidden group hover:bg-white/10">
      {/* Gradient accent on top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-whispr-accent via-whispr-purple to-whispr-accent" />

      <div className="flex items-start justify-between mb-6">
        <h3 className="text-xl font-semibold text-whispr-text">Action Required</h3>
        <div className="w-10 h-10 rounded-xl bg-whispr-accent/10 flex items-center justify-center border border-whispr-accent/20">
          <Clock className="text-whispr-accent" size={20} />
        </div>
      </div>

      <div className="space-y-5 mb-6">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-whispr-accent rounded-full animate-pulse" />
            <span className="text-sm text-whispr-muted">Pending approvals</span>
          </div>
          <span className="text-3xl font-semibold text-whispr-text">
            {ops.pendingApprovals}
          </span>
        </div>

        <div className="flex items-center justify-between py-3 border-t border-white/10">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-whispr-muted" size={18} />
            <span className="text-sm text-whispr-muted">Avg approval time</span>
          </div>
          <span className="text-lg font-medium text-whispr-text/80">
            {ops.avgApprovalTime}
          </span>
        </div>
      </div>

      <button
        onClick={onGoToApprovals}
        className="relative w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-whispr-accent hover:bg-whispr-accent/90 text-black rounded-xl font-medium transition-all active:scale-[0.98] shadow-glow overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        <span className="relative z-10">Go to Approvals</span>
        <ArrowRight
          size={18}
          className="group-hover:translate-x-1 transition-transform relative z-10"
        />
      </button>
    </div>
  );
}
