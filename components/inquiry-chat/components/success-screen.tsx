"use client";

import { memo } from "react";
import { GlassButton } from "@/components/ui/glass-button";

interface SuccessScreenProps {
  mode?: string;
  onClose?: () => void;
}

export const SuccessScreen = memo(function SuccessScreen({ mode, onClose }: SuccessScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 min-h-[400px] animate-fade-in-up">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-8 animate-fade-in-up"
        style={{ animationDelay: "0.1s", background: "rgba(17, 17, 17, 0.08)" }}
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h2 className="text-2xl font-semibold mb-4 text-[#111] animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
        Thank you.
      </h2>
      <p className="text-[rgba(17,17,17,0.65)] leading-relaxed max-w-md animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
        Your inquiry has been received. We&apos;ll review it carefully and get back to you if it feels like a strong fit.
      </p>
      {mode === "modal" && onClose && (
        <div className="mt-10 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          <GlassButton onClick={onClose} variant="primary">
            Close
          </GlassButton>
        </div>
      )}
    </div>
  );
});
