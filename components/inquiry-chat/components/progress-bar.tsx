"use client";

import { memo } from "react";

interface ProgressBarProps {
  current: number;
  total: number;
}

export const ProgressBar = memo(function ProgressBar({ current, total }: ProgressBarProps) {
  const progress = Math.min(100, Math.max(0, (current / total) * 100));

  return (
    <div
      className="shrink-0 w-full px-4 pt-3 pb-1 border-b"
      style={{
        background: "rgba(255, 255, 255, 0.6)",
        backdropFilter: "blur(12px)",
        borderColor: "rgba(17, 17, 17, 0.06)",
      }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-medium text-[rgba(17,17,17,0.4)] uppercase tracking-wider">
          Question {current} of {total}
        </span>
      </div>
      <div className="h-0.5 w-full rounded-full overflow-hidden" style={{ background: "rgba(17, 17, 17, 0.08)" }}>
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%`, background: "rgba(17, 17, 17, 0.55)" }}
        />
      </div>
    </div>
  );
});
