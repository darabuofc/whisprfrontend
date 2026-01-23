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
        return "bg-[#C1FF72]/20 text-[#C1FF72] border border-[#C1FF72]/30";
      case "Today":
        return "bg-[#C1FF72]/20 text-[#C1FF72] border border-[#C1FF72]/30";
      case "Draft":
        return "bg-white/10 text-white/70 border border-white/20";
      case "Ended":
        return "bg-white/5 text-white/50 border border-white/10";
      default:
        return "bg-white/10 text-white/70 border border-white/20";
    }
  };

  const isPublished = status === "Live" || status === "Today";

  return (
    <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          {/* Left side */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">
                {name}
              </h1>
              <span
                className={`px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor(
                  status
                )}`}
              >
                {status}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-white/50">
              <span className="font-medium text-white/70">{date}</span>
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
                className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl font-medium transition-all active:scale-95 border border-white/10"
              >
                <Pause size={18} />
                <span className="hidden md:inline">Pause</span>
              </button>
            ) : (
              <button
                onClick={onPublish}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#B472FF] hover:bg-[#A060E8] text-white rounded-xl font-medium transition-all active:scale-95 shadow-lg shadow-[#B472FF]/30"
              >
                <Play size={18} />
                <span className="hidden md:inline">Publish</span>
              </button>
            )}

            {/* Share button */}
            <button
              onClick={onShare}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl font-medium transition-all active:scale-95 border border-white/10"
            >
              <Share2 size={18} />
              <span className="hidden md:inline">Share</span>
            </button>

            {/* Kebab menu */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl transition-all active:scale-95 border border-white/10"
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
                  <div className="absolute right-0 mt-2 w-48 bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl py-1.5 z-20">
                    <button
                      onClick={() => {
                        onEdit?.();
                        setMenuOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      Edit event
                    </button>
                    <button
                      onClick={() => {
                        onDuplicate?.();
                        setMenuOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      Duplicate
                    </button>
                    <div className="border-t border-white/10 my-1.5" />
                    <button
                      onClick={() => {
                        onCancel?.();
                        setMenuOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors"
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
