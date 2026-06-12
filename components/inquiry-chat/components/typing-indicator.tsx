"use client";

import { memo } from "react";
import Image from "next/image";

export const TypingIndicator = memo(function TypingIndicator() {
  return (
    <div className="flex justify-start gap-3">
      {/* Avatar */}
      <div className="shrink-0 pt-1">
        <div className="w-9 h-9 rounded-full overflow-hidden border border-[rgba(17,17,17,0.08)]">
          <Image
            src="/images/eko-widarto.jpg"
            alt="Eko"
            width={36}
            height={36}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="flex flex-col items-start">
        <div
          className="px-4 py-3 rounded-2xl"
          style={{ background: "rgba(226, 220, 214, 0.72)", backdropFilter: "blur(10px)" }}
        >
          <div className="flex items-center gap-1">
            <span
              className="w-1.5 h-1.5 rounded-full animate-typing-dot"
              style={{ animationDelay: "0ms", background: "rgba(17,17,17,0.35)" }}
            />
            <span
              className="w-1.5 h-1.5 rounded-full animate-typing-dot"
              style={{ animationDelay: "150ms", background: "rgba(17,17,17,0.35)" }}
            />
            <span
              className="w-1.5 h-1.5 rounded-full animate-typing-dot"
              style={{ animationDelay: "300ms", background: "rgba(17,17,17,0.35)" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
});
