"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Step = 1 | 2 | 3 | 4 | 5;
type PassOption = "single_male" | "single_female" | "couples" | "groups";

export default function LaunchEventPage() {
  const [step, setStep] = useState<Step>(1);

  // form state
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [thumbnail, setThumbnail] = useState("");

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [venue, setVenue] = useState("");

  const [selectedPasses, setSelectedPasses] = useState<PassOption[]>([]);
  const [quantities, setQuantities] = useState<Record<PassOption, number | "">>({
    single_male: "",
    single_female: "",
    couples: "",
    groups: "",
  });

  const [errors, setErrors] = useState<string[]>([]);

  const togglePass = (opt: PassOption) => {
    setSelectedPasses((prev) =>
      prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]
    );
  };

  const handleQuantityChange = (opt: PassOption, val: string) => {
    setQuantities((prev) => ({
      ...prev,
      [opt]: val === "" ? "" : parseInt(val),
    }));
  };

  const validateStep = (): boolean => {
    let stepErrors: string[] = [];
    if (step === 1) {
      if (!title.trim()) stepErrors.push("title");
      if (!tagline.trim()) stepErrors.push("tagline");
      if (!thumbnail.trim()) stepErrors.push("thumbnail");
    }
    if (step === 2) {
      if (!date) stepErrors.push("date");
      if (!time) stepErrors.push("time");
      if (!venue.trim()) stepErrors.push("venue");
    }
    setErrors(stepErrors);
    return stepErrors.length === 0;
  };

  const next = () => {
    if (validateStep()) setStep((s) => ((s + 1) as Step));
  };
  const back = () => step > 1 && setStep((s) => ((s - 1) as Step));

  return (
    <div className="max-w-xl mx-auto mt-10 px-4">
      {/* Title */}
      <h1 className="text-3xl font-extrabold text-center bg-gradient-to-r from-accent-blue to-violet-400 bg-clip-text text-transparent mb-8">
        Launch Your Event 🚀
      </h1>

      {/* Stepper */}
      <div className="flex justify-between items-center mb-8">
        {[1, 2, 3, 4, 5].map((n) => (
          <div
            key={n}
            className={`h-2 flex-1 mx-1 rounded-full transition-all duration-300 ${
              step >= n
                ? "bg-gradient-to-r from-accent-blue to-violet-400 shadow-[0_0_10px_rgba(56,189,248,0.6)]"
                : "bg-gray-700"
            }`}
          />
        ))}
      </div>

      {/* Step Content */}
      <div className="relative min-h-[350px]">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" {...anim} className="glass-card">
              <h2 className="step-title">Event Basics</h2>
              <div className="form-group">
                <input
                  id="title"
                  className={`input-modern ${errors.includes("title") ? "input-error" : ""}`}
                  placeholder=" "
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <label htmlFor="title" className="label-modern">
                  Event Title
                </label>
              </div>
              <div className="form-group">
                <input
                  id="tagline"
                  className={`input-modern ${errors.includes("tagline") ? "input-error" : ""}`}
                  placeholder=" "
                  required
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                />
                <label htmlFor="tagline" className="label-modern">
                  Tagline
                </label>
              </div>
              <div className="form-group">
                <input
                  id="thumb"
                  className={`input-modern ${errors.includes("thumbnail") ? "input-error" : ""}`}
                  placeholder=" "
                  required
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                />
                <label htmlFor="thumb" className="label-modern">
                  Thumbnail URL
                </label>
              </div>

              {/* Live Preview */}
              {(title || tagline || thumbnail) && (
                <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  {thumbnail && (
                    <img
                      src={thumbnail}
                      alt="Preview"
                      className="rounded-lg mb-2 max-h-40 object-cover w-full"
                    />
                  )}
                  <h3 className="text-lg font-bold text-white">{title || "Event Title"}</h3>
                  <p className="text-sm text-gray-300">{tagline || "Your tagline here"}</p>
                </div>
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" {...anim} className="glass-card">
              <h2 className="step-title">When & Where</h2>
              <div className="form-group">
                <input
                  id="date"
                  type="date"
                  className={`input-modern ${errors.includes("date") ? "input-error" : ""}`}
                  placeholder=" "
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
                <label htmlFor="date" className="label-modern">
                  Date
                </label>
              </div>
              <div className="form-group">
                <input
                  id="time"
                  type="time"
                  className={`input-modern ${errors.includes("time") ? "input-error" : ""}`}
                  placeholder=" "
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
                <label htmlFor="time" className="label-modern">
                  Time
                </label>
              </div>
              <div className="form-group">
                <input
                  id="venue"
                  className={`input-modern ${errors.includes("venue") ? "input-error" : ""}`}
                  placeholder=" "
                  required
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                />
                <label htmlFor="venue" className="label-modern">
                  Venue
                </label>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" {...anim} className="glass-card">
              <h2 className="step-title">Pass Types</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: "single_male", label: "Single Male" },
                  { key: "single_female", label: "Single Female" },
                  { key: "couples", label: "Couples" },
                  { key: "groups", label: "Groups" },
                ].map(({ key, label }) => {
                  const isActive = selectedPasses.includes(key as PassOption);
                  return (
                    <div
                      key={key}
                      onClick={() => togglePass(key as PassOption)}
                      className={`cursor-pointer rounded-xl p-4 text-center transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-accent-blue to-violet-500 text-black shadow-lg"
                          : "bg-white/5 text-gray-300 hover:bg-white/10"
                      }`}
                    >
                      <p className="font-medium">{label}</p>
                      {isActive && (
                        <input
                          type="number"
                          placeholder="Qty (blank = ∞)"
                          className="mt-3 w-full input-modern text-sm"
                          value={quantities[key as PassOption] ?? ""}
                          onChange={(e) =>
                            handleQuantityChange(key as PassOption, e.target.value)
                          }
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="s4" {...anim} className="glass-card">
              <h2 className="step-title">Pricing Tiers</h2>
              <div className="form-group">
                <input className="input-modern" placeholder=" " required />
                <label className="label-modern">Tier Name</label>
              </div>
              <div className="form-group">
                <input type="number" className="input-modern" placeholder=" " required />
                <label className="label-modern">Price</label>
              </div>
              <div className="form-group">
                <input type="number" className="input-modern" placeholder=" " required />
                <label className="label-modern">Quantity</label>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="s5" {...anim} className="glass-card text-center">
              <h2 className="step-title">Review & Publish</h2>
              <p className="text-gray-300 text-sm mb-4">
                Summary will be shown here before publishing.
              </p>
              <button className="btn-primary w-full py-3 text-lg font-semibold">
                Publish Event 🚀
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        {step > 1 ? (
          <button className="btn-nav" onClick={back}>
            Back
          </button>
        ) : (
          <span />
        )}
        {step < 5 && (
          <button className="btn-nav" onClick={next}>
            Next
          </button>
        )}
      </div>
    </div>
  );
}

const anim = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -40 },
  transition: { duration: 0.4 },
};
