"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import type { Option } from "../types";

interface OptionStepCardProps {
  label: string;
  dataKey: string;
  options: Option[];
  multi: boolean;
  formData: Record<string, unknown>;
  errors: Record<string, string | undefined>;
  showBack: boolean;
  userName?: string;
  onUpdate: (dataKey: string, value: string | string[]) => void;
  onContinue: () => void;
  onBack: () => void;
}

export const OptionStepCard = memo(function OptionStepCard({
  label,
  dataKey,
  options,
  multi,
  formData,
  errors,
  showBack,
  userName,
  onUpdate,
  onContinue,
  onBack,
}: OptionStepCardProps) {
  const currentValue = formData[dataKey];
  const selectedSet = multi
    ? new Set(Array.isArray(currentValue) ? (currentValue as string[]) : [])
    : null;
  const singleValue = multi ? "" : String(currentValue || "");
  const error = errors[dataKey];

  const initial = userName?.trim()?.charAt(0)?.toUpperCase();
  const showAvatar = Boolean(initial);

  const toggle = (title: string) => {
    if (multi) {
      const cur = Array.isArray(currentValue) ? (currentValue as string[]) : [];
      const next = cur.includes(title)
        ? cur.filter((t) => t !== title)
        : [...cur, title];
      onUpdate(dataKey, next);
    } else {
      onUpdate(dataKey, title);
    }
  };

  const isSelected = (title: string) => {
    if (multi) return selectedSet?.has(title) ?? false;
    return singleValue === title;
  };

  const canContinue = multi
    ? Array.isArray(currentValue) && (currentValue as string[]).length > 0
    : Boolean(currentValue);

  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-col items-end">
        <div className="flex items-end gap-3 w-full">
          <div
            className="flex-1 rounded-2xl overflow-hidden"
            style={{ background: "rgba(226, 220, 214, 0.82)" }}
          >
            <div className="px-5 sm:px-7 py-5 text-[17px] leading-snug font-medium text-[#111]">
              {label}
            </div>

            <div className="flex flex-col">
              {options.map((opt) => {
                const selected = isSelected(opt.title);
                return (
                  <button
                    key={opt.title}
                    type="button"
                    onClick={() => toggle(opt.title)}
                    className={cn(
                      "w-full text-left px-5 sm:px-7 py-4 border-t transition-all cursor-pointer relative",
                      "text-base leading-snug",
                      selected
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
                        selected
                          ? "border-[#111] text-[#111]"
                          : "border-[rgba(17,17,17,0.25)]"
                      )}
                    >
                      {selected && "✓"}
                    </div>
                  </button>
                );
              })}
            </div>

            {error && (
              <div className="px-5 sm:px-7 py-2 text-[13px] text-red-600">{error}</div>
            )}

            {/* Action row */}
            <div className="flex justify-between items-center gap-3 px-5 sm:px-7 py-4 border-t border-[rgba(17,17,17,0.08)]">
              <button
                type="button"
                onClick={onBack}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[13px] transition-all cursor-pointer",
                  showBack
                    ? "bg-[rgba(17,17,17,0.08)] text-[rgba(17,17,17,0.62)] hover:bg-[rgba(17,17,17,0.14)] hover:text-[#111]"
                    : "invisible"
                )}
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={onContinue}
                disabled={!canContinue}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[13px] transition-all cursor-pointer",
                  canContinue
                    ? "bg-[rgba(17,17,17,0.08)] text-[rgba(17,17,17,0.62)] hover:bg-[rgba(17,17,17,0.14)] hover:text-[#111]"
                    : "opacity-40 pointer-events-none bg-[rgba(17,17,17,0.08)] text-[rgba(17,17,17,0.62)]"
                )}
              >
                OK ↳
              </button>
            </div>
          </div>

          {showAvatar && (
            <div className="shrink-0 pb-1">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                style={{ background: "rgba(17, 17, 17, 0.75)" }}
              >
                {initial}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
