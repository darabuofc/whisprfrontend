"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, RotateCcw, Calendar, MapPin, Image, Loader2, Check, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";

interface GeneralSettingsTabProps {
  eventId: string;
}

interface EventSettings {
  name: string;
  description: string;
  date: string;
  location: string;
  time: string;
  cover: string | null;
}

export default function GeneralSettingsTab({ eventId }: GeneralSettingsTabProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [originalSettings, setOriginalSettings] = useState<EventSettings>({
    name: "",
    description: "",
    date: "",
    location: "",
    time: "",
    cover: null,
  });

  const [settings, setSettings] = useState<EventSettings>({
    name: "",
    description: "",
    date: "",
    location: "",
    time: "",
    cover: null,
  });

  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch event details
  useEffect(() => {
    async function fetchEventDetails() {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/organizers/events/${eventId}`);
        const event = res.data.event;
        const fields = event.fields ?? {};

        const eventSettings: EventSettings = {
          name: fields.Name ?? "",
          description: fields.Description ?? "",
          date: fields.Date ?? "",
          location: fields.Location ?? "",
          time: fields.Time ?? "",
          cover: Array.isArray(fields.Cover) && fields.Cover.length > 0
            ? fields.Cover[0]?.url ?? null
            : null,
        };

        setSettings(eventSettings);
        setOriginalSettings(eventSettings);
        setBannerPreview(eventSettings.cover);
      } catch (err: any) {
        console.error("Failed to fetch event details:", err);
        setError(err.message || "Failed to load event settings");
      } finally {
        setLoading(false);
      }
    }

    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId]);

  // Track changes
  useEffect(() => {
    const changed =
      settings.name !== originalSettings.name ||
      settings.description !== originalSettings.description ||
      settings.date !== originalSettings.date ||
      settings.location !== originalSettings.location ||
      settings.time !== originalSettings.time ||
      bannerFile !== null;

    setHasChanges(changed);
  }, [settings, originalSettings, bannerFile]);

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const formData = new FormData();
      formData.append("name", settings.name);
      formData.append("description", settings.description);
      formData.append("date", settings.date);
      formData.append("location", settings.location);
      if (settings.time) {
        formData.append("time", settings.time);
      }
      if (bannerFile) {
        formData.append("banner", bannerFile);
      }

      await api.post(`/organizers/events/${eventId}/update`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Update original settings after successful save
      setOriginalSettings({ ...settings });
      setBannerFile(null);
      setSuccess(true);
      setHasChanges(false);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error("Failed to save settings:", err);
      setError(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings({ ...originalSettings });
    setBannerFile(null);
    setBannerPreview(originalSettings.cover);
    setError(null);
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-12">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
          <p className="text-white/40 text-sm">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">General Settings</h3>
          <p className="text-sm text-white/40 mt-1">
            Update your event details and configuration
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
                <RotateCcw size={16} />
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
            <p className="text-sm text-emerald-300">Settings saved successfully!</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Form */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 space-y-6">
        {/* Event Name */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white/60">Event Name</label>
          <input
            type="text"
            value={settings.name}
            onChange={(e) => setSettings({ ...settings, name: e.target.value })}
            placeholder="Enter event name"
            className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white
                     placeholder:text-white/30 outline-none transition-all duration-300
                     focus:bg-white/[0.08] focus:border-[#C1FF72]/50 focus:shadow-[0_0_0_3px_rgba(193,255,114,0.1)]"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white/60">Description</label>
          <textarea
            value={settings.description}
            onChange={(e) => setSettings({ ...settings, description: e.target.value })}
            placeholder="Describe your event..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white
                     placeholder:text-white/30 outline-none transition-all duration-300 resize-none
                     focus:bg-white/[0.08] focus:border-[#C1FF72]/50 focus:shadow-[0_0_0_3px_rgba(193,255,114,0.1)]"
          />
        </div>

        {/* Date and Time Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Date */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white/60">Event Date</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="date"
                value={settings.date}
                onChange={(e) => setSettings({ ...settings, date: e.target.value })}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white
                         outline-none transition-all duration-300 cursor-pointer
                         focus:bg-white/[0.08] focus:border-[#C1FF72]/50 focus:shadow-[0_0_0_3px_rgba(193,255,114,0.1)]
                         [color-scheme:dark]"
              />
            </div>
            {settings.date && (
              <p className="text-xs text-white/40 pl-1">{formatDisplayDate(settings.date)}</p>
            )}
          </div>

          {/* Time */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white/60">Event Time</label>
            <input
              type="time"
              value={settings.time}
              onChange={(e) => setSettings({ ...settings, time: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white
                       outline-none transition-all duration-300 cursor-pointer
                       focus:bg-white/[0.08] focus:border-[#C1FF72]/50 focus:shadow-[0_0_0_3px_rgba(193,255,114,0.1)]
                       [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white/60">Venue / Location</label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              value={settings.location}
              onChange={(e) => setSettings({ ...settings, location: e.target.value })}
              placeholder="Enter venue name and city"
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white
                       placeholder:text-white/30 outline-none transition-all duration-300
                       focus:bg-white/[0.08] focus:border-[#C1FF72]/50 focus:shadow-[0_0_0_3px_rgba(193,255,114,0.1)]"
            />
          </div>
        </div>

        {/* Event Banner */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white/60">Event Banner</label>
          <motion.div
            onClick={() => fileInputRef.current?.click()}
            whileHover={{ scale: 1.005 }}
            className="relative w-full aspect-[21/9] rounded-xl cursor-pointer group overflow-hidden"
          >
            {bannerPreview ? (
              <>
                <img
                  src={bannerPreview}
                  alt="Event banner"
                  className="w-full h-full object-cover rounded-xl"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm">
                    <Image size={18} className="text-white" />
                    <span className="text-white text-sm font-medium">Change image</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full rounded-xl bg-white/[0.03] border-2 border-dashed border-white/[0.1]
                            flex flex-col items-center justify-center gap-3 transition-all duration-300
                            group-hover:border-[#C1FF72]/30 group-hover:bg-white/[0.05]">
                <div className="w-12 h-12 rounded-xl bg-white/[0.05] flex items-center justify-center">
                  <Image size={24} className="text-white/40" />
                </div>
                <div className="text-center">
                  <p className="text-white/60 text-sm font-medium">Click to upload banner</p>
                  <p className="text-white/30 text-xs mt-1">Recommended: 1920x820px (21:9)</p>
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleBannerChange}
              className="hidden"
            />
          </motion.div>
          <p className="text-xs text-white/30 pl-1">
            This banner will be displayed on your event page and promotional materials
          </p>
        </div>
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
