"use client";

import { useEffect, useRef, useState } from "react";

export interface LogEntry {
  timestamp: string; // HH:MM:SS format
  type: "NEW_REGISTRATION" | "APPROVED" | "REJECTED" | "CHECKIN" | "FLAG" | "SYSTEM";
  details: string;
}

interface SystemLogProps {
  entries: LogEntry[];
}

export default function SystemLog({ entries }: SystemLogProps) {
  const logContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const lastScrollTop = useRef(0);

  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [entries, autoScroll]);

  const handleScroll = () => {
    if (!logContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = logContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;

    // If user scrolled up, pause auto-scroll
    if (scrollTop < lastScrollTop.current) {
      setAutoScroll(false);
    }

    // If user scrolls to bottom, resume auto-scroll
    if (isAtBottom) {
      setAutoScroll(true);
    }

    lastScrollTop.current = scrollTop;
  };

  const getTypeColor = (type: LogEntry["type"]) => {
    switch (type) {
      case "NEW_REGISTRATION":
        return "text-[#6B7280]";
      case "APPROVED":
        return "text-[#10B981]";
      case "REJECTED":
        return "text-[#EF4444]";
      case "CHECKIN":
        return "text-[#10B981]";
      case "FLAG":
        return "text-[#F59E0B]";
      case "SYSTEM":
        return "text-[#6B7280]";
      default:
        return "text-[#9CA3AF]";
    }
  };

  return (
    <div className="fixed right-0 top-12 bottom-0 w-64 bg-[#000000] border-l border-[#1A1A1A] z-40 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-[#000000] border-b border-[#1A1A1A] px-3 py-3 z-10">
        <h3 className="text-[12px] font-normal uppercase tracking-[0.15em] text-[#6B7280]">
          SYSTEM LOG
        </h3>
      </div>

      {/* Log entries */}
      <div
        ref={logContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-3 py-2 space-y-0"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {entries.length === 0 ? (
          <div className="text-[11px] font-mono text-[#6B7280] mt-4">
            [AWAITING EVENTS]
          </div>
        ) : (
          entries.map((entry, index) => (
            <div
              key={index}
              className="font-mono text-[11px] leading-relaxed"
              style={{ lineHeight: "1.6" }}
            >
              <span className="text-[#6B7280]">[{entry.timestamp}]</span>{" "}
              <span className={getTypeColor(entry.type)}>{entry.type}</span>
              <span className="text-[#9CA3AF]">: {entry.details}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
