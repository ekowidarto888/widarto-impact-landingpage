"use client";

import { memo, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { Option } from "../types";

interface CompletedOptionCardProps {
  label: string;
  options: Option[];
  selected: string[];
  multi: boolean;
  dataKey: string;
  formData?: Record<string, unknown>;
  onUpdate?: (key: string, value: string | string[]) => void;
}

export const CompletedOptionCard = memo(function CompletedOptionCard({
  label,
  options,
  selected: initialSelected,
  multi,
  dataKey,
  formData,
  onUpdate,
}: CompletedOptionCardProps) {
  // Read live value from formData if available
  const liveValue = formData?.[dataKey];
  const liveSelected = multi
    ? (Array.isArray(liveValue) ? liveValue as string[] : initialSelected)
    : (liveValue ? [String(liveValue)] : initialSelected);
  const selectedSet = new Set(liveSelected);

  const toggle = useCallback((title: string) => {
    if (multi) {
      const next = new Set(selectedSet);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }
      onUpdate?.(dataKey, Array.from(next));
    } else {
      onUpdate?.(dataKey, title);
    }
  }, [multi, dataKey, onUpdate, selectedSet]);

  return (
    <div className="animate-fade-in-up w-full">
      <div
        className="w-full rounded-2xl overflow-hidden"
        style={{ background: "rgba(226, 220, 214, 0.82)" }}
      >
        <div className="px-5 sm:px-7 py-5 text-[17px] leading-snug font-medium text-[#111]">
          {label}
        </div>

        <div className="flex flex-col">
          {options.map((opt) => {
            const isSelected = selectedSet.has(opt.title);
            return (
              <button
                key={opt.title}
                type="button"
                onClick={() => toggle(opt.title)}
                className={cn(
                  "w-full text-left px-5 sm:px-7 py-4 border-t transition-all cursor-pointer relative",
                  "text-base leading-snug",
                  isSelected
                    ? "text-[#111] font-semibold bg-[rgba(255,255,255,0.28)]"
                    : "text-[rgba(17,17,17,0.62)] bg-[rgba(255,255,255,0.16)] hover:text-[#111] hover:bg-[rgba(255,255,255,0.34)]"
                )}
                style={{ borderColor: "rgba(17, 17, 17, 0.08)" }}
              >
                <span className="block pr-12">{opt.title}</span>
                {opt.desc && (
                  <span className="block text-[13px] text-[rgba(17,17,17,0.55)] mt-1 leading-snug font-normal">
                    {opt.desc}
                  </span>
                )}
                {/* Checkmark box */}
                <div
                  className={cn(
                    "absolute right-5 sm:right-7 top-1/2 -translate-y-1/2 w-[18px] h-[18px] rounded border flex items-center justify-center text-[13px] font-bold transition-all",
                    isSelected
                      ? "border-[#111] text-[#111]"
                      : "border-[rgba(17,17,17,0.25)]"
                  )}
                >
                  {isSelected && "✓"}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
});
