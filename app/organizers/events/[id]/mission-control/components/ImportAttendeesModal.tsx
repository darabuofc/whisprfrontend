"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Upload,
  FileSpreadsheet,
  Loader2,
  CheckCircle,
  AlertCircle,
  Download,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  importAttendees,
  type ImportAttendeesResponse,
  type ImportedTicket,
} from "@/lib/api";

interface ImportAttendeesModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizerId: string;
  eventId: string;
  passTypes: { id: string; name: string }[];
  onImportComplete: () => void;
}

type ImportState = "idle" | "uploading" | "success" | "error";

export default function ImportAttendeesModal({
  isOpen,
  onClose,
  organizerId,
  eventId,
  passTypes,
  onImportComplete,
}: ImportAttendeesModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPassType, setSelectedPassType] = useState<string>("");
  const [importState, setImportState] = useState<ImportState>("idle");
  const [importResult, setImportResult] = useState<ImportAttendeesResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showTickets, setShowTickets] = useState(false);
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = [
        "text/csv",
        "text/plain",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];
      const validExtensions = [".csv", ".txt", ".xls", ".xlsx"];
      const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();

      if (!validTypes.includes(file.type) && !validExtensions.includes(ext)) {
        setErrorMessage("Please upload a CSV, TXT, XLS, or XLSX file");
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("File size must be less than 5MB");
        return;
      }

      setSelectedFile(file);
      setErrorMessage("");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const input = fileInputRef.current;
      if (input) {
        const dt = new DataTransfer();
        dt.items.add(file);
        input.files = dt.files;
        handleFileSelect({ target: input } as React.ChangeEvent<HTMLInputElement>);
      }
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setImportState("uploading");
    setErrorMessage("");

    try {
      const result = await importAttendees(
        organizerId,
        eventId,
        selectedFile,
        selectedPassType || undefined
      );
      setImportResult(result);
      setImportState("success");
      onImportComplete();
    } catch (error: any) {
      setImportState("error");
      setErrorMessage(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to import attendees"
      );
    }
  };

  const handleClose = () => {
    // Reset state when closing
    setSelectedFile(null);
    setSelectedPassType("");
    setImportState("idle");
    setImportResult(null);
    setErrorMessage("");
    setShowTickets(false);
    setShowDuplicates(false);
    setShowErrors(false);
    onClose();
  };

  const handleDownloadAllTickets = () => {
    if (!importResult?.tickets) return;
    importResult.tickets.forEach((ticket) => {
      if (ticket.ticket_url) {
        window.open(ticket.ticket_url, "_blank");
      }
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-[#111113] border border-white/[0.08] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
                <div>
                  <h2 className="text-lg font-semibold text-white/90">Import Attendees</h2>
                  <p className="text-sm text-white/40 mt-0.5">
                    Bulk import from CSV or Excel file
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.04] text-white/40 hover:bg-white/[0.08] hover:text-white/60 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {importState === "idle" && (
                  <>
                    {/* File Upload Area */}
                    <div
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                        selectedFile
                          ? "border-[#C1FF72]/30 bg-[#C1FF72]/[0.02]"
                          : "border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.02]"
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.txt,.xls,.xlsx"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      {selectedFile ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 rounded-xl bg-[#C1FF72]/10 flex items-center justify-center">
                            <FileSpreadsheet className="w-6 h-6 text-[#C1FF72]" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white/80">{selectedFile.name}</p>
                            <p className="text-xs text-white/40 mt-0.5">
                              {formatFileSize(selectedFile.size)}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFile(null);
                              if (fileInputRef.current) fileInputRef.current.value = "";
                            }}
                            className="text-xs text-white/40 hover:text-white/60 transition-colors mt-1"
                          >
                            Choose different file
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center">
                            <Upload className="w-5 h-5 text-white/40" />
                          </div>
                          <div>
                            <p className="text-sm text-white/60">
                              Drop your file here or <span className="text-[#C1FF72]">browse</span>
                            </p>
                            <p className="text-xs text-white/30 mt-1">
                              CSV, TXT, XLS, or XLSX (max 5MB)
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Pass Type Selection */}
                    <div>
                      <label className="block text-sm font-medium text-white/60 mb-2">
                        Pass Type (optional)
                      </label>
                      <select
                        value={selectedPassType}
                        onChange={(e) => setSelectedPassType(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/90 text-sm focus:outline-none focus:border-white/20 appearance-none cursor-pointer"
                      >
                        <option value="">Guest (default)</option>
                        {passTypes.map((pt) => (
                          <option key={pt.id} value={pt.id}>
                            {pt.name}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-white/30 mt-1.5">
                        Leave empty to use the default &quot;Guest&quot; pass type
                      </p>
                    </div>

                    {/* File Format Info */}
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
                      <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2">
                        Required Columns
                      </p>
                      <p className="text-sm text-white/70">
                        <span className="text-[#C1FF72]">name</span> (or full_name, attendee)
                      </p>
                      <p className="text-xs font-medium text-white/50 uppercase tracking-wider mt-3 mb-2">
                        Optional Columns
                      </p>
                      <p className="text-sm text-white/50">
                        phone, email, instagram, gender
                      </p>
                    </div>

                    {errorMessage && (
                      <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                        <p className="text-sm text-red-400">{errorMessage}</p>
                      </div>
                    )}
                  </>
                )}

                {importState === "uploading" && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-10 h-10 text-[#C1FF72] animate-spin mb-4" />
                    <p className="text-white/70 text-sm font-medium">Importing attendees...</p>
                    <p className="text-white/40 text-xs mt-1">
                      Creating records, registrations, and tickets
                    </p>
                  </div>
                )}

                {importState === "success" && importResult && (
                  <div className="space-y-4">
                    {/* Success Summary */}
                    <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-emerald-400">Import Complete</p>
                        <p className="text-xs text-emerald-400/70 mt-0.5">
                          {importResult.summary.imported} of {importResult.summary.total_rows} attendees imported
                        </p>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-3 text-center">
                        <p className="text-xl font-semibold text-[#C1FF72]">
                          {importResult.summary.imported}
                        </p>
                        <p className="text-xs text-white/40 mt-0.5">Imported</p>
                      </div>
                      <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-3 text-center">
                        <p className="text-xl font-semibold text-amber-400">
                          {importResult.summary.duplicates_count}
                        </p>
                        <p className="text-xs text-white/40 mt-0.5">Duplicates</p>
                      </div>
                      <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-3 text-center">
                        <p className="text-xl font-semibold text-red-400">
                          {importResult.summary.errors_count}
                        </p>
                        <p className="text-xs text-white/40 mt-0.5">Errors</p>
                      </div>
                    </div>

                    {/* Imported Tickets */}
                    {importResult.tickets.length > 0 && (
                      <div className="border border-white/[0.06] rounded-xl overflow-hidden">
                        <button
                          onClick={() => setShowTickets(!showTickets)}
                          className="w-full flex items-center justify-between p-4 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                        >
                          <span className="text-sm font-medium text-white/70">
                            Imported Tickets ({importResult.tickets.length})
                          </span>
                          {showTickets ? (
                            <ChevronUp size={16} className="text-white/40" />
                          ) : (
                            <ChevronDown size={16} className="text-white/40" />
                          )}
                        </button>
                        {showTickets && (
                          <div className="max-h-48 overflow-y-auto">
                            {importResult.tickets.map((ticket) => (
                              <div
                                key={ticket.ticket_id}
                                className="flex items-center justify-between px-4 py-2.5 border-t border-white/[0.04] hover:bg-white/[0.02]"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-white/30 w-6">#{ticket.row}</span>
                                  <span className="text-sm text-white/70">{ticket.name}</span>
                                </div>
                                {ticket.ticket_url && (
                                  <a
                                    href={ticket.ticket_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-[#C1FF72] hover:underline"
                                  >
                                    View PDF
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Duplicates */}
                    {importResult.duplicates.length > 0 && (
                      <div className="border border-amber-500/20 rounded-xl overflow-hidden">
                        <button
                          onClick={() => setShowDuplicates(!showDuplicates)}
                          className="w-full flex items-center justify-between p-4 bg-amber-500/5 hover:bg-amber-500/10 transition-colors"
                        >
                          <span className="text-sm font-medium text-amber-400">
                            Duplicates ({importResult.duplicates.length})
                          </span>
                          {showDuplicates ? (
                            <ChevronUp size={16} className="text-amber-400/60" />
                          ) : (
                            <ChevronDown size={16} className="text-amber-400/60" />
                          )}
                        </button>
                        {showDuplicates && (
                          <div className="max-h-32 overflow-y-auto bg-amber-500/[0.02]">
                            {importResult.duplicates.map((dup, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2 px-4 py-2 border-t border-amber-500/10 text-sm"
                              >
                                <span className="text-xs text-amber-400/50 w-6">#{dup.row}</span>
                                <span className="text-amber-400/70">{dup.name}</span>
                                <span className="text-amber-400/40 text-xs">({dup.phone})</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Errors */}
                    {importResult.errors.length > 0 && (
                      <div className="border border-red-500/20 rounded-xl overflow-hidden">
                        <button
                          onClick={() => setShowErrors(!showErrors)}
                          className="w-full flex items-center justify-between p-4 bg-red-500/5 hover:bg-red-500/10 transition-colors"
                        >
                          <span className="text-sm font-medium text-red-400">
                            Errors ({importResult.errors.length})
                          </span>
                          {showErrors ? (
                            <ChevronUp size={16} className="text-red-400/60" />
                          ) : (
                            <ChevronDown size={16} className="text-red-400/60" />
                          )}
                        </button>
                        {showErrors && (
                          <div className="max-h-32 overflow-y-auto bg-red-500/[0.02]">
                            {importResult.errors.map((err, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2 px-4 py-2 border-t border-red-500/10 text-sm"
                              >
                                <span className="text-xs text-red-400/50 w-6">#{err.row}</span>
                                <span className="text-red-400/70">{err.reason}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {importState === "error" && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                      <AlertCircle className="w-6 h-6 text-red-400" />
                    </div>
                    <p className="text-white/70 text-sm font-medium">Import Failed</p>
                    <p className="text-red-400 text-sm mt-2 text-center max-w-sm">
                      {errorMessage}
                    </p>
                    <button
                      onClick={() => {
                        setImportState("idle");
                        setErrorMessage("");
                      }}
                      className="mt-4 text-sm text-white/50 hover:text-white/70 transition-colors"
                    >
                      Try again
                    </button>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-white/[0.06] flex items-center justify-between gap-3">
                {importState === "idle" && (
                  <>
                    <button
                      onClick={handleClose}
                      className="px-4 py-2 rounded-lg text-white/50 hover:text-white/70 hover:bg-white/[0.04] transition-colors text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <motion.button
                      onClick={handleImport}
                      disabled={!selectedFile}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                        selectedFile
                          ? "bg-[#C1FF72] text-black shadow-[0_0_20px_rgba(193,255,114,0.3)] hover:shadow-[0_0_30px_rgba(193,255,114,0.4)]"
                          : "bg-white/[0.06] text-white/30 cursor-not-allowed"
                      }`}
                      whileHover={selectedFile ? { scale: 1.02 } : {}}
                      whileTap={selectedFile ? { scale: 0.98 } : {}}
                    >
                      <Upload size={16} />
                      <span className="text-sm">Import Attendees</span>
                    </motion.button>
                  </>
                )}

                {importState === "success" && (
                  <>
                    {importResult && importResult.tickets.length > 0 && (
                      <motion.button
                        onClick={handleDownloadAllTickets}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.04] text-white/60 hover:bg-white/[0.08] hover:text-white/80 transition-colors text-sm font-medium"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Download size={14} />
                        Download All PDFs
                      </motion.button>
                    )}
                    <motion.button
                      onClick={handleClose}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium bg-[#C1FF72] text-black shadow-[0_0_20px_rgba(193,255,114,0.3)]"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Done
                    </motion.button>
                  </>
                )}

                {importState === "uploading" && (
                  <div className="w-full text-center text-white/40 text-sm">
                    Please wait...
                  </div>
                )}

                {importState === "error" && (
                  <button
                    onClick={handleClose}
                    className="w-full px-4 py-2 rounded-lg text-white/50 hover:text-white/70 hover:bg-white/[0.04] transition-colors text-sm font-medium"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
