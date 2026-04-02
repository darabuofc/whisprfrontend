"use client";

import { useState } from "react";
import { Copy, Check, Share2 } from "lucide-react";

interface JoinCodeTabProps {
  joinCode: string;
}

export default function JoinCodeTab({ joinCode }: JoinCodeTabProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(joinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
        <p
          onClick={handleCopy}
          className="font-mono text-lg text-[#D4A574] cursor-pointer hover:text-white transition select-all"
        >
          {joinCode}
        </p>
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-md hover:bg-white/[0.06] transition-colors flex-shrink-0"
          title={copied ? "Copied!" : "Copy code"}
        >
          {copied ? (
            <Check size={14} className="text-[#D4A574]" />
          ) : (
            <Copy size={14} className="text-neutral-500" />
          )}
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-white/[0.06]" />
        <span className="text-[10px] uppercase tracking-wider text-neutral-600">or share via</span>
        <div className="flex-1 h-px bg-white/[0.06]" />
      </div>

      <button
        onClick={() =>
          window.open(
            `https://wa.me/?text=Join%20my%20Whispr%20event%20group%20with%20this%20code:%20${joinCode}`,
            "_blank"
          )
        }
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/[0.04] hover:bg-[#D4A574]/[0.08] border border-white/[0.06] hover:border-[#D4A574]/20 px-4 py-2.5 text-xs font-medium text-[#D4A574] transition-all duration-300"
      >
        <Share2 size={12} />
        Invite via WhatsApp
      </button>
    </div>
  );
}
