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
    <div className="relative bg-white/[0.02] border border-white/10 rounded-2xl p-6 transition-all duration-300 overflow-hidden group hover:border-white/20">
      {/* Gradient accent on top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#B472FF] via-[#8B5CF6] to-[#6C2DFF]" />

      <div className="flex items-start justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Action Required</h3>
        <div className="w-10 h-10 rounded-xl bg-[#B472FF]/20 border border-[#B472FF]/30 flex items-center justify-center">
          <Clock className="text-[#B472FF]" size={20} />
        </div>
      </div>

      <div className="space-y-5 mb-6">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-[#B472FF] rounded-full animate-pulse" />
            <span className="text-sm text-white/60">Pending approvals</span>
          </div>
          <span className="text-3xl font-semibold text-white">
            {ops.pendingApprovals}
          </span>
        </div>

        <div className="flex items-center justify-between py-3 border-t border-white/10">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-white/50" size={18} />
            <span className="text-sm text-white/60">Avg approval time</span>
          </div>
          <span className="text-lg font-medium text-white/70">
            {ops.avgApprovalTime}
          </span>
        </div>
      </div>

      <button
        onClick={onGoToApprovals}
        className="relative w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-[#B472FF] hover:bg-[#A060E8] text-white rounded-xl font-medium transition-all active:scale-[0.98] shadow-lg shadow-[#B472FF]/30 overflow-hidden"
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
