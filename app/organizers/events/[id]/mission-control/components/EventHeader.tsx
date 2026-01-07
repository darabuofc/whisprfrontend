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
        return "bg-green-500/20 text-green-400 border border-green-500/30";
      case "Today":
        return "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30";
      case "Draft":
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
      case "Ended":
        return "bg-red-500/20 text-red-400 border border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
    }
  };

  const isPublished = status === "Live" || status === "Today";

  return (
    <div className="sticky top-0 z-40 bg-gray-950/95 backdrop-blur-lg border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Left side */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                {name}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                  status
                )}`}
              >
                {status}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
              <span className="font-medium">{date}</span>
              <span className="hidden sm:inline">•</span>
              <span>{time}</span>
              <span className="hidden sm:inline">•</span>
              <span className="text-gray-500">{venue}</span>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Primary action button */}
            {isPublished ? (
              <button
                onClick={onPause}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                <Pause size={18} />
                <span className="hidden sm:inline">Pause</span>
              </button>
            ) : (
              <button
                onClick={onPublish}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors"
              >
                <Play size={18} />
                <span className="hidden sm:inline">Publish</span>
              </button>
            )}

            {/* Share button */}
            <button
              onClick={onShare}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              <Share2 size={18} />
              <span className="hidden sm:inline">Share</span>
            </button>

            {/* Kebab menu */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
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
                  <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-800 rounded-lg shadow-xl py-2 z-20">
                    <button
                      onClick={() => {
                        onEdit?.();
                        setMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                    >
                      Edit event
                    </button>
                    <button
                      onClick={() => {
                        onDuplicate?.();
                        setMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                    >
                      Duplicate
                    </button>
                    <div className="border-t border-gray-800 my-2" />
                    <button
                      onClick={() => {
                        onCancel?.();
                        setMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-800 hover:text-red-300 transition-colors"
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
