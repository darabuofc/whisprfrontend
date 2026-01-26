import { ArrowRight, Clock } from "lucide-react";

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
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-white/90">Action Required</h3>
          <p className="text-sm text-white/40 mt-1">Registrations awaiting review</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
          <Clock className="text-amber-400" size={18} />
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between py-3 border-b border-white/[0.04]">
          <span className="text-sm text-white/50">Pending approvals</span>
          <span className="text-2xl font-semibold text-white/90 tabular-nums">
            {ops.pendingApprovals}
          </span>
        </div>

        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-white/50">Avg response time</span>
          <span className="text-base font-medium text-white/70">
            {ops.avgApprovalTime}
          </span>
        </div>
      </div>

      <button
        onClick={onGoToApprovals}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-black rounded-xl text-sm font-medium transition-colors hover:bg-white/90"
      >
        <span>Go to Approvals</span>
        <ArrowRight size={16} />
      </button>
    </div>
  );
}
