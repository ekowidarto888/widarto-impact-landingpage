"use client";

import { memo } from "react";

interface UserAnswerProps {
  text: string;
}

export const UserAnswer = memo(function UserAnswer({ text }: UserAnswerProps) {
  return (
    <div className="animate-fade-in-up">
      <div
        className="px-[18px] py-3 rounded-2xl text-base leading-relaxed text-[#111]"
        style={{ background: "rgba(226, 220, 214, 0.82)" }}
      >
        {text}
      </div>
    </div>
  );
});
