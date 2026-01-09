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
    <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-xl p-6 transition-all duration-300 overflow-hidden group">
      {/* Gradient accent on top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700" />

      <div className="flex items-start justify-between mb-6">
        <h3 className="text-xl font-semibold bg-gradient-to-r from-neutral-900 to-neutral-700 bg-clip-text text-transparent">Action Required</h3>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center shadow-sm">
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
        className="relative w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium transition-all active:scale-[0.98] shadow-lg shadow-blue-500/30 overflow-hidden"
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
