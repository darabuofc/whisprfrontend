"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

interface Pass {
  type: string;
  price: number;
  quantity: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

async function postWithAuth(url: string, data: any = {}, isFormData = false) {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("whispr_token") || localStorage.getItem("token")
      : null;
  if (!token) throw new Error("No JWT token found");

  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  if (isFormData) {
    headers["Content-Type"] = "multipart/form-data";
  }

  return axios.post(`${API_BASE}${url}`, data, { headers });
}

// Step icons
const SparkleIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);

const TicketIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
  </svg>
);

const RocketIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
  </svg>
);

// Confetti component
const Confetti = ({ active }: { active: boolean }) => {
  const colors = ['#C1FF72', '#B472FF', '#72D4FF', '#FF72B4', '#FFD472'];
  const particles = Array.from({ length: 50 });

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 rounded-full"
          style={{
            backgroundColor: colors[i % colors.length],
            left: `${Math.random() * 100}%`,
            top: -20,
          }}
          initial={{ y: -20, rotate: 0, opacity: 1 }}
          animate={{
            y: typeof window !== 'undefined' ? window.innerHeight + 100 : 1000,
            rotate: Math.random() * 720 - 360,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 2.5 + Math.random() * 2,
            delay: Math.random() * 0.5,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        />
      ))}
    </div>
  );
};

// Floating orb background
const FloatingOrbs = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none">
    <motion.div
      className="absolute w-[800px] h-[800px] rounded-full"
      style={{
        background: 'radial-gradient(circle, rgba(193,255,114,0.15) 0%, transparent 70%)',
        left: '-20%',
        top: '-20%',
      }}
      animate={{
        x: [0, 100, 0],
        y: [0, 50, 0],
        scale: [1, 1.1, 1],
      }}
      transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute w-[600px] h-[600px] rounded-full"
      style={{
        background: 'radial-gradient(circle, rgba(180,114,255,0.12) 0%, transparent 70%)',
        right: '-15%',
        bottom: '-15%',
      }}
      animate={{
        x: [0, -80, 0],
        y: [0, -60, 0],
        scale: [1, 1.15, 1],
      }}
      transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute w-[400px] h-[400px] rounded-full"
      style={{
        background: 'radial-gradient(circle, rgba(114,212,255,0.08) 0%, transparent 70%)',
        left: '40%',
        top: '30%',
      }}
      animate={{
        x: [0, 60, 0],
        y: [0, -40, 0],
        scale: [1, 1.2, 1],
      }}
      transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
    />
  </div>
);

// Step indicator
const StepIndicator = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => (
  <div className="flex items-center gap-2">
    {Array.from({ length: totalSteps }).map((_, i) => (
      <motion.div
        key={i}
        className={`rounded-full transition-colors duration-300 ${
          i + 1 === currentStep
            ? 'bg-[#C1FF72] w-8 h-2'
            : i + 1 < currentStep
            ? 'bg-[#C1FF72]/60 w-2 h-2'
            : 'bg-white/20 w-2 h-2'
        }`}
        layoutId={`step-${i}`}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    ))}
  </div>
);

// Beautiful input component
const OnboardingInput = ({
  label,
  helper,
  ...props
}: { label?: string; helper?: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className="space-y-2">
    {label && <label className="block text-sm font-medium text-white/60">{label}</label>}
    <input
      {...props}
      className="w-full px-5 py-4 rounded-2xl bg-white/[0.07] border border-white/[0.08] text-white text-lg
                 placeholder:text-white/30 outline-none transition-all duration-300
                 focus:bg-white/[0.1] focus:border-[#C1FF72]/50 focus:shadow-[0_0_0_4px_rgba(193,255,114,0.1)]
                 hover:bg-white/[0.09]"
    />
    {helper && <p className="text-sm text-white/40 pl-1">{helper}</p>}
  </div>
);

// Beautiful textarea component
const OnboardingTextarea = ({
  label,
  helper,
  ...props
}: { label?: string; helper?: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <div className="space-y-2">
    {label && <label className="block text-sm font-medium text-white/60">{label}</label>}
    <textarea
      {...props}
      className="w-full px-5 py-4 rounded-2xl bg-white/[0.07] border border-white/[0.08] text-white text-lg
                 placeholder:text-white/30 outline-none transition-all duration-300 resize-none
                 focus:bg-white/[0.1] focus:border-[#C1FF72]/50 focus:shadow-[0_0_0_4px_rgba(193,255,114,0.1)]
                 hover:bg-white/[0.09]"
    />
    {helper && <p className="text-sm text-white/40 pl-1">{helper}</p>}
  </div>
);

// Beautiful select component
const OnboardingSelect = ({
  label,
  helper,
  options,
  ...props
}: { label?: string; helper?: string; options: { value: string; label: string }[] } & React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <div className="space-y-2">
    {label && <label className="block text-sm font-medium text-white/60">{label}</label>}
    <select
      {...props}
      className="w-full px-5 py-4 rounded-2xl bg-white/[0.07] border border-white/[0.08] text-white text-lg
                 outline-none transition-all duration-300 cursor-pointer appearance-none
                 focus:bg-white/[0.1] focus:border-[#C1FF72]/50 focus:shadow-[0_0_0_4px_rgba(193,255,114,0.1)]
                 hover:bg-white/[0.09]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 1rem center',
        backgroundSize: '1.5rem',
      }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-[#0a0a0a] text-white">
          {opt.label}
        </option>
      ))}
    </select>
    {helper && <p className="text-sm text-white/40 pl-1">{helper}</p>}
  </div>
);

// Primary button with glow
const PrimaryButton = ({
  children,
  disabled,
  loading,
  onClick,
  variant = "primary",
  className = "",
}: {
  children?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  className?: string;
}) => (
  <motion.button
    whileHover={{ scale: disabled ? 1 : 1.02 }}
    whileTap={{ scale: disabled ? 1 : 0.98 }}
    disabled={disabled || loading}
    onClick={onClick}
    className={`py-4 px-8 rounded-2xl text-lg font-semibold transition-all duration-300
               ${variant === "secondary"
                 ? "bg-white/10 text-white/70 hover:bg-white/15"
                 : disabled || loading
                   ? 'bg-white/10 text-white/40 cursor-not-allowed'
                   : 'bg-[#C1FF72] text-black shadow-[0_0_40px_rgba(193,255,114,0.3)] hover:shadow-[0_0_60px_rgba(193,255,114,0.4)]'
               } ${className}`}
  >
    {loading ? (
      <motion.div
        className="w-6 h-6 mx-auto border-2 border-black/30 border-t-black rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    ) : children}
  </motion.button>
);

// Pass type icons
const passTypeIcons: { [key: string]: React.ReactNode } = {
  "Group": (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </svg>
  ),
  "Couple": (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  ),
  "Single Male": (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  ),
  "Single Female": (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  ),
};

// Pass type descriptions
const passTypeDescriptions: { [key: string]: string } = {
  "Group": "Perfect for friend groups of 3 or more",
  "Couple": "For pairs attending together",
  "Single Male": "Individual entry for men",
  "Single Female": "Individual entry for women",
};

// Pass card component
const PassCard = ({
  pass,
  index,
  availableTypes,
  onUpdate,
  onRemove,
  canRemove,
}: {
  pass: Pass;
  index: number;
  availableTypes: string[];
  onUpdate: (field: keyof Pass, value: any) => void;
  onRemove: () => void;
  canRemove: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20, height: 0 }}
    transition={{ duration: 0.3 }}
    className="relative p-5 rounded-2xl bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.07] transition-all duration-300"
  >
    {canRemove && (
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onRemove}
        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/30 transition-colors"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </motion.button>
    )}

    <div className="space-y-4">
      {/* Pass Type Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white/60">Pass Type</label>
        <div className="grid grid-cols-2 gap-2">
          {availableTypes.map((type) => (
            <motion.button
              key={type}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onUpdate("type", type)}
              className={`p-3 rounded-xl border transition-all duration-300 text-left ${
                pass.type === type
                  ? "bg-[#C1FF72]/20 border-[#C1FF72]/50 text-white"
                  : "bg-white/[0.03] border-white/[0.08] text-white/70 hover:bg-white/[0.07]"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={pass.type === type ? "text-[#C1FF72]" : "text-white/50"}>
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
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 text-lg">PKR</span>
            <input
              type="number"
              placeholder="0"
              value={pass.price || ""}
              onChange={(e) => onUpdate("price", parseFloat(e.target.value) || 0)}
              className="w-full pl-14 pr-5 py-4 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white text-lg
                         placeholder:text-white/30 outline-none transition-all duration-300
                         focus:bg-white/[0.08] focus:border-[#C1FF72]/50"
            />
          </div>
          <p className="text-xs text-white/40 pl-1">Set the price attendees will pay for this pass</p>
        </motion.div>
      )}
    </div>
  </motion.div>
);

// Page transition variants
const pageVariants = {
  initial: { opacity: 0, y: 40, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -40, scale: 0.98 },
};

const pageTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
};

// Custom date picker component
const CustomDatePicker = ({
  label,
  value,
  onChange,
  helper,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  helper?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    if (value) return new Date(value);
    const today = new Date();
    today.setDate(today.getDate() + 7); // Default to 1 week from now
    return today;
  });

  const inputRef = useRef<HTMLInputElement>(null);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];

    // Add empty slots for days before the first day of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    if (!value) return false;
    return date.toDateString() === new Date(value).toDateString();
  };

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handleSelectDate = (date: Date) => {
    const formatted = date.toISOString().split("T")[0];
    onChange(formatted);
    setIsOpen(false);
  };

  const prevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  return (
    <div className="space-y-2 relative">
      {label && <label className="block text-sm font-medium text-white/60">{label}</label>}

      <motion.div
        whileHover={{ scale: 1.01 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative cursor-pointer"
      >
        <div className="w-full px-5 py-4 rounded-2xl bg-white/[0.07] border border-white/[0.08] text-white text-lg
                       transition-all duration-300 hover:bg-white/[0.09] flex items-center justify-between">
          <span className={value ? "text-white" : "text-white/30"}>
            {value ? formatDisplayDate(value) : "Select a date"}
          </span>
          <svg className="w-5 h-5 text-white/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
        </div>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 mt-2 w-full p-4 rounded-2xl bg-[#0a0a0a] border border-white/[0.1] shadow-2xl"
          >
            {/* Month/Year Header */}
            <div className="flex items-center justify-between mb-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={prevMonth}
                className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center text-white/70 hover:bg-white/[0.1] transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </motion.button>
              <span className="text-lg font-semibold text-white">
                {months[viewDate.getMonth()]} {viewDate.getFullYear()}
              </span>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={nextMonth}
                className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center text-white/70 hover:bg-white/[0.1] transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {daysOfWeek.map((day) => (
                <div key={day} className="text-center text-xs font-medium text-white/40 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth(viewDate).map((date, i) => (
                <div key={i} className="aspect-square">
                  {date ? (
                    <motion.button
                      whileHover={{ scale: isPast(date) ? 1 : 1.1 }}
                      whileTap={{ scale: isPast(date) ? 1 : 0.95 }}
                      onClick={() => !isPast(date) && handleSelectDate(date)}
                      disabled={isPast(date)}
                      className={`w-full h-full rounded-xl flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                        isSelected(date)
                          ? "bg-[#C1FF72] text-black shadow-[0_0_20px_rgba(193,255,114,0.3)]"
                          : isToday(date)
                          ? "bg-white/10 text-[#C1FF72] border border-[#C1FF72]/30"
                          : isPast(date)
                          ? "text-white/20 cursor-not-allowed"
                          : "text-white/70 hover:bg-white/10"
                      }`}
                    >
                      {date.getDate()}
                    </motion.button>
                  ) : (
                    <div />
                  )}
                </div>
              ))}
            </div>

            {/* Quick Select */}
            <div className="mt-4 pt-4 border-t border-white/[0.08] flex gap-2">
              {[
                { label: "Tomorrow", days: 1 },
                { label: "Next Week", days: 7 },
                { label: "Next Month", days: 30 },
              ].map(({ label, days }) => {
                const date = new Date();
                date.setDate(date.getDate() + days);
                return (
                  <motion.button
                    key={label}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectDate(date)}
                    className="flex-1 py-2 px-3 rounded-xl bg-white/[0.05] text-white/70 text-sm hover:bg-white/[0.1] transition-colors"
                  >
                    {label}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {helper && <p className="text-sm text-white/40 pl-1">{helper}</p>}
    </div>
  );
};

// Event preview card for review step
const EventPreviewCard = ({
  eventData,
  passes,
  bannerPreview,
}: {
  eventData: { name: string; description: string; date: string; location: string };
  passes: Pass[];
  bannerPreview?: string;
}) => {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/[0.1]"
    >
      {/* Cover image or gradient */}
      <div className="h-40 relative overflow-hidden">
        {bannerPreview ? (
          <img
            src={bannerPreview}
            alt="Event banner"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#C1FF72]/30 via-purple-500/20 to-blue-500/20">
            <div className="absolute inset-0 bg-[url('/noise.png')] bg-[length:100px] opacity-10" />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
      </div>

      {/* Content */}
      <div className="px-6 pb-6 -mt-8 relative z-10">
        {/* Event Title */}
        <h3 className="text-2xl font-bold text-white mb-2">{eventData.name || "Untitled Event"}</h3>

        {/* Event Details */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-white/60">
            <div className="w-8 h-8 rounded-lg bg-white/[0.07] flex items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <span className="text-sm">{formatDate(eventData.date) || "Date not set"}</span>
          </div>

          <div className="flex items-center gap-3 text-white/60">
            <div className="w-8 h-8 rounded-lg bg-white/[0.07] flex items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
            </div>
            <span className="text-sm">{eventData.location || "Location not set"}</span>
          </div>
        </div>

        {/* Description */}
        {eventData.description && (
          <div className="mb-6">
            <p className="text-sm text-white/50 line-clamp-2">{eventData.description}</p>
          </div>
        )}

        {/* Pass Types */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-white/70 uppercase tracking-wider">Available Passes</h4>
          <div className="grid gap-2">
            {passes.filter(p => p.type && p.price > 0).map((pass, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center justify-between p-4 rounded-xl bg-white/[0.05] border border-white/[0.08]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C1FF72]/20 to-[#C1FF72]/5 flex items-center justify-center text-[#C1FF72]">
                    {passTypeIcons[pass.type]}
                  </div>
                  <div>
                    <p className="font-medium text-white">{pass.type}</p>
                    <p className="text-xs text-white/40">{passTypeDescriptions[pass.type]}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-[#C1FF72]">PKR {pass.price.toLocaleString()}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function EventOnboardingPage() {
  const { id } = useParams();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const [eventData, setEventData] = useState({
    name: "",
    description: "",
    date: "",
    location: "",
  });

  // Banner image state
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>("");

  const handleBannerChange = (file: File | null) => {
    if (!file) return;
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  // Default quantity to 1000 (hidden from UI)
  const [passes, setPasses] = useState<Pass[]>([{ type: "", price: 0, quantity: 1000 }]);

  const steps = [
    { icon: SparkleIcon, title: "Name your event", subtitle: "Give your event a name that stands out" },
    { icon: CalendarIcon, title: "When & where", subtitle: "Set the date and location" },
    { icon: TicketIcon, title: "Create your passes", subtitle: "Define ticket types and pricing" },
    { icon: RocketIcon, title: "Ready to launch", subtitle: "Review and publish your event" },
  ];

  const allPassTypes = ["Group", "Couple", "Single Male", "Single Female"];
  const selectedTypes = passes.map((p) => p.type);
  const availableTypes = allPassTypes.filter((t) => !selectedTypes.includes(t) || passes.some(p => p.type === t));

  const handleNext = async () => {
    setError(null);

    try {
      if (!authorized) return;
      setLoading(true);

      if (step === 1) {
        if (!eventData.name || !eventData.description) {
          setError("Please provide both event name and description.");
          return;
        }

        // Use FormData to support banner image upload
        const formData = new FormData();
        formData.append("name", eventData.name);
        formData.append("description", eventData.description);
        if (bannerFile) {
          formData.append("banner", bannerFile);
        }

        await postWithAuth(`/organizers/events/${id}/update`, formData, true);
        setStep(2);
      } else if (step === 2) {
        if (!eventData.date || !eventData.location) {
          setError("Please provide event date and location.");
          return;
        }
        await postWithAuth(`/organizers/events/${id}/update`, {
          date: eventData.date,
          location: eventData.location,
        });
        setStep(3);
      } else if (step === 3) {
        // Validate passes
        const validPasses = passes.filter(p => p.type && p.price > 0);
        if (validPasses.length === 0) {
          setError("Please add at least one pass type with a price.");
          return;
        }

        // Set default quantity of 1000 for all passes before sending
        const passesWithQuantity = validPasses.map(p => ({
          ...p,
          quantity: 1000, // Default quantity
        }));

        await postWithAuth(`/organizers/events/${id}/pass-types`, { passes: passesWithQuantity });
        setStep(4);
      } else if (step === 4) {
        await postWithAuth(`/organizers/events/${id}/publish`);
        setShowConfetti(true);
        setTimeout(() => {
          router.push(`/organizers/events/${id}`);
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const addPass = () => {
    if (passes.length < 4) {
      setPasses([...passes, { type: "", price: 0, quantity: 1000 }]);
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

  // Auth check
  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("whispr_token") || localStorage.getItem("token")
        : null;
    const role = typeof window !== "undefined" ? localStorage.getItem("whispr_role") : null;

    if (!token) {
      router.replace("/auth?role=organizer");
      return;
    }

    if (role && role !== "organizer") {
      router.replace(role === "attendee" ? "/attendees/dashboard" : "/auth");
      return;
    }

    setAuthorized(true);
  }, [router]);

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-white/20 border-t-[#C1FF72] rounded-full"
        />
      </div>
    );
  }

  return (
    <main className="relative min-h-screen w-full bg-[#050505] text-white overflow-hidden">
      <FloatingOrbs />
      <Confetti active={showConfetti} />

      {/* Noise texture */}
      <div className="fixed inset-0 bg-[url('/noise.png')] bg-[length:200px] opacity-[0.03] pointer-events-none" />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.05] border border-white/[0.08]">
            <div className="w-2 h-2 rounded-full bg-[#C1FF72] shadow-[0_0_10px_#C1FF72]" />
            <span className="text-sm font-medium text-white/70">Whispr for Organizers</span>
          </div>
        </motion.div>

        {/* Step indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <StepIndicator currentStep={step} totalSteps={4} />
        </motion.div>

        {/* Step header */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`header-${step}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="text-center mb-10"
          >
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C1FF72]/20 to-[#C1FF72]/5 border border-[#C1FF72]/20 text-[#C1FF72] mb-6"
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              {step === 1 && <SparkleIcon />}
              {step === 2 && <CalendarIcon />}
              {step === 3 && <TicketIcon />}
              {step === 4 && <RocketIcon />}
            </motion.div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3 tracking-tight">
              {steps[step - 1].title}
            </h1>
            <p className="text-lg text-white/50 max-w-md">
              {steps[step - 1].subtitle}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Error display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="w-full max-w-md mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step content */}
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {/* STEP 1: Event Basics */}
            {step === 1 && (
              <motion.div
                key="step1"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={pageTransition}
                className="space-y-5"
              >
                <OnboardingInput
                  label="Event name"
                  placeholder="Summer Rooftop Party"
                  value={eventData.name}
                  onChange={(e) => setEventData({ ...eventData, name: e.target.value })}
                  helper="Choose something catchy and memorable"
                />
                <OnboardingTextarea
                  label="Description"
                  placeholder="Tell people what makes your event special..."
                  rows={4}
                  value={eventData.description}
                  onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
                  helper="Describe the vibe, music, dress code, or anything exciting"
                />

                {/* Event Banner Upload */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/60">Event banner</label>
                  <motion.div
                    onClick={() => document.getElementById("bannerInput")?.click()}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="relative w-full aspect-video rounded-2xl cursor-pointer group overflow-hidden"
                  >
                    {bannerPreview ? (
                      <>
                        <img
                          src={bannerPreview}
                          alt="Event banner"
                          className="w-full h-full object-cover rounded-2xl"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm">
                            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                            <span className="text-white text-sm font-medium">Change image</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full rounded-2xl bg-white/[0.05] border-2 border-dashed border-white/[0.15]
                                      flex flex-col items-center justify-center gap-3 transition-all
                                      group-hover:border-[#C1FF72]/40 group-hover:bg-white/[0.07]">
                        <div className="w-12 h-12 rounded-xl bg-white/[0.08] flex items-center justify-center">
                          <svg className="w-6 h-6 text-white/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                          </svg>
                        </div>
                        <div className="text-center">
                          <p className="text-white/70 text-sm font-medium">Click to upload banner</p>
                          <p className="text-white/40 text-xs mt-1">Recommended: 1920×1080px (16:9)</p>
                        </div>
                      </div>
                    )}
                    <input
                      id="bannerInput"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleBannerChange(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </motion.div>
                  <p className="text-sm text-white/40 pl-1">This will be shown on your event page and cards</p>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Schedule & Location */}
            {step === 2 && (
              <motion.div
                key="step2"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={pageTransition}
                className="space-y-5"
              >
                <CustomDatePicker
                  label="Event date"
                  value={eventData.date}
                  onChange={(val) => setEventData({ ...eventData, date: val })}
                  helper="When is the magic happening?"
                />
                <OnboardingInput
                  label="Location"
                  placeholder="Rooftop Lounge, Karachi"
                  value={eventData.location}
                  onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
                  helper="Enter the venue name and city"
                />
              </motion.div>
            )}

            {/* STEP 3: Pass Types */}
            {step === 3 && (
              <motion.div
                key="step3"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={pageTransition}
                className="space-y-5"
              >
                <div className="p-4 rounded-2xl bg-[#C1FF72]/10 border border-[#C1FF72]/20 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#C1FF72]/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-[#C1FF72]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#C1FF72]">Create pass types</p>
                      <p className="text-xs text-white/50 mt-1">
                        Add different ticket categories for your event. You can have up to 4 pass types with different pricing.
                      </p>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {passes.map((pass, i) => (
                    <PassCard
                      key={i}
                      pass={pass}
                      index={i}
                      availableTypes={allPassTypes.filter(
                        (t) => t === pass.type || !selectedTypes.includes(t)
                      )}
                      onUpdate={(field, value) => updatePass(i, field, value)}
                      onRemove={() => removePass(i)}
                      canRemove={passes.length > 1}
                    />
                  ))}
                </AnimatePresence>

                {passes.length < 4 && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={addPass}
                    className="w-full py-4 rounded-2xl border-2 border-dashed border-white/[0.15] text-white/50 hover:border-[#C1FF72]/30 hover:text-[#C1FF72] transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Add another pass type
                  </motion.button>
                )}
              </motion.div>
            )}

            {/* STEP 4: Review & Publish */}
            {step === 4 && (
              <motion.div
                key="step4"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={pageTransition}
                className="space-y-6"
              >
                <EventPreviewCard eventData={eventData} passes={passes} bannerPreview={bannerPreview} />

                <div className="p-4 rounded-2xl bg-white/[0.05] border border-white/[0.08]">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Ready to publish?</p>
                      <p className="text-xs text-white/50 mt-1">
                        Once published, your event will be visible to attendees and they can start registering.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-md mt-10 flex gap-3"
        >
          {step > 1 && (
            <PrimaryButton variant="secondary" onClick={handleBack}>
              Back
            </PrimaryButton>
          )}
          <PrimaryButton
            onClick={handleNext}
            disabled={
              (step === 1 && (!eventData.name || !eventData.description)) ||
              (step === 2 && (!eventData.date || !eventData.location)) ||
              (step === 3 && !passes.some(p => p.type && p.price > 0))
            }
            loading={loading}
            className={step === 1 ? "w-full" : "flex-1"}
          >
            {step === 4 ? "Publish Event" : "Continue"}
          </PrimaryButton>
        </motion.div>

        {/* Footer hint */}
        {step < 4 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-sm text-white/30"
          >
            {step === 1 && "Make it memorable — first impressions matter"}
            {step === 2 && "Pro tip: Events on weekends get more attention"}
            {step === 3 && "Offer variety — different pass types attract more attendees"}
          </motion.p>
        )}
      </div>
    </main>
  );
}
