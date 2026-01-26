"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Percent,
  DollarSign,
  Loader2,
  Tag,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Copy,
  Check,
  X,
  AlertCircle,
} from "lucide-react";
import {
  listDiscountCodes,
  createDiscountCode,
  updateDiscountCode,
  deactivateDiscountCode,
  type DiscountCode,
  type DiscountCodeCreate,
} from "@/lib/api";

interface DiscountCodesTabProps {
  eventId: string;
}

export default function DiscountCodesTab({ eventId }: DiscountCodesTabProps) {
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<DiscountCodeCreate>({
    code: "",
    type: "percent",
    amount: 10,
    active: true,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchCodes = useCallback(async () => {
    try {
      setError(null);
      const data = await listDiscountCodes(eventId);
      setCodes(data);
    } catch (err: any) {
      setError(err.message || "Failed to load discount codes");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchCodes();
  }, [fetchCodes]);

  const resetForm = () => {
    setFormData({ code: "", type: "percent", amount: 10, active: true });
    setFormError(null);
    setShowCreate(false);
    setEditingId(null);
  };

  const handleCreate = async () => {
    if (!formData.code.trim()) {
      setFormError("Code is required");
      return;
    }
    if (formData.amount <= 0) {
      setFormError("Amount must be greater than 0");
      return;
    }
    if (formData.type === "percent" && formData.amount > 100) {
      setFormError("Percentage cannot exceed 100%");
      return;
    }

    setFormLoading(true);
    setFormError(null);

    try {
      await createDiscountCode(eventId, {
        ...formData,
        code: formData.code.toUpperCase().trim(),
      });
      resetForm();
      fetchCodes();
    } catch (err: any) {
      setFormError(err.message || "Failed to create discount code");
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!formData.code.trim()) {
      setFormError("Code is required");
      return;
    }
    if (formData.amount <= 0) {
      setFormError("Amount must be greater than 0");
      return;
    }
    if (formData.type === "percent" && formData.amount > 100) {
      setFormError("Percentage cannot exceed 100%");
      return;
    }

    setFormLoading(true);
    setFormError(null);

    try {
      await updateDiscountCode(eventId, id, {
        ...formData,
        code: formData.code.toUpperCase().trim(),
      });
      resetForm();
      fetchCodes();
    } catch (err: any) {
      setFormError(err.message || "Failed to update discount code");
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleActive = async (code: DiscountCode) => {
    setActionLoading(code.id);
    try {
      await updateDiscountCode(eventId, code.id, { active: !code.active });
      fetchCodes();
    } catch (err: any) {
      setError(err.message || "Failed to update discount code");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeactivate = async (id: string) => {
    setActionLoading(id);
    try {
      await deactivateDiscountCode(eventId, id);
      fetchCodes();
    } catch (err: any) {
      setError(err.message || "Failed to deactivate discount code");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const startEdit = (code: DiscountCode) => {
    setFormData({
      code: code.code,
      type: code.type,
      amount: code.amount,
      active: code.active,
    });
    setEditingId(code.id);
    setShowCreate(false);
    setFormError(null);
  };

  const formatDiscount = (code: DiscountCode) => {
    if (code.type === "percent") {
      return `${code.amount}%`;
    }
    return `PKR ${code.amount.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-white/90">Discount Codes</h2>
          <p className="text-sm text-white/40 mt-1">
            Create promotional codes for your event
          </p>
        </div>
        {!showCreate && !editingId && (
          <button
            onClick={() => {
              setShowCreate(true);
              setFormData({ code: "", type: "percent", amount: 10, active: true });
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] hover:border-white/[0.15] rounded-xl text-sm font-medium text-white/80 transition-all"
          >
            <Plus size={16} />
            New Code
          </button>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-400/60 hover:text-red-400"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Create/Edit Form */}
      {(showCreate || editingId) && (
        <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/[0.06]">
            <h3 className="text-base font-medium text-white/90">
              {editingId ? "Edit Discount Code" : "Create Discount Code"}
            </h3>
          </div>
          <div className="p-6 space-y-5">
            {/* Code input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60">Code</label>
              <div className="relative">
                <Tag
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                />
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  placeholder="WELCOME10"
                  className="w-full pl-11 pr-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder-white/30 text-sm font-mono tracking-wide focus:outline-none focus:border-white/20 transition-colors"
                />
              </div>
            </div>

            {/* Type & Amount */}
            <div className="grid grid-cols-2 gap-4">
              {/* Type selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/60">Type</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "percent" })}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                      formData.type === "percent"
                        ? "bg-white/[0.08] border-white/20 text-white"
                        : "bg-white/[0.02] border-white/[0.06] text-white/40 hover:text-white/60"
                    }`}
                  >
                    <Percent size={16} />
                    Percent
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "fixed" })}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                      formData.type === "fixed"
                        ? "bg-white/[0.08] border-white/20 text-white"
                        : "bg-white/[0.02] border-white/[0.06] text-white/40 hover:text-white/60"
                    }`}
                  >
                    <DollarSign size={16} />
                    Fixed
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/60">
                  {formData.type === "percent" ? "Percentage" : "Amount (PKR)"}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-sm">
                    {formData.type === "percent" ? "%" : "PKR"}
                  </span>
                  <input
                    type="number"
                    min="1"
                    max={formData.type === "percent" ? 100 : undefined}
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })
                    }
                    className="w-full pl-14 pr-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:border-white/20 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Active toggle */}
            <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/[0.04]">
              <div>
                <p className="text-sm font-medium text-white/80">Active</p>
                <p className="text-xs text-white/40 mt-0.5">
                  Code can be used when active
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, active: !formData.active })}
                className="relative"
              >
                {formData.active ? (
                  <ToggleRight size={36} className="text-emerald-400" />
                ) : (
                  <ToggleLeft size={36} className="text-white/30" />
                )}
              </button>
            </div>

            {/* Form error */}
            {formError && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertCircle size={16} className="text-red-400" />
                <p className="text-sm text-red-400">{formError}</p>
              </div>
            )}

            {/* Form actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={resetForm}
                className="flex-1 px-4 py-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl text-sm font-medium text-white/60 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => (editingId ? handleUpdate(editingId) : handleCreate())}
                disabled={formLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white text-black rounded-xl text-sm font-semibold hover:bg-white/90 transition-all disabled:opacity-50"
              >
                {formLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {editingId ? "Saving..." : "Creating..."}
                  </>
                ) : editingId ? (
                  "Save Changes"
                ) : (
                  "Create Code"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Codes list */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-4">
            <Loader2 size={24} className="text-white/40 animate-spin" />
            <p className="text-sm text-white/40">Loading discount codes...</p>
          </div>
        ) : codes.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.04] flex items-center justify-center">
              <Tag size={24} className="text-white/20" />
            </div>
            <div className="text-center">
              <p className="text-white/60 font-medium">No discount codes yet</p>
              <p className="text-sm text-white/30 mt-1">
                Create your first code to offer discounts
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {codes.map((code) => (
              <div
                key={code.id}
                className={`p-5 transition-colors ${
                  editingId === code.id ? "bg-white/[0.04]" : "hover:bg-white/[0.02]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Code icon */}
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                        code.active
                          ? "bg-emerald-500/10 border-emerald-500/20"
                          : "bg-white/[0.04] border-white/[0.06]"
                      }`}
                    >
                      {code.type === "percent" ? (
                        <Percent
                          size={20}
                          className={code.active ? "text-emerald-400" : "text-white/30"}
                        />
                      ) : (
                        <DollarSign
                          size={20}
                          className={code.active ? "text-emerald-400" : "text-white/30"}
                        />
                      )}
                    </div>

                    {/* Code details */}
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-base font-semibold text-white tracking-wide">
                          {code.code}
                        </span>
                        <button
                          onClick={() => handleCopy(code.code, code.id)}
                          className="p-1.5 rounded-lg hover:bg-white/[0.08] transition-colors"
                          title="Copy code"
                        >
                          {copiedId === code.id ? (
                            <Check size={14} className="text-emerald-400" />
                          ) : (
                            <Copy size={14} className="text-white/40" />
                          )}
                        </button>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-white/50">
                          {formatDiscount(code)} off
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                            code.active
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-white/[0.04] text-white/40"
                          }`}
                        >
                          {code.active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {/* Toggle active */}
                    <button
                      onClick={() => handleToggleActive(code)}
                      disabled={actionLoading === code.id}
                      className={`p-2.5 rounded-xl border transition-all ${
                        code.active
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                          : "bg-white/[0.04] border-white/[0.06] text-white/40 hover:text-white/60 hover:bg-white/[0.08]"
                      }`}
                      title={code.active ? "Deactivate" : "Activate"}
                    >
                      {actionLoading === code.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : code.active ? (
                        <ToggleRight size={16} />
                      ) : (
                        <ToggleLeft size={16} />
                      )}
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => startEdit(code)}
                      className="px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm font-medium text-white/60 hover:text-white hover:bg-white/[0.08] transition-all"
                    >
                      Edit
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDeactivate(code.id)}
                      disabled={actionLoading === code.id}
                      className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50"
                      title="Delete"
                    >
                      {actionLoading === code.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tips section */}
      {codes.length > 0 && (
        <div className="p-5 bg-white/[0.02] border border-white/[0.04] rounded-xl">
          <p className="text-xs text-white/40 leading-relaxed">
            <span className="text-white/60 font-medium">Tip:</span> Share discount codes
            on social media or with specific attendees. Codes are case-insensitive and
            apply at checkout.
          </p>
        </div>
      )}
    </div>
  );
}
