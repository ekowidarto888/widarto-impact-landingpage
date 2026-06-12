"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ChatContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const ChatContainer = forwardRef<HTMLDivElement, ChatContainerProps>(
  function ChatContainer({ children, className }, ref) {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col h-full w-full", className)}
        style={{
          background:
            "linear-gradient(135deg, rgba(238, 242, 223, 0.96) 0%, rgba(243, 222, 215, 0.96) 55%, rgba(230, 239, 226, 0.96) 100%)",
        }}
      >
        {children}
      </div>
    );
  },
);
