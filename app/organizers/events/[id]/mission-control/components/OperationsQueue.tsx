"use client";

import { Check, X, AlertTriangle } from "lucide-react";

export interface QueueItem {
  id: string;
  name: string;
  type: "Individual" | "Couple" | "Group";
  status: "PENDING" | "APPROVED" | "REJECTED" | "FLAGGED";
  timestamp?: string;
}

interface OperationsQueueProps {
  items: QueueItem[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export default function OperationsQueue({
  items,
  onApprove,
  onReject,
}: OperationsQueueProps) {
  const getStatusColor = (status: QueueItem["status"]) => {
    switch (status) {
      case "PENDING":
        return "text-[#F59E0B]";
      case "APPROVED":
        return "text-[#10B981]";
      case "REJECTED":
        return "text-[#EF4444]";
      case "FLAGGED":
        return "text-[#F59E0B]";
      default:
        return "text-[#9CA3AF]";
    }
  };

  return (
    <div className="w-full border border-[#1A1A1A]">
      {/* Header */}
      <div className="border-b border-[#1A1A1A] bg-[#0A0A0A]">
        <div className="px-4 py-3">
          <h2 className="text-[12px] font-normal uppercase tracking-[0.15em] text-[#6B7280]">
            OPERATIONS QUEUE
          </h2>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#0A0A0A] border-b border-[#1A1A1A]">
            <tr>
              <th className="text-left px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.12em] text-[#6B7280]">
                ID
              </th>
              <th className="text-left px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.12em] text-[#6B7280]">
                NAME
              </th>
              <th className="text-left px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.12em] text-[#6B7280]">
                TYPE
              </th>
              <th className="text-left px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.12em] text-[#6B7280]">
                STATUS
              </th>
              <th className="text-right px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.12em] text-[#6B7280]">
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-[14px] text-[#6B7280]"
                >
                  NO PENDING OPERATIONS
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-[#1A1A1A] hover:border-b-[#F59E0B] transition-colors"
                >
                  <td className="px-4 py-2.5 text-[14px] text-[#E5E7EB] font-mono" style={{ fontFeatureSettings: '"tnum"' }}>
                    {item.id}
                  </td>
                  <td className="px-4 py-2.5 text-[14px] text-[#E5E7EB]">
                    {item.name}
                  </td>
                  <td className="px-4 py-2.5 text-[14px] text-[#9CA3AF]">
                    {item.type}
                  </td>
                  <td className={`px-4 py-2.5 text-[14px] font-medium ${getStatusColor(item.status)}`}>
                    <span className="flex items-center gap-1.5">
                      {item.status}
                      {item.status === "FLAGGED" && (
                        <AlertTriangle size={14} strokeWidth={2} />
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onApprove(item.id)}
                        className="w-8 h-8 flex items-center justify-center border border-[#1A1A1A] text-[#6B7280] hover:text-[#10B981] hover:border-[#10B981] transition-colors"
                        title="Approve"
                      >
                        <Check size={16} strokeWidth={2} />
                      </button>
                      <button
                        onClick={() => onReject(item.id)}
                        className="w-8 h-8 flex items-center justify-center border border-[#1A1A1A] text-[#6B7280] hover:text-[#EF4444] hover:border-[#EF4444] transition-colors"
                        title="Reject"
                      >
                        <X size={16} strokeWidth={2} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
