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
    <div className="bg-white rounded-2xl shadow-sm p-6 transition-all">
      <div className="flex items-start justify-between mb-6">
        <h3 className="text-xl font-semibold text-neutral-900">Action Required</h3>
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
          <Clock className="text-blue-600" size={20} />
        </div>
      </div>

      <div className="space-y-5 mb-6">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-sm text-neutral-600">Pending approvals</span>
          </div>
          <span className="text-3xl font-semibold text-neutral-900">
            {ops.pendingApprovals}
          </span>
        </div>

        <div className="flex items-center justify-between py-3 border-t border-neutral-100">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-neutral-500" size={18} />
            <span className="text-sm text-neutral-600">Avg approval time</span>
          </div>
          <span className="text-lg font-medium text-neutral-700">
            {ops.avgApprovalTime}
          </span>
        </div>
      </div>

      <button
        onClick={onGoToApprovals}
        className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all active:scale-[0.98] shadow-sm group"
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
