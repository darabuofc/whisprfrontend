"use client";

import { ReactNode } from "react";

interface AnimatedBorderProps {
  children: ReactNode;
  className?: string;
  borderRadius?: string;
  gradientColors?: string[];
  animationDuration?: string;
}

export default function AnimatedBorder({
  children,
  className = "",
  borderRadius = "0.75rem",
  gradientColors = ["#C1FF72", "#6C2DFF", "#C1FF72"],
  animationDuration = "3s",
}: AnimatedBorderProps) {
  return (
    <div
      className={`relative ${className}`}
      style={{ borderRadius }}
    >
      {/* Rotating gradient border */}
      <div
        className="absolute -inset-[1px] animate-border-rotate opacity-60"
        style={{
          borderRadius,
          background: `conic-gradient(from 0deg, ${gradientColors.join(", ")})`,
          animationDuration,
        }}
      />
      {/* Inner content with solid background */}
      <div
        className="relative"
        style={{
          borderRadius,
          background: "#0a0a0a",
        }}
      >
        {children}
      </div>
    </div>
  );
}
