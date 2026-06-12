"use client";

import { memo, useMemo } from "react";
import Image from "next/image";
import { WIMessage } from "./wi-message";
import { UserAnswer } from "./user-answer";
import { TypingIndicator } from "./typing-indicator";
import { CompletedTextCard } from "./completed-text-card";
import { CompletedOptionCard } from "./completed-option-card";
import type { ChatMessage, ChatPhase } from "../types";

interface MessageListProps {
  messages: ChatMessage[];
  phase: ChatPhase;
  userName?: string;
  formData?: Record<string, unknown>;
  onUpdate?: (key: string, value: string | string[]) => void;
}

function getMessageSide(msg: ChatMessage): "wi" | "user" {
  return msg.role === "wi" ? "wi" : "user";
}

interface MessageGroup {
  side: "wi" | "user";
  items: ChatMessage[];
}

export const MessageList = memo(function MessageList({ messages, phase, userName, formData, onUpdate }: MessageListProps) {
  const isTyping = phase.type === "typing-prompts";
  const initial = userName?.trim()?.charAt(0)?.toUpperCase();

  // Group consecutive messages by side
  const groups = useMemo(() => {
    const result: MessageGroup[] = [];
    let current: MessageGroup | null = null;

    for (const msg of messages) {
      const side = getMessageSide(msg);
      if (!current || current.side !== side) {
        if (current) result.push(current);
        current = { side, items: [msg] };
      } else {
        current.items.push(msg);
      }
    }
    if (current) result.push(current);
    return result;
  }, [messages]);

  // Check if typing indicator should be appended to last WI group
  const lastGroup = groups[groups.length - 1];
  const typingInLastWiGroup = isTyping && lastGroup?.side === "wi";

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group, groupIndex) => {
        const isLastGroup = groupIndex === groups.length - 1;
        const showTyping = isLastGroup && typingInLastWiGroup;

        return (
          <div
            key={groupIndex}
            className={`flex flex-col gap-1 ${group.side === "wi" ? "items-start" : "items-end"}`}
          >
            {/* Label */}
            <div className="text-[13px] text-[rgba(17,17,17,0.55)] mb-1">
              <strong className="text-[#111] font-semibold">
                {group.side === "wi" ? "Widarto Impact" : "You"}
              </strong>
            </div>

            {/* Items */}
            <div className={`flex flex-col gap-1 w-full ${group.side === "user" ? "items-end" : "items-start"}`}>
              {group.items.map((msg) => {
                if (msg.role === "wi") {
                  return <WIMessage key={msg.id} text={msg.text} emoji={msg.emoji} animate={false} formData={formData} />;
                }

                if (msg.role === "user") {
                  return <UserAnswer key={msg.id} text={msg.text} />;
                }

                if (msg.role === "completed-text") {
                  return (
                    <CompletedTextCard
                      key={msg.id}
                      fields={msg.fields}
                      formData={formData}
                      onUpdate={onUpdate}
                    />
                  );
                }

                if (msg.role === "completed-option") {
                  return (
                    <CompletedOptionCard
                      key={msg.id}
                      label={msg.label}
                      dataKey={msg.dataKey}
                      options={msg.options}
                      selected={msg.selected}
                      multi={msg.multi}
                      formData={formData}
                      onUpdate={onUpdate}
                    />
                  );
                }

                return null;
              })}

              {showTyping && <TypingIndicator />}
            </div>

            {/* Avatar */}
            {group.side === "wi" ? (
              !showTyping && (
                <div className="mt-1.5">
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
              )
            ) : (
              initial && (
                <div className="mt-1.5">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                    style={{ background: "rgba(17, 17, 17, 0.75)" }}
                  >
                    {initial}
                  </div>
                </div>
              )
            )}
          </div>
        );
      })}

      {/* Typing indicator as standalone group (when no WI messages yet) */}
      {isTyping && !typingInLastWiGroup && (
        <div className="flex flex-col gap-1 items-start">
          <div className="text-[13px] text-[rgba(17,17,17,0.55)] mb-1">
            <strong className="text-[#111] font-semibold">Widarto Impact</strong>
          </div>
          <TypingIndicator />
        </div>
      )}
    </div>
  );
});
