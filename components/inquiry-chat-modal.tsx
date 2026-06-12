"use client";

import { GlassSheet, GlassSheetContent, GlassSheetTitle } from "@/components/glass-sheet";
import { X } from "lucide-react";
import InquiryChat from "./inquiry-chat";

interface InquiryChatModalProps {
  open: boolean;
  onClose: () => void;
}

export default function InquiryChatModal({ open, onClose }: InquiryChatModalProps) {
  return (
    <GlassSheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <GlassSheetContent
        side="right"
        overlayClassName="bg-[rgba(17,17,17,0.15)] backdrop-blur-sm"
        className="w-full sm:max-w-[720px] lg:max-w-[888px] lg:min-w-[888px] p-0 overflow-hidden !shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
        style={{
          background: "linear-gradient(135deg, #eef2df 0%, #f3ded7 55%, #e6efe2 100%)",
        }}
      >
        {/* Hidden title for accessibility */}
        <GlassSheetTitle className="sr-only">Start a Project</GlassSheetTitle>

        {/* Floating close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-white/70 backdrop-blur-sm border border-[rgba(17,17,17,0.12)] shadow-sm text-[rgba(17,17,17,0.7)] hover:text-[#111] hover:bg-white hover:border-[rgba(17,17,17,0.2)] transition-all cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex-1 min-h-0 overflow-hidden pt-12">
          <InquiryChat mode="modal" onClose={onClose} />
        </div>
      </GlassSheetContent>
    </GlassSheet>
  );
}
