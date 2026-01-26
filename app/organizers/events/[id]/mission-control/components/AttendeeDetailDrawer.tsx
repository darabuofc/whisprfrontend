"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Mail,
  Phone,
  Instagram,
  User,
  Briefcase,
  Calendar,
  Check,
  XIcon,
  Loader2,
  ExternalLink,
  Users,
  FileText,
  Clock,
  Hash,
} from "lucide-react";
import { getRegistrationDetail, RegistrationDetail } from "@/lib/api";

interface AttendeeDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  registrationId: string | null;
  onApprove?: (registrationId: string) => void;
  onReject?: (registrationId: string) => void;
  canApprove?: boolean;
  canReject?: boolean;
}

export default function AttendeeDetailDrawer({
  isOpen,
  onClose,
  registrationId,
  onApprove,
  onReject,
  canApprove = false,
  canReject = false,
}: AttendeeDetailDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<"approve" | "reject" | null>(null);
  const [detail, setDetail] = useState<RegistrationDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && registrationId) {
      setLoading(true);
      setError(null);
      getRegistrationDetail(registrationId)
        .then((data) => {
          setDetail(data);
        })
        .catch((err) => {
          setError("Failed to load registration details");
          console.error(err);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setDetail(null);
    }
  }, [isOpen, registrationId]);

  const handleApprove = async () => {
    if (!registrationId || !onApprove) return;
    setActionLoading("approve");
    try {
      await onApprove(registrationId);
      onClose();
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!registrationId || !onReject) return;
    setActionLoading("reject");
    try {
      await onReject(registrationId);
      onClose();
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "approved":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "rejected":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "revoked":
        return "bg-white/[0.04] text-white/40 border-white/[0.08]";
      default:
        return "bg-white/[0.04] text-white/50 border-white/[0.08]";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-lg bg-[#0a0a0a] border-l border-white/[0.06] shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06] bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
                  <Users className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h2 className="text-lg font-medium text-white/90">Registration Details</h2>
                  {registrationId && (
                    <p className="text-xs font-mono text-white/40 mt-0.5">{registrationId}</p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/[0.08] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-3">
                  <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
                  <p className="text-white/40 text-sm">Loading details...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-64 gap-3">
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                    <XIcon className="w-5 h-5 text-red-400" />
                  </div>
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              ) : detail ? (
                <div className="p-6 space-y-6">
                  {/* Registration Info */}
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
                    <h3 className="text-xs font-medium uppercase tracking-wider text-white/30 mb-4">
                      Registration Info
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white/50">
                          <Hash size={14} />
                          <span className="text-sm">Registration ID</span>
                        </div>
                        <span className="text-sm font-mono text-white/80">
                          {detail.registration?.fields?.registration_id || registrationId}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white/50">
                          <FileText size={14} />
                          <span className="text-sm">Status</span>
                        </div>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getStatusStyles(
                            detail.registration?.fields?.Status
                          )}`}
                        >
                          {detail.registration?.fields?.Status || "Unknown"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white/50">
                          <Users size={14} />
                          <span className="text-sm">Pass Type</span>
                        </div>
                        <span className="text-sm text-white/80">
                          {detail.registration?.fields?.pass_type_name || "—"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white/50">
                          <Clock size={14} />
                          <span className="text-sm">Registered</span>
                        </div>
                        <span className="text-sm text-white/60">
                          {formatDate(detail.registration?.fields?.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Attendees */}
                  <div>
                    <h3 className="text-xs font-medium uppercase tracking-wider text-white/30 mb-4 px-1">
                      Attendees ({detail.attendees?.length || 0})
                    </h3>
                    <div className="space-y-4">
                      {detail.attendees?.map((attendee, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden"
                        >
                          {/* Attendee Header */}
                          <div className="p-4 border-b border-white/[0.04]">
                            <div className="flex items-center gap-4">
                              {attendee.profile_picture ? (
                                <img
                                  src={attendee.profile_picture}
                                  alt={attendee.full_name}
                                  className="w-14 h-14 rounded-xl object-cover border border-white/[0.08]"
                                />
                              ) : (
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center border border-white/[0.08]">
                                  <span className="text-xl font-medium text-violet-400">
                                    {attendee.full_name?.charAt(0)?.toUpperCase() || "?"}
                                  </span>
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="text-base font-medium text-white/90 truncate">
                                  {attendee.full_name || "Unknown"}
                                </h4>
                                <div className="flex items-center gap-3 mt-1">
                                  {attendee.gender && (
                                    <span className="text-xs text-white/40 capitalize">
                                      {attendee.gender}
                                    </span>
                                  )}
                                  {attendee.age && (
                                    <span className="text-xs text-white/40">{attendee.age} years</span>
                                  )}
                                  {attendee.profession && (
                                    <span className="text-xs text-white/50 px-2 py-0.5 bg-white/[0.04] rounded">
                                      {attendee.profession}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {index === 0 && (
                                <span className="px-2 py-1 text-[10px] uppercase tracking-wider font-medium bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-md">
                                  Primary
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Contact Info */}
                          <div className="p-4 space-y-3">
                            {attendee.email && (
                              <div className="flex items-center gap-3 group">
                                <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center">
                                  <Mail size={14} className="text-white/40" />
                                </div>
                                <a
                                  href={`mailto:${attendee.email}`}
                                  className="text-sm text-white/60 hover:text-white/90 transition-colors truncate flex-1"
                                >
                                  {attendee.email}
                                </a>
                                <ExternalLink
                                  size={12}
                                  className="text-white/20 group-hover:text-white/40 transition-colors"
                                />
                              </div>
                            )}

                            {attendee.whatsapp && (
                              <div className="flex items-center gap-3 group">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                  <Phone size={14} className="text-emerald-400" />
                                </div>
                                <a
                                  href={`https://wa.me/${attendee.whatsapp.replace(/\D/g, "")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-white/60 hover:text-emerald-400 transition-colors truncate flex-1"
                                >
                                  {attendee.whatsapp}
                                </a>
                                <ExternalLink
                                  size={12}
                                  className="text-white/20 group-hover:text-emerald-400/40 transition-colors"
                                />
                              </div>
                            )}

                            {attendee.instagram_handle && (
                              <div className="flex items-center gap-3 group">
                                <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center">
                                  <Instagram size={14} className="text-pink-400" />
                                </div>
                                <a
                                  href={`https://instagram.com/${attendee.instagram_handle.replace(
                                    "@",
                                    ""
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-white/60 hover:text-pink-400 transition-colors truncate flex-1"
                                >
                                  @{attendee.instagram_handle.replace("@", "")}
                                </a>
                                <ExternalLink
                                  size={12}
                                  className="text-white/20 group-hover:text-pink-400/40 transition-colors"
                                />
                              </div>
                            )}

                            {/* Bio */}
                            {attendee.bio && (
                              <div className="pt-2 border-t border-white/[0.04]">
                                <p className="text-xs text-white/30 mb-1.5">Bio</p>
                                <p className="text-sm text-white/60 leading-relaxed">
                                  {attendee.bio}
                                </p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}

                      {(!detail.attendees || detail.attendees.length === 0) && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <div className="w-12 h-12 rounded-xl bg-white/[0.02] flex items-center justify-center mb-3">
                            <User className="w-5 h-5 text-white/20" />
                          </div>
                          <p className="text-sm text-white/40">No attendee details available</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.02] flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white/20" />
                  </div>
                  <p className="text-white/40 text-sm">Select a registration to view details</p>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            {detail && (canApprove || canReject) && (
              <div className="px-6 py-4 border-t border-white/[0.06] bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  {canReject && (
                    <button
                      onClick={handleReject}
                      disabled={actionLoading !== null}
                      className="flex-1 h-11 flex items-center justify-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {actionLoading === "reject" ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <>
                          <XIcon size={16} />
                          Reject
                        </>
                      )}
                    </button>
                  )}
                  {canApprove && (
                    <button
                      onClick={handleApprove}
                      disabled={actionLoading !== null}
                      className="flex-1 h-11 flex items-center justify-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {actionLoading === "approve" ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <>
                          <Check size={16} />
                          Approve
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
