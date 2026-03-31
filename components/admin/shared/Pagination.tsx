"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  lastPage,
  onPageChange,
}: PaginationProps) {
  if (lastPage <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 pt-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="p-1.5 rounded-lg border border-white/[0.06] text-[var(--text-secondary)] hover:bg-white/[0.04] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={16} />
      </button>

      <span
        className="text-[12px] text-[var(--text-secondary)] px-3"
        style={{ fontFamily: "var(--font-mono-org)" }}
      >
        {currentPage} / {lastPage}
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= lastPage}
        className="p-1.5 rounded-lg border border-white/[0.06] text-[var(--text-secondary)] hover:bg-white/[0.04] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
