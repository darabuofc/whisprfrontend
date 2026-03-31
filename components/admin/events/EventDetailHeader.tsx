"use client";

import { ArrowLeft, Pencil, Pause, XCircle, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import StatusBadge from "@/components/admin/shared/StatusBadge";

interface EventDetailHeaderProps {
  name: string;
  status: string;
  organizerName: string;
  editing: boolean;
  onToggleEdit: () => void;
  onStatusChange: (status: string) => void;
}

export default function EventDetailHeader({
  name,
  status,
  organizerName,
  editing,
  onToggleEdit,
  onStatusChange,
}: EventDetailHeaderProps) {
  const router = useRouter();
  const normalizedStatus = status.toLowerCase();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/admin/events")}
          className="p-1.5 rounded-md hover:bg-white/[0.06] text-[var(--text-muted)] transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <div className="flex items-center gap-3">
            <h1
              className="text-[20px] font-medium text-[var(--text-primary)]"
              style={{ fontFamily: "var(--font-display-org)" }}
            >
              {name}
            </h1>
            <StatusBadge status={status} />
          </div>
          <p className="text-[13px] text-[var(--text-muted)] mt-0.5">
            by {organizerName}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onToggleEdit}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
            editing
              ? "bg-[var(--copper)] text-[#0A0A0A]"
              : "border border-white/[0.06] text-[var(--text-secondary)] hover:bg-white/[0.04]"
          }`}
          style={{ fontFamily: "var(--font-mono-org)" }}
        >
          <Pencil size={13} />
          {editing ? "Editing" : "Edit"}
        </button>

        {normalizedStatus === "live" || normalizedStatus === "published" ? (
          <button
            onClick={() => onStatusChange("paused")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium border border-amber-500/20 text-amber-400 hover:bg-amber-500/10 transition-colors"
            style={{ fontFamily: "var(--font-mono-org)" }}
          >
            <Pause size={13} />
            Pause
          </button>
        ) : null}

        {normalizedStatus !== "cancelled" && normalizedStatus !== "ended" ? (
          <button
            onClick={() => onStatusChange("cancelled")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors"
            style={{ fontFamily: "var(--font-mono-org)" }}
          >
            <XCircle size={13} />
            Cancel
          </button>
        ) : null}

        {normalizedStatus !== "ended" && normalizedStatus !== "cancelled" ? (
          <button
            onClick={() => onStatusChange("ended")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium border border-white/[0.06] text-[var(--text-secondary)] hover:bg-white/[0.04] transition-colors"
            style={{ fontFamily: "var(--font-mono-org)" }}
          >
            <CheckCircle size={13} />
            End
          </button>
        ) : null}
      </div>
    </div>
  );
}
