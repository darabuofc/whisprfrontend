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
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:bg-gray-900/70 transition-all">
      <div className="flex items-start justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Action Required</h3>
        <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
          <Clock className="text-amber-400" size={20} />
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between py-3 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
            <span className="text-sm text-gray-300">Pending approvals</span>
          </div>
          <span className="text-2xl font-bold text-white">
            {ops.pendingApprovals}
          </span>
        </div>

        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-green-400" size={16} />
            <span className="text-sm text-gray-300">Avg approval time</span>
          </div>
          <span className="text-lg font-semibold text-gray-400">
            {ops.avgApprovalTime}
          </span>
        </div>
      </div>

      <button
        onClick={onGoToApprovals}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors group"
      >
        Go to Approvals
        <ArrowRight
          size={18}
          className="group-hover:translate-x-1 transition-transform"
        />
      </button>
    </div>
  );
}
