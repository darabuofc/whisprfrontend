import { Share2, MoreVertical, Play, Pause, MapPin, ArrowLeft } from "lucide-react";
import { useState } from "react";

type EventStatus = "Draft" | "Live" | "Today" | "Ended";

interface EventHeaderProps {
  name: string;
  status: EventStatus;
  date: string;
  time: string;
  venue: string;
  onBack?: () => void;
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
  onBack,
  onPublish,
  onPause,
  onShare,
  onEdit,
  onDuplicate,
  onCancel,
}: EventHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const getStatusStyles = (status: EventStatus) => {
    switch (status) {
      case "Live":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Today":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Draft":
        return "bg-white/[0.04] text-white/50 border-white/[0.08]";
      case "Ended":
        return "bg-white/[0.02] text-white/30 border-white/[0.04]";
      default:
        return "bg-white/[0.04] text-white/50 border-white/[0.08]";
    }
  };

  const isPublished = status === "Live" || status === "Today";

  return (
    <div className="sticky top-0 z-40 bg-[#0a0a0a]/90 backdrop-blur-lg border-b border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          {/* Left side */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={onBack}
                className="flex items-center gap-1.5 px-2.5 py-1.5 -ml-2.5 text-white/50 hover:text-white/90 hover:bg-white/[0.06] rounded-lg text-sm font-medium transition-colors"
              >
                <ArrowLeft size={16} />
                <span className="hidden sm:inline">Dashboard</span>
              </button>
              <span className="text-white/20 hidden sm:inline">|</span>
              <h1 className="text-2xl sm:text-3xl font-semibold text-white/95 tracking-tight truncate">
                {name}
              </h1>
              <span
                className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium border ${getStatusStyles(
                  status
                )}`}
              >
                {status}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/40">
              <span className="font-medium text-white/60">{date}</span>
              <span className="hidden sm:inline text-white/20">·</span>
              <span>{time}</span>
              <span className="hidden sm:inline text-white/20">·</span>
              <span className="flex items-center gap-1.5">
                <MapPin size={12} className="opacity-60" />
                {venue}
              </span>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Primary action button */}
            {isPublished ? (
              <button
                onClick={onPause}
                className="flex items-center gap-2 px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-white/80 rounded-lg text-sm font-medium transition-colors border border-white/[0.08]"
              >
                <Pause size={15} />
                <span className="hidden sm:inline">Pause</span>
              </button>
            ) : (
              <button
                onClick={onPublish}
                className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg text-sm font-medium transition-colors hover:bg-white/90"
              >
                <Play size={15} />
                <span className="hidden sm:inline">Publish</span>
              </button>
            )}

            {/* Share button */}
            <button
              onClick={onShare}
              className="flex items-center gap-2 px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-white/80 rounded-lg text-sm font-medium transition-colors border border-white/[0.08]"
            >
              <Share2 size={15} />
              <span className="hidden sm:inline">Share</span>
            </button>

            {/* Kebab menu */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 bg-white/[0.06] hover:bg-white/[0.1] text-white/60 rounded-lg transition-colors border border-white/[0.08]"
              >
                <MoreVertical size={18} />
              </button>

              {menuOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setMenuOpen(false)}
                  />
                  {/* Menu */}
                  <div className="absolute right-0 mt-2 w-44 bg-[#1a1a1a] border border-white/[0.08] rounded-xl shadow-2xl py-1 z-20">
                    <button
                      onClick={() => {
                        onEdit?.();
                        setMenuOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-white/80 hover:bg-white/[0.06] transition-colors"
                    >
                      Edit event
                    </button>
                    <button
                      onClick={() => {
                        onDuplicate?.();
                        setMenuOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-white/80 hover:bg-white/[0.06] transition-colors"
                    >
                      Duplicate
                    </button>
                    <div className="border-t border-white/[0.06] my-1" />
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
