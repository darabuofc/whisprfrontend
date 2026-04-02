"use client";

import { useState, useEffect } from "react";
import { Loader2, UserCheck, AlertCircle } from "lucide-react";
import { searchAttendee, invitePartner, type AttendeeSearchResult } from "@/lib/api";
import { toast } from "sonner";

interface SearchTabProps {
  registrationId: string;
  onGuestAdded: () => void;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
}

export default function SearchTab({ registrationId, onGuestAdded }: SearchTabProps) {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<AttendeeSearchResult | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 3) {
      setResult(null);
      setNotFound(false);
      return;
    }

    setSearching(true);
    setNotFound(false);
    setResult(null);

    const timeout = setTimeout(async () => {
      try {
        const data = await searchAttendee(trimmed);
        setResult(data);
        setNotFound(false);
      } catch (err: any) {
        setResult(null);
        if (err?.response?.status === 404) {
          setNotFound(true);
        }
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => {
      clearTimeout(timeout);
      setSearching(false);
    };
  }, [query]);

  const handleInvite = async () => {
    if (!result) return;
    setInviting(true);
    try {
      await invitePartner(registrationId, { attendee_id: result.id });
      toast.success(`Invite sent to ${result.name}`);
      onGuestAdded();
    } catch {
      toast.error("Failed to send invite. Please try again.");
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Phone number or email"
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#D4A574]/50 focus:border-transparent transition-all"
      />

      {searching && (
        <div className="flex items-center justify-center py-4">
          <Loader2 size={18} className="animate-spin text-[#D4A574]/60" />
        </div>
      )}

      {result && !searching && (
        <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
          <div className="w-10 h-10 rounded-full bg-[#D4A574]/15 flex items-center justify-center text-sm font-semibold text-[#D4A574] flex-shrink-0">
            {getInitials(result.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{result.name}</p>
          </div>
          <button
            onClick={handleInvite}
            disabled={inviting}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#D4A574] hover:bg-[#B8785C] text-[#0A0A0A] text-xs font-semibold transition-all disabled:opacity-50"
          >
            {inviting ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <UserCheck size={13} />
            )}
            {inviting ? "Inviting..." : "Invite"}
          </button>
        </div>
      )}

      {notFound && !searching && (
        <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-3">
          <AlertCircle size={15} className="text-neutral-500 flex-shrink-0" />
          <p className="text-xs text-neutral-500">
            Not found on Whispr. Try the <span className="text-neutral-400">Manual</span> tab to add them directly.
          </p>
        </div>
      )}
    </div>
  );
}
