"use client";

interface ShimmerTextProps {
  children: string;
  className?: string;
  shimmerWidth?: number;
}

export default function ShimmerText({
  children,
  className = "",
  shimmerWidth = 100,
}: ShimmerTextProps) {
  return (
    <span
      className={`inline-block bg-clip-text text-transparent animate-shimmer-text ${className}`}
      style={{
        backgroundImage: `linear-gradient(
          90deg,
          #C1FF72 0%,
          #e8ffcc ${shimmerWidth / 3}%,
          #ffffff ${shimmerWidth / 2}%,
          #e8ffcc ${(shimmerWidth * 2) / 3}%,
          #C1FF72 ${shimmerWidth}%
        )`,
        backgroundSize: "200% 100%",
      }}
    >
      {children}
    </span>
  );
}
