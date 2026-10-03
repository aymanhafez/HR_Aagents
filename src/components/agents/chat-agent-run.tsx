import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Circle, Loader2, Pause, SkipForward, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { ApprovalCard } from "@/components/agents/approval-card";
import { MessageResponse } from "@/components/ai-elements/message";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { agentById } from "@/data/agents";
import { advanceAgentRun } from "@/lib/agents/agents.functions";
import { useAgentRealtime, useAgentRun } from "@/lib/agents/client";

function StepIcon({ s }: { s: string }) {
  if (s === "done") return <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" />;
  if (s === "running") return <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-primary" />;
  if (s === "blocked" || s === "failed") return <XCircle className="h-3.5 w-3.5 shrink-0 text-destructive" />;
  if (s === "waiting") return <Pause className="h-3.5 w-3.5 shrink-0 text-primary" />;
  if (s === "skipped") return <SkipForward className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />;
  return <Circle className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />;
}

/** Runs an agent from inside the chat and reports progress, approvals and the final result inline. */
export function ChatAgentRun({ runId }: { runId: string }) {
  useAgentRealtime();
  const { data, refetch } = useAgentRun(runId);
  const advance = useServerFn(advanceAgentRun);
  const busy = useRef(false);
  const [tick, setTick] = useState(0);
  const run = data?.run;

  useEffect(() => {
    if (run?.status !== "running" || busy.current) return;
    busy.current = true;
    advance({ data: { runId } })
      .catch(() => {})
      .finally(() => { busy.current = false; refetch().then(() => setTick((t) => t + 1)); });
  }, [run?.status, tick, advance, runId, refetch]);

  if (!data || !run) return <p className="text-xs text-muted-foreground">Starting agent…</p>;
  const agent = agentById[run.agent];
  const pending = data.approvals.filter((a) => a.status === "pending");
  const report = run.report as { result?: string; completed?: string[]; not_completed?: string[]; impact?: string } | null;

  return (
    <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-3 text-xs">
      <div className="flex items-center justify-between gap-2">
        <p className="font-display text-sm font-semibold">{agent?.name ?? "Agent"}</p>
        <Badge variant="outline" className="text-[10px] capitalize">{run.status.replace("_", " ")}</Badge>
      </div>
      <Progress value={run.progress} className="h-1.5" />
      <ul className="space-y-1">
        {data.steps.map((s) => (
          <li key={s.id} className="flex items-start gap-2">
            <StepIcon s={s.status} />
            <span className={s.status === "done" ? "" : "text-muted-foreground"}>{s.title}{s.output?.confirmation && s.status === "done" && s.tool !== "analyze" ? <span className="block text-[11px] text-primary">{s.output.confirmation}</span> : null}</span>
          </li>
        ))}
      </ul>
      {pending.map((a) => <ApprovalCard key={a.id} a={a} onDone={() => refetch()} />)}
      {run.status === "blocked" && run.blocker && <p className="text-destructive">Blocked: {run.blocker}</p>}
      {run.status === "completed" && report && (
        <div className="space-y-1 border-t border-border pt-2">
          <p className="font-semibold">Result</p>
          {report.result && <MessageResponse>{report.result}</MessageResponse>}
          {!!report.not_completed?.length && <p className="text-muted-foreground">Not completed: {report.not_completed.join("; ")}</p>}
        </div>
      )}
      <Link to="/agents/$runId" params={{ runId }} className="inline-block font-medium text-primary underline">Full run details</Link>
    </div>
  );
}
