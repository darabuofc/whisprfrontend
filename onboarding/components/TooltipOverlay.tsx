"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { TooltipConfig } from "../context/types";

interface TooltipOverlayProps {
  tooltip: TooltipConfig | null;
  onDismiss: () => void;
}

interface Position {
  top: number;
  left: number;
}

export function TooltipOverlay({ tooltip, onDismiss }: TooltipOverlayProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<Position | null>(null);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const calculatePosition = useCallback(() => {
    if (!tooltip) return;

    const target = document.querySelector(tooltip.targetSelector);
    if (!target) return;

    const rect = target.getBoundingClientRect();
    setTargetRect(rect);

    const cardWidth = 320;
    const cardHeight = 180;
    const gap = 12;

    let top: number;
    let left: number;

    const placement = tooltip.placement ?? "bottom";

    switch (placement) {
      case "top":
        top = rect.top - cardHeight - gap;
        left = rect.left + rect.width / 2 - cardWidth / 2;
        break;
      case "left":
        top = rect.top + rect.height / 2 - cardHeight / 2;
        left = rect.left - cardWidth - gap;
        break;
      case "right":
        top = rect.top + rect.height / 2 - cardHeight / 2;
        left = rect.right + gap;
        break;
      case "bottom":
      default:
        top = rect.bottom + gap;
        left = rect.left + rect.width / 2 - cardWidth / 2;
        break;
    }

    // Auto-flip if overflow
    if (top < 8) top = rect.bottom + gap;
    if (top + cardHeight > window.innerHeight - 8) top = rect.top - cardHeight - gap;
    if (left < 8) left = 8;
    if (left + cardWidth > window.innerWidth - 8) left = window.innerWidth - cardWidth - 8;

    setPosition({ top, left });
  }, [tooltip]);

  // Calculate position on mount and observe changes
  useEffect(() => {
    if (!tooltip) {
      setPosition(null);
      setTargetRect(null);
      return;
    }

    calculatePosition();

    // Recalculate on resize/scroll
    window.addEventListener("resize", calculatePosition);
    window.addEventListener("scroll", calculatePosition, true);

    // ResizeObserver on target
    const target = document.querySelector(tooltip.targetSelector);
    let observer: ResizeObserver | null = null;
    if (target) {
      observer = new ResizeObserver(calculatePosition);
      observer.observe(target);
    }

    return () => {
      window.removeEventListener("resize", calculatePosition);
      window.removeEventListener("scroll", calculatePosition, true);
      observer?.disconnect();
    };
  }, [tooltip, calculatePosition]);

  // Apply highlight to target element
  useEffect(() => {
    if (!tooltip) return;

    const target = document.querySelector(tooltip.targetSelector) as HTMLElement;
    if (!target) return;

    const originalZIndex = target.style.zIndex;
    const originalPosition = target.style.position;
    const originalBoxShadow = target.style.boxShadow;
    const originalPointerEvents = target.style.pointerEvents;

    target.style.zIndex = "1001";
    target.style.position = target.style.position === "static" ? "relative" : target.style.position;
    target.style.boxShadow = "0 0 0 2px #D4A574";
    target.style.pointerEvents = "auto";

    return () => {
      target.style.zIndex = originalZIndex;
      target.style.position = originalPosition;
      target.style.boxShadow = originalBoxShadow;
      target.style.pointerEvents = originalPointerEvents;
    };
  }, [tooltip]);

  return (
    <AnimatePresence>
      {tooltip && position && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[999]"
            style={{
              background: "rgba(0, 0, 0, 0.4)",
              pointerEvents: "none",
            }}
          />

          {/* Tooltip card */}
          <motion.div
            ref={cardRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed z-[1002] rounded-lg border border-[#333] p-4"
            style={{
              top: position.top,
              left: position.left,
              width: 320,
              background: "#1A1A1A",
            }}
          >
            {/* Title */}
            <p
              className="text-[14px] text-white font-semibold tracking-wide"
              style={{ fontFamily: "var(--font-display-org, 'Space Grotesk', sans-serif)" }}
            >
              {tooltip.title}
            </p>

            {/* Body */}
            <p
              className="text-[13px] text-[#999] mt-2 leading-relaxed"
              style={{
                fontFamily: "system-ui",
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {tooltip.body}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between mt-4">
              {/* Step counter */}
              {tooltip.sequence && (
                <span
                  className="text-[12px] text-[#666]"
                  style={{ fontFamily: "system-ui" }}
                >
                  {tooltip.sequence.index} of {tooltip.sequence.total}
                </span>
              )}

              {/* CTA button */}
              <button
                onClick={() => {
                  tooltip.onDismiss?.();
                  onDismiss();
                }}
                className="ml-auto px-4 py-1.5 rounded-full text-[12px] font-medium text-[#111] transition-opacity hover:opacity-90"
                style={{ background: "#D4A574" }}
              >
                {tooltip.sequence ? "Continue" : "Got it"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
