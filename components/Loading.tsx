"use client";

// ─────────────────────────────────────────────
// CaseReady — Loading Components
// Usage:
//   <LoadingSpinner />                   inline, small
//   <LoadingSpinner size="lg" />         larger variant
//   <PageLoader />                       full-page route transition
// ─────────────────────────────────────────────

import React from "react";

// ── Spinner sizes ────────────────────────────
type SpinnerSize = "sm" | "md" | "lg";

const sizeMap: Record<
  SpinnerSize,
  { outer: string; inner: string; gap: string }
> = {
  sm: { outer: "w-4 h-4", inner: "w-4 h-4", gap: "border-[2px]" },
  md: { outer: "w-6 h-6", inner: "w-6 h-6", gap: "border-[2.5px]" },
  lg: { outer: "w-10 h-10", inner: "w-10 h-10", gap: "border-[3px]" },
};

// ── Inline spinner ───────────────────────────
export function LoadingSpinner({ size = "md" }: { size?: SpinnerSize }) {
  const s = sizeMap[size];
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block ${s.outer} relative`}
    >
      {/* Track ring */}
      <span
        className={`absolute inset-0 rounded-full ${s.gap} border-[#3B5BDB]/15`}
      />
      {/* Spinning arc */}
      <span
        className={`absolute inset-0 rounded-full ${s.gap} border-transparent border-t-[#3B5BDB] animate-spin`}
      />
    </span>
  );
}

// ── Full-page loader (route transitions) ─────
export function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
      {/* Logo mark */}
      <div className="mb-8 flex items-center gap-2.5 select-none">
        <span className="w-8 h-8 rounded-lg bg-[#3B5BDB] flex items-center justify-center">
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 5h12M3 9h8M3 13h5"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <span
          className="text-[15px] font-semibold tracking-tight text-slate-800"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          CaseReady
        </span>
      </div>

      {/* Spinner + animated bar */}
      <div className="flex flex-col items-center gap-5">
        {/* Dual-ring spinner */}
        <div className="relative w-12 h-12">
          {/* Outer track */}
          <span className="absolute inset-0 rounded-full border-[3px] border-[#3B5BDB]/10" />
          {/* Outer arc — spins clockwise */}
          <span className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-[#3B5BDB] animate-spin" />
          {/* Inner arc — spins counter-clockwise, slightly offset */}
          <span
            className="absolute inset-[6px] rounded-full border-[2px] border-transparent border-b-[#3B5BDB]/40"
            style={{ animation: "spin 0.9s linear infinite reverse" }}
          />
        </div>

        {/* Progress bar */}
        <div className="w-32 h-[2px] rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-[#3B5BDB] rounded-full"
            style={{
              animation: "progress 1.4s ease-in-out infinite",
            }}
          />
        </div>
      </div>

      {/* Keyframes injected inline */}
      <style>{`
        @keyframes progress {
          0%   { width: 0%;   margin-left: 0; }
          50%  { width: 70%;  margin-left: 15%; }
          100% { width: 0%;   margin-left: 100%; }
        }
      `}</style>
    </div>
  );
}

// ── Skeleton pulse (for table / card placeholders) ──
export function SkeletonLine({ className = "" }: { className?: string }) {
  return (
    <span className={`block rounded bg-slate-100 animate-pulse ${className}`} />
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-slate-100 p-5 space-y-3 bg-white">
      <SkeletonLine className="h-4 w-1/3" />
      <SkeletonLine className="h-3 w-2/3" />
      <SkeletonLine className="h-3 w-1/2" />
    </div>
  );
}
