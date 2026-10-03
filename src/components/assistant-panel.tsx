import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import nayeraMark from "@/assets/nayera-mark.png";
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
import { Tool, ToolContent, ToolHeader } from "@/components/ai-elements/tool";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ChatAgentRun } from "@/components/agents/chat-agent-run";
import type { Role } from "@/data/workspace";

const SUGGESTIONS = [
  "Why did Support overtime rise 23%?",
  "Compare redeployment against hiring for Support",
  "Which payroll anomalies must clear before the run closes?",
  "Who is ready for the Support Team Lead role?",
];

export function AssistantPanel({ role, context, dataSource }: { role: Role; context: string; dataSource: string }) {
  const bodyRef = useRef({ roleId: role.id, context, dataSource });
  bodyRef.current = { roleId: role.id, context, dataSource };
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { messages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: () => bodyRef.current,
    }),
    onError: (error) => toast.error(error.message || "Nayera AI could not answer. Try again."),
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
        <img src={nayeraMark} alt="" width={32} height={32} className="h-8 w-8" />
        <div className="leading-tight">
          <p className="font-display text-sm font-semibold">Nayera AI</p>
          <p className="text-xs text-muted-foreground">
            {role.title} view · {dataSource === "uploaded" ? "Your uploaded data" : "Sample company"}
          </p>
        </div>
      </div>

      <Conversation className="min-h-0 flex-1">
        <ConversationContent className="gap-4">
          {messages.length === 0 ? (
            <ConversationEmptyState>
              <img src={nayeraMark} alt="" width={44} height={44} className="h-11 w-11" />
              <div className="space-y-1">
                <h3 className="font-display text-sm font-semibold">Ask about your workforce</h3>
                <p className="text-sm text-muted-foreground">
                  Detect, understand, predict and compare options before you decide.
                </p>
              </div>
              <div className="mt-2 flex w-full flex-col gap-2">
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
                <MessageContent>
                  {message.parts.map((part, i) => {
                    if (part.type === "text") return <MessageResponse key={i}>{part.text}</MessageResponse>;
                    if (part.type === "tool-start_agent_run") {
                      const p = part as unknown as { state: "input-streaming" | "input-available" | "output-available" | "output-error"; input?: { objective?: string }; output?: { ok: boolean; run_id?: string; objective?: string; error?: string; ticket?: number | null }; errorText?: string };
                      const o = p.output;
                      return (
                        <div key={i} className="space-y-2">
                        <Tool defaultOpen={false}>
                          <ToolHeader type="tool-start_agent_run" state={p.state} title={o?.ok ? `Ticket ${o.ticket ? `#${o.ticket} ` : ""}opened · agent started` : "Starting agent action…"} />
                          <ToolContent>
                            <div className="space-y-1.5 p-3 text-xs">
                              <p className="text-muted-foreground">{o?.objective ?? p.input?.objective ?? ""}</p>
                              {o?.ok && o.run_id ? (
                                <span className="flex gap-3"><Link to="/agents/$runId" params={{ runId: o.run_id }} className="font-medium text-primary underline">Open agent run</Link><Link to="/tasks" className="font-medium text-primary underline">View ticket</Link></span>
                              ) : o && !o.ok ? <p className="text-destructive">{o.error}</p> : p.errorText ? <p className="text-destructive">{p.errorText}</p> : null}
                            </div>
                          </ToolContent>
                        </Tool>
                        {o?.ok && o.run_id && <ChatAgentRun runId={o.run_id} />}
                        </div>
                      );
                    }
                    if (part.type === "tool-create_task") {
                      const p = part as unknown as {
                        state: "input-streaming" | "input-available" | "output-available" | "output-error";
                        input?: { title?: string; assignee_name?: string };
                        output?: { ok: boolean; error?: string; title?: string; assignee_name?: string; assignee_department?: string; priority?: string; due_date?: string; description?: string };
                        errorText?: string;
                      };
                      const o = p.output;
                      return (
                        <Tool key={i} defaultOpen={false}>
                          <ToolHeader type="tool-create_task" state={p.state} title={`Task: ${o?.title ?? p.input?.title ?? "creating…"}`} />
                          <ToolContent>
                            <div className="space-y-1.5 p-3 text-xs">
                              {o?.ok ? (
                                <>
                                  <p><span className="text-muted-foreground">Assigned to</span> <span className="font-medium">{o.assignee_name}</span>{o.assignee_department ? ` · ${o.assignee_department}` : ""}</p>
                                  <p><span className="text-muted-foreground">Priority</span> {o.priority} · <span className="text-muted-foreground">Due</span> {o.due_date}</p>
                                  <p className="text-muted-foreground">{o.description}</p>
                                  <Link to="/tasks" className="inline-block font-medium text-primary underline">Open Tasks</Link>
                                </>
                              ) : o && !o.ok ? (
                                <p className="text-destructive">Could not save task: {o.error}</p>
                              ) : p.errorText ? (
                                <p className="text-destructive">{p.errorText}</p>
                              ) : (
                                <p className="text-muted-foreground">Preparing task for {p.input?.assignee_name ?? "…"}</p>
                              )}
                            </div>
                          </ToolContent>
                        </Tool>
                      );
                    }
                    return null;
                  })}
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
            placeholder="Ask a question or tell Nayera what to get done"
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
