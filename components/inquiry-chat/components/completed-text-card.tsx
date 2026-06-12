"use client";

import { memo } from "react";

interface CompletedTextCardProps {
  fields: { key: string; label: string; value: string }[];
  formData?: Record<string, unknown>;
  onUpdate?: (key: string, value: string) => void;
}

export const CompletedTextCard = memo(function CompletedTextCard({
  fields,
  formData,
  onUpdate,
}: CompletedTextCardProps) {
  return (
    <div className="animate-fade-in-up w-full">
      <div
        className="w-full rounded-2xl overflow-hidden"
        style={{ background: "rgba(226, 220, 214, 0.82)" }}
      >
        {fields.map((field, idx) => {
          const liveValue = String(formData?.[field.key] ?? field.value);
          return (
            <div
              key={field.key}
              className={`px-5 sm:px-7 py-4 sm:py-5 ${
                idx > 0 ? "border-t border-[rgba(17,17,17,0.08)]" : ""
              }`}
            >
              <label className="block text-[17px] leading-snug font-medium text-[#111] mb-2.5">
                {field.label}
              </label>
              <input
                type="text"
                value={liveValue}
                onChange={(e) => onUpdate?.(field.key, e.target.value)}
                className="w-full rounded-xl px-4 py-3.5 text-base text-[#111] leading-relaxed outline-none transition-all bg-white/90 border border-[rgba(17,17,17,0.22)] focus:border-[rgba(17,17,17,0.4)]"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
});
