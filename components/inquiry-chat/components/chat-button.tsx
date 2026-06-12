"use client";

import { memo, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ChatButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost";
  size?: "sm" | "default";
}

export const ChatButton = memo(
  forwardRef<HTMLButtonElement, ChatButtonProps>(
    function ChatButton(
      { variant = "primary", size = "default", className, children, ...props },
      ref
    ) {
      return (
        <button
          ref={ref}
          className={cn(
            "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-all duration-200 ease-out cursor-pointer",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(17,17,17,0.2)]",
            "disabled:pointer-events-none disabled:opacity-40",
            "hover:scale-105 active:scale-95",
            size === "sm" && "h-8 px-3 text-xs",
            size === "default" && "h-10 px-4 py-2 text-sm",
            variant === "primary" &&
              "bg-[#111] text-white border border-transparent hover:bg-[#333]",
            variant === "ghost" &&
              "bg-transparent text-[rgba(17,17,17,0.55)] hover:bg-[rgba(17,17,17,0.06)] hover:text-[#111]",
            className
          )}
          {...props}
        >
          {children}
        </button>
      );
    }
  )
);
