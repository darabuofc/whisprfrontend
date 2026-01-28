"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  Save,
  Plus,
  Trash2,
  Loader2,
  Check,
  AlertCircle,
  GripVertical,
  Users,
  Heart,
  User,
} from "lucide-react";
import { api, addPassTypes } from "@/lib/api";

interface PassTypesTabProps {
  eventId: string;
}

interface Pass {
  id?: string;
  type: string;
  price: number;
  quantity: number;
  isNew?: boolean;
}

// Pass type icons
const passTypeIcons: { [key: string]: React.ReactNode } = {
  Group: <Users size={18} />,
  Couple: <Heart size={18} />,
  "Single male": <User size={18} />,
  "Single Female": <User size={18} />,
};

// Pass type descriptions
const passTypeDescriptions: { [key: string]: string } = {
  Group: "Perfect for friend groups of 3 or more",
  Couple: "For pairs attending together",
  "Single male": "Individual entry for men",
  "Single Female": "Individual entry for women",
};

const allPassTypes = ["Group", "Couple", "Single male", "Single Female"];

export default function PassTypesTab({ eventId }: PassTypesTabProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [passes, setPasses] = useState<Pass[]>([]);
  const [originalPasses, setOriginalPasses] = useState<Pass[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch existing passes
  useEffect(() => {
    async function fetchPasses() {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/events/${eventId}/passes`);
        const existingPasses = (res.data.passes ?? []).map((p: any) => ({
          id: p.id,
          type: p.type,
          price: p.price,
          quantity: p.quantity ?? 1000,
        }));

        setPasses(existingPasses);
        setOriginalPasses(existingPasses);
      } catch (err: any) {
        console.error("Failed to fetch passes:", err);
        setError(err.message || "Failed to load pass types");
      } finally {
        setLoading(false);
      }
    }

    if (eventId) {
      fetchPasses();
    }
  }, [eventId]);

  // Track changes
  useEffect(() => {
    const changed = JSON.stringify(passes) !== JSON.stringify(originalPasses);
    setHasChanges(changed);
  }, [passes, originalPasses]);

  const selectedTypes = passes.map((p) => p.type);
  const availableTypesForNew = allPassTypes.filter((t) => !selectedTypes.includes(t));

  const addPass = () => {
    if (passes.length < 4 && availableTypesForNew.length > 0) {
      setPasses([
        ...passes,
        { type: "", price: 0, quantity: 1000, isNew: true },
      ]);
    }
  };

  const removePass = (index: number) => {
    if (passes.length > 1) {
      setPasses(passes.filter((_, i) => i !== index));
    }
  };

  const updatePass = (index: number, field: keyof Pass, value: any) => {
    const newPasses = [...passes];
    newPasses[index] = { ...newPasses[index], [field]: value };
    setPasses(newPasses);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      // Validate passes
      const validPasses = passes.filter((p) => p.type && p.price > 0);
      if (validPasses.length === 0) {
        setError("Please add at least one pass type with a price");
        return;
      }

      // Check for incomplete passes
      const incompletePasses = passes.filter((p) => (p.type && p.price <= 0) || (!p.type && p.price > 0));
      if (incompletePasses.length > 0) {
        setError("Please complete all pass types or remove empty ones");
        return;
      }

      // Save passes
      await addPassTypes(eventId, {
        passes: validPasses.map((p) => ({
          type: p.type,
          price: p.price,
          quantity: p.quantity,
        })),
      });

      // Refresh passes from server
      const res = await api.get(`/events/${eventId}/passes`);
      const updatedPasses = (res.data.passes ?? []).map((p: any) => ({
        id: p.id,
        type: p.type,
        price: p.price,
        quantity: p.quantity ?? 1000,
      }));

      setPasses(updatedPasses);
      setOriginalPasses(updatedPasses);
      setSuccess(true);
      setHasChanges(false);

      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error("Failed to save passes:", err);
      setError(err.message || "Failed to save pass types");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setPasses([...originalPasses]);
    setError(null);
  };

  if (loading) {
    return (
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-12">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
          <p className="text-white/40 text-sm">Loading pass types...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Pass Types</h3>
          <p className="text-sm text-white/40 mt-1">
            Configure ticket types and pricing for your event
          </p>
        </div>
        <div className="flex items-center gap-3">
          <AnimatePresence>
            {hasChanges && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] text-white/60
                         hover:bg-white/[0.08] hover:text-white/80 transition-all duration-200"
              >
                <span className="text-sm font-medium">Reset</span>
              </motion.button>
            )}
          </AnimatePresence>
          <motion.button
            whileHover={{ scale: hasChanges ? 1.02 : 1 }}
            whileTap={{ scale: hasChanges ? 0.98 : 1 }}
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-300
              ${
                hasChanges
                  ? "bg-[#C1FF72] text-black shadow-[0_0_20px_rgba(193,255,114,0.3)] hover:shadow-[0_0_30px_rgba(193,255,114,0.4)]"
                  : "bg-white/[0.05] text-white/30 cursor-not-allowed"
              }`}
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            <span className="text-sm">{saving ? "Saving..." : "Save Changes"}</span>
          </motion.button>
        </div>
      </div>

      {/* Status messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20"
          >
            <AlertCircle size={18} className="text-red-400" />
            <p className="text-sm text-red-300">{error}</p>
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
          >
            <Check size={18} className="text-emerald-400" />
            <p className="text-sm text-emerald-300">Pass types saved successfully!</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info card */}
      <div className="p-4 rounded-xl bg-[#C1FF72]/10 border border-[#C1FF72]/20">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#C1FF72]/20 flex items-center justify-center flex-shrink-0">
            <Users size={16} className="text-[#C1FF72]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#C1FF72]">Manage your passes</p>
            <p className="text-xs text-white/50 mt-1">
              Configure up to 4 different ticket types with custom pricing. Each pass type can only be used once.
            </p>
          </div>
        </div>
      </div>

      {/* Pass Cards */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {passes.map((pass, index) => (
            <motion.div
              key={pass.id || `new-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              transition={{ duration: 0.2 }}
              className="relative bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 hover:bg-white/[0.04] transition-all duration-300"
            >
              {/* Remove button */}
              {passes.length > 1 && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => removePass(index)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center
                           text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 size={16} />
                </motion.button>
              )}

              <div className="space-y-5">
                {/* Pass Type Selection */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-white/60">Pass Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {allPassTypes
                      .filter((type) => type === pass.type || !selectedTypes.includes(type))
                      .map((type) => (
                        <motion.button
                          key={type}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => updatePass(index, "type", type)}
                          className={`p-3 rounded-xl border transition-all duration-300 text-left ${
                            pass.type === type
                              ? "bg-[#C1FF72]/20 border-[#C1FF72]/50 text-white"
                              : "bg-white/[0.02] border-white/[0.06] text-white/70 hover:bg-white/[0.05]"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={pass.type === type ? "text-[#C1FF72]" : "text-white/40"}
                            >
                              {passTypeIcons[type]}
                            </span>
                            <span className="font-medium text-sm">{type}</span>
                          </div>
                          <p className="text-xs text-white/40">{passTypeDescriptions[type]}</p>
                        </motion.button>
                      ))}
                  </div>
                </div>

                {/* Price Input */}
                {pass.type && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-2"
                  >
                    <label className="block text-sm font-medium text-white/60">Price</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 text-sm font-medium">
                        PKR
                      </span>
                      <input
                        type="number"
                        placeholder="0"
                        min="0"
                        value={pass.price || ""}
                        onChange={(e) =>
                          updatePass(index, "price", parseFloat(e.target.value) || 0)
                        }
                        className="w-full pl-14 pr-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white
                                 placeholder:text-white/30 outline-none transition-all duration-300
                                 focus:bg-white/[0.08] focus:border-[#C1FF72]/50 focus:shadow-[0_0_0_3px_rgba(193,255,114,0.1)]"
                      />
                    </div>
                    <p className="text-xs text-white/40 pl-1">
                      Set the price attendees will pay for this pass
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add Pass Button */}
        {passes.length < 4 && availableTypesForNew.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={addPass}
            className="w-full py-4 rounded-xl border-2 border-dashed border-white/[0.1] text-white/50
                     hover:border-[#C1FF72]/30 hover:text-[#C1FF72] transition-all duration-300
                     flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            <span className="text-sm font-medium">Add another pass type</span>
          </motion.button>
        )}
      </div>

      {/* Unsaved changes indicator */}
      <AnimatePresence>
        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-500/10 border border-amber-500/20"
          >
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <p className="text-sm text-amber-300/80">You have unsaved changes</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
