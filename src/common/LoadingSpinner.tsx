"use client";

import React from "react";

type LoadingSpinnerProps = {
  /** Optional label below the spinner (e.g. "Loading board...") */
  label?: string;
  /** Use full viewport height for page-level loading */
  fullPage?: boolean;
  /** Optional class for the container */
  className?: string;
};

/**
 * Centered loading indicator: spinner + optional text.
 * Better UX than plain "Loading..." — signals activity and feels more responsive.
 */
export default function LoadingSpinner({
  label = "Loading...",
  fullPage = false,
  className = "",
}: LoadingSpinnerProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 text-dark-green-2 ${fullPage ? "min-h-screen w-full" : "h-full min-h-48"} ${className}`}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent"
        style={{
          // Use theme-aware color; border-t-transparent creates the gap
          borderTopColor: "transparent",
        }}
      />
      {label && (
        <span className="text-sm font-medium tabular-nums">{label}</span>
      )}
    </div>
  );
}
