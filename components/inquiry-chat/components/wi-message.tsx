"use client";

import { memo, useMemo } from "react";

interface WIMessageProps {
  text: string;
  emoji?: boolean;
  animate?: boolean;
  formData?: Record<string, unknown>;
}

function firstName(formData: Record<string, unknown> | undefined): string {
  return String(formData?.fullName || "there").split(" ")[0];
}

export const WIMessage = memo(function WIMessage({ text, emoji, animate = true, formData }: WIMessageProps) {
  const resolvedText = useMemo(() => {
    return text.replace(/\{\{firstName\}\}/g, firstName(formData));
  }, [text, formData]);

  return (
    <div className={`${animate ? "animate-fade-in-up" : ""}`}>
      <div
        className={`
          px-[18px] rounded-2xl leading-relaxed
          text-[#111]
          ${emoji ? "text-[28px] py-4" : "text-base py-3"}
        `}
        style={{
          background: "rgba(226, 220, 214, 0.72)",
          backdropFilter: "blur(10px)",
        }}
        dangerouslySetInnerHTML={{ __html: resolvedText }}
      />
    </div>
  );
});
