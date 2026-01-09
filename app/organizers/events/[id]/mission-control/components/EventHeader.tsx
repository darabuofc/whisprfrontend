import { Share2, MoreVertical, Play, Pause } from "lucide-react";
import { useState } from "react";

type EventStatus = "Draft" | "Live" | "Today" | "Ended";

interface EventHeaderProps {
  name: string;
  status: EventStatus;
  date: string;
  time: string;
  venue: string;
  onPublish?: () => void;
  onPause?: () => void;
  onShare?: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onCancel?: () => void;
}

export default function EventHeader({
  name,
  status,
  date,
  time,
  venue,
  onPublish,
  onPause,
  onShare,
  onEdit,
  onDuplicate,
  onCancel,
}: EventHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const getStatusColor = (status: EventStatus) => {
    switch (status) {
      case "Live":
        return "bg-blue-50 text-blue-600";
      case "Today":
        return "bg-blue-50 text-blue-600";
      case "Draft":
        return "bg-neutral-100 text-neutral-600";
      case "Ended":
        return "bg-neutral-100 text-neutral-500";
      default:
        return "bg-neutral-100 text-neutral-600";
    }
  };

  const isPublished = status === "Live" || status === "Today";

  return (
    <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-neutral-200/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          {/* Left side */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl sm:text-4xl font-semibold bg-gradient-to-r from-neutral-900 to-neutral-700 bg-clip-text text-transparent tracking-tight">
                {name}
              </h1>
              <span
                className={`px-3 py-1.5 rounded-full text-xs font-medium shadow-sm ${getStatusColor(
                  status
                )}`}
              >
                {status}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-500">
              <span className="font-medium text-neutral-700">{date}</span>
              <span className="hidden sm:inline">•</span>
              <span>{time}</span>
              <span className="hidden sm:inline">•</span>
              <span>{venue}</span>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2.5">
            {/* Primary action button */}
            {isPublished ? (
              <button
                onClick={onPause}
                className="flex items-center gap-2 px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 rounded-xl font-medium transition-all active:scale-95"
              >
                <Pause size={18} />
                <span className="hidden sm:inline">Pause</span>
              </button>
            ) : (
              <button
                onClick={onPublish}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium transition-all active:scale-95 shadow-lg shadow-blue-500/30"
              >
                <Play size={18} />
                <span className="hidden sm:inline">Publish</span>
              </button>
            )}

            {/* Share button */}
            <button
              onClick={onShare}
              className="flex items-center gap-2 px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 rounded-xl font-medium transition-all active:scale-95"
            >
              <Share2 size={18} />
              <span className="hidden sm:inline">Share</span>
            </button>

            {/* Kebab menu */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 rounded-xl transition-all active:scale-95"
              >
                <MoreVertical size={20} />
              </button>

              {menuOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setMenuOpen(false)}
                  />
                  {/* Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-xl border border-neutral-200/60 rounded-2xl shadow-xl py-1.5 z-20">
                    <button
                      onClick={() => {
                        onEdit?.();
                        setMenuOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                    >
                      Edit event
                    </button>
                    <button
                      onClick={() => {
                        onDuplicate?.();
                        setMenuOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                    >
                      Duplicate
                    </button>
                    <div className="border-t border-neutral-200/60 my-1.5" />
                    <button
                      onClick={() => {
                        onCancel?.();
                        setMenuOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Cancel event
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
