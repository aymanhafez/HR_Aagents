import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import briteMark from "@/assets/brite-mark.png";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import type { Role } from "@/data/workspace";

const SUGGESTIONS = [
  "Why did Support overtime rise 23%?",
  "Compare redeployment against hiring for Support",
  "Which payroll anomalies must clear before the run closes?",
  "Who is ready for the Support Team Lead role?",
];

export function AssistantPanel({ role, context }: { role: Role; context: string }) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { messages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { roleId: role.id, context },
    }),
    onError: (error) => toast.error(error.message || "Brite AI could not answer. Try again."),
  });

  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (!busy) textareaRef.current?.focus();
  }, [busy, messages.length]);

  const send = (text: string) => {
    const value = text.trim();
    if (!value || busy) return;
    sendMessage({ text: value });
    setInput("");
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <img src={briteMark} alt="" width={32} height={32} className="h-8 w-8" />
        <div className="leading-tight">
          <p className="font-display text-sm font-semibold">Brite AI</p>
          <p className="text-xs text-muted-foreground">
            {role.title} view · {role.focus}
          </p>
        </div>
      </div>

      <Conversation className="min-h-0 flex-1">
        <ConversationContent className="gap-4">
          {messages.length === 0 ? (
            <ConversationEmptyState
              icon={<img src={briteMark} alt="" width={44} height={44} className="h-11 w-11" />}
              title="Ask about your workforce"
              description="Detect, understand, predict and compare options before you decide."
            >
              <div className="mt-4 flex flex-col gap-2">
                {SUGGESTIONS.map((s) => (
                  <Button
                    key={s}
                    variant="outline"
                    size="sm"
                    className="h-auto justify-start whitespace-normal py-2 text-left text-xs"
                    onClick={() => send(s)}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </ConversationEmptyState>
          ) : (
            messages.map((message) => (
              <Message key={message.id} from={message.role}>
                <MessageContent variant={message.role === "user" ? "contained" : "flat"}>
                  {message.parts.map((part, i) =>
                    part.type === "text" ? (
                      <MessageResponse key={i}>{part.text}</MessageResponse>
                    ) : null,
                  )}
                </MessageContent>
              </Message>
            ))
          )}
          {status === "submitted" && <Shimmer className="text-sm">Analyzing workforce data...</Shimmer>}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t border-border p-3">
        <PromptInput
          onSubmit={(_message, event) => {
            event.preventDefault();
            send(input);
          }}
        >
          <PromptInputTextarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about cost, capacity, risk or a specific employee"
            autoFocus
          />
          <PromptInputFooter className="justify-end">
            <PromptInputSubmit
              size="icon-sm"
              status={status}
              disabled={!input.trim() && !busy}
              onClick={busy ? () => stop() : undefined}
            />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
