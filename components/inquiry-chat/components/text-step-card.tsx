"use client";

import { memo, useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { TextField } from "../types";

interface TextStepCardProps {
  fields: TextField[];
  formData: Record<string, unknown>;
  errors: Record<string, string | undefined>;
  currentFieldIndex: number;
  showBack: boolean;
  userName?: string;
  onUpdate: (key: string, value: string) => void;
  onMiniOk: (fieldKey: string) => void;
  onContinue: () => void;
  onBack: () => void;
}

export const TextStepCard = memo(function TextStepCard({
  fields,
  formData,
  errors,
  currentFieldIndex,
  showBack,
  userName,
  onUpdate,
  onMiniOk,
  onContinue,
  onBack,
}: TextStepCardProps) {
  const inputRefs = useRef<Record<string, HTMLInputElement | HTMLTextAreaElement | null>>({});

  const initial = userName?.trim()?.charAt(0)?.toUpperCase();
  const showAvatar = Boolean(initial);

  // Auto-focus the current field
  useEffect(() => {
    const field = fields[currentFieldIndex];
    if (field) {
      const el = inputRefs.current[field.key];
      if (el) {
        const t = setTimeout(() => el.focus(), 100);
        return () => clearTimeout(t);
      }
    }
  }, [currentFieldIndex]);

  const handleMiniOk = useCallback(
    (fieldKey: string) => {
      onMiniOk(fieldKey);
    },
    [onMiniOk]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, field: TextField, isLastField: boolean) => {
      if (e.key !== "Enter" || field.textarea) return;
      e.preventDefault();
      if (!isLastField) {
        handleMiniOk(field.key);
      } else {
        onContinue();
      }
    },
    [handleMiniOk, onContinue]
  );

  const allFieldsFilled = fields.every((f) =>
    String(formData[f.key] || "").trim()
  );

  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-col items-end">
        <div className="flex items-end gap-3 w-full">
          <div
            className="flex-1 rounded-2xl overflow-hidden"
            style={{ background: "rgba(226, 220, 214, 0.82)" }}
          >
            {fields.map((field, idx) => {
              const isVisible = idx <= currentFieldIndex;
              const isCurrent = idx === currentFieldIndex;
              const isLastField = idx === fields.length - 1;
              const val = String(formData[field.key] || "");
              const hasError = !!errors[field.key];
              const isCompleted = !isCurrent && idx < currentFieldIndex && val.trim();
              const Tag = field.textarea ? "textarea" : "input";

              if (!isVisible) return null;

              return (
                <div
                  key={field.key}
                  className={cn(
                    "px-5 sm:px-7 py-4 sm:py-5 border-t",
                    idx === 0 ? "border-t-0" : "border-t-[rgba(17,17,17,0.08)]"
                  )}
                >
                  <label className="block mb-2.5 text-[17px] leading-snug font-medium text-[#111]">
                    {field.label}
                  </label>
                  <Tag
                    ref={(el: HTMLInputElement | HTMLTextAreaElement | null) => {
                      inputRefs.current[field.key] = el;
                    }}
                    {...(!field.textarea ? { type: field.type || "text" } : {})}
                    placeholder={field.placeholder || ""}
                    value={val}
                    onChange={(e) => onUpdate(field.key, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, field, isLastField)}
                    className={cn(
                      "w-full rounded-xl px-4 py-3.5 text-base border outline-none transition-all",
                      "text-[#111] placeholder:text-[rgba(17,17,17,0.28)]",
                      "focus:border-[rgba(17,17,17,0.5)]",
                      hasError && "border-red-400/60 bg-red-50",
                      isCompleted && "bg-[rgba(255,255,255,0.82)] border-[rgba(17,17,17,0.12)]"
                    )}
                    style={{
                      background: isCompleted
                        ? "rgba(255, 255, 255, 0.82)"
                        : "rgba(255, 255, 255, 0.92)",
                      borderColor: hasError ? undefined : "rgba(17, 17, 17, 0.22)",
                      resize: field.textarea ? "vertical" : undefined,
                      minHeight: field.textarea ? "112px" : undefined,
                    }}
                  />
                  {hasError && (
                    <div className="mt-1.5 text-[13px] text-red-600">{errors[field.key]}</div>
                  )}

                  {/* Mini OK button (hidden for last field or completed fields) */}
                  {!isLastField && isCurrent && (
                    <div className="flex justify-end mt-2.5">
                      <button
                        type="button"
                        onClick={() => handleMiniOk(field.key)}
                        className="px-3 py-1.5 rounded-lg text-[13px] bg-[rgba(17,17,17,0.08)] text-[rgba(17,17,17,0.62)] hover:bg-[rgba(17,17,17,0.14)] hover:text-[#111] transition-all cursor-pointer"
                      >
                        OK ↳
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Action row */}
            {allFieldsFilled && (
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
                  className="px-3 py-1.5 rounded-lg text-[13px] bg-[rgba(17,17,17,0.08)] text-[rgba(17,17,17,0.62)] hover:bg-[rgba(17,17,17,0.14)] hover:text-[#111] transition-all cursor-pointer"
                >
                  OK ↳
                </button>
              </div>
            )}
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
