import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Circle, Loader2, Pause, Pencil, Play, RotateCcw, SkipForward, XCircle } from "lucide-react";
import { toast } from "sonner";

import { statusVariant } from "@/components/agents/agent-parts";
import { MessageResponse } from "@/components/ai-elements/message";
import { PageHeader } from "@/components/page-parts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { agentById, RUN_STATUS_LABEL } from "@/data/agents";
import { roles } from "@/data/workspace";
import { ApprovalCard } from "@/components/agents/approval-card";
import { advanceAgentRun, controlAgentRun, editAgentStep } from "@/lib/agents/agents.functions";
import { useAgentRealtime, useAgentRun, type AgentStep } from "@/lib/agents/client";

export const Route = createFileRoute("/agents/$runId")({
  head: () => ({
    meta: [
      { title: "Agent Run — Nayera AI" },
      { name: "description", content: "Live step-by-step progress, approvals and final report for an HR agent run." },
      { property: "og:title", content: "Agent Run — Nayera AI" },
      { property: "og:description", content: "Track every step an HR agent takes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RunPage,
});

function StepIcon({ s }: { s: string }) {
  if (s === "done") return <CheckCircle2 className="h-4 w-4 text-primary" />;
  if (s === "running") return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
  if (s === "blocked" || s === "failed") return <AlertTriangle className="h-4 w-4 text-destructive" />;
  if (s === "waiting") return <Pause className="h-4 w-4 text-primary" />;
  if (s === "skipped") return <SkipForward className="h-4 w-4 text-muted-foreground" />;
  return <Circle className="h-4 w-4 text-muted-foreground" />;
}

function RunPage() {
  const { runId } = Route.useParams();
  useAgentRealtime();
  const { data, refetch, isLoading } = useAgentRun(runId);
  const advance = useServerFn(advanceAgentRun);
  const control = useServerFn(controlAgentRun);
  const busy = useRef(false);
  const [tick, setTick] = useState(0);
  const run = data?.run;

  // Drive the engine one step at a time while the run is active.
  useEffect(() => {
    if (run?.status !== "running" || busy.current) return;
    busy.current = true;
    advance({ data: { runId } })
      .catch((e) => toast.error(e instanceof Error ? e.message : "Step failed"))
      .finally(() => { busy.current = false; refetch().then(() => setTick((t) => t + 1)); });
  }, [run?.status, tick, advance, runId, refetch]);

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading run…</p>;
  if (!run) return <div className="space-y-2"><p>Run not found.</p><Link to="/ai-agents" className="text-primary underline">Back to agents</Link></div>;

  const agent = agentById[run.agent];
  const role = roles.find((r) => r.id === run.requested_by_role);
  const act = async (a: "pause" | "resume" | "cancel") => { await control({ data: { runId, action: a } }); refetch(); };
  const pending = data.approvals.filter((a) => a.status === "pending");
  const report = run.report as Record<string, string | string[]> | null;

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <PageHeader
        eyebrow={agent?.name ?? run.agent}
        title={run.objective}
        subtitle={`Requested by ${role ? `${role.name} (${role.title})` : run.requested_by_role} · ${run.priority} priority · ${run.data_source === "uploaded" ? "your uploaded data" : "sample company"}`}
        actions={
          <div className="flex gap-2">
            {run.status === "running" && <Button size="sm" variant="outline" className="gap-1" onClick={() => act("pause")}><Pause className="h-3.5 w-3.5" />Pause</Button>}
            {["paused", "blocked"].includes(run.status) && <Button size="sm" className="gap-1" onClick={() => act("resume")}><Play className="h-3.5 w-3.5" />Resume</Button>}
            {!["completed", "cancelled"].includes(run.status) && <Button size="sm" variant="outline" className="gap-1" onClick={() => act("cancel")}><XCircle className="h-3.5 w-3.5" />Cancel</Button>}
          </div>
        }
      />

      <Card className="gap-2 p-4 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-3">
          <Badge variant={statusVariant(run.status)}>{RUN_STATUS_LABEL[run.status] ?? run.status}</Badge>
          <Progress value={run.progress} className="h-2 flex-1" />
          <span className="text-sm font-medium">{run.progress}%</span>
        </div>
        {run.plan_summary && <p className="text-sm text-muted-foreground">{run.plan_summary}</p>}
      </Card>

      {run.status === "blocked" && run.blocker && (
        <Card className="gap-1 border-destructive/40 p-4">
          <p className="font-display text-sm font-semibold text-destructive">Blocker</p>
          <p className="text-sm">{run.blocker}</p>
          <p className="text-xs text-muted-foreground">Fix the cause, then press Resume or retry the step.</p>
        </Card>
      )}

      {pending.map((a) => <ApprovalCard key={a.id} a={a} onDone={refetch} />)}

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="space-y-2">
          <p className="font-display text-sm font-semibold">Execution plan</p>
          {data.steps.map((s) => <StepRow key={s.id} s={s} onDone={refetch} />)}
        </div>
        <div className="space-y-2">
          <p className="font-display text-sm font-semibold">Live activity</p>
          <Card className="max-h-[560px] gap-0 overflow-y-auto p-0">
            {data.events.map((e) => (
              <div key={e.id} className="border-b border-border px-3 py-2 last:border-0">
                <p className={`text-xs ${e.type === "blocker" ? "text-destructive" : ""}`}>{e.message}</p>
                <p className="text-[10px] text-muted-foreground">{new Date(e.created_at).toLocaleTimeString()}</p>
              </div>
            ))}
          </Card>
        </div>
      </div>

      {report && (
        <Card className="gap-3 p-5 shadow-[var(--shadow-card)]">
          <p className="font-display text-base font-semibold">Final execution report</p>
          {(["result", "impact"] as const).map((k) => report[k] ? <p key={k} className="text-sm"><span className="font-medium capitalize">{k}: </span>{String(report[k])}</p> : null)}
          <div className="grid gap-4 md:grid-cols-2">
            {([["completed", "Actions completed"], ["not_completed", "Not completed"], ["decisions", "Human decisions"], ["issues", "Issues encountered"], ["recommendations", "Recommendations"]] as const).map(([k, label]) => {
              const v = report[k];
              if (!Array.isArray(v) || v.length === 0) return null;
              return <div key={k}><p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">{label}</p><ul className="list-disc space-y-0.5 pl-4 text-sm">{v.map((x, i) => <li key={i}>{x}</li>)}</ul></div>;
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

function StepRow({ s, onDone }: { s: AgentStep; onDone: () => void }) {
  const edit = useServerFn(editAgentStep);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(s.title);
  const [open, setOpen] = useState(false);
  const go = async (action: "skip" | "retry" | "edit") => { await edit({ data: { stepId: s.id, action, title } }); setEditing(false); onDone(); };
  return (
    <Card className="gap-2 p-3">
      <div className="flex items-center gap-2">
        <StepIcon s={s.status} />
        <span className="text-xs text-muted-foreground">{String(s.idx).padStart(2, "0")}</span>
        {editing ? (
          <Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-7 flex-1 text-sm" />
        ) : (
          <button className="flex-1 text-left text-sm font-medium" onClick={() => setOpen((o) => !o)}>{s.title}</button>
        )}
        <Badge variant="outline" className="text-[10px]">{s.tool}</Badge>
        {s.risk !== "low" && <Badge variant={s.risk === "high" ? "destructive" : "secondary"} className="text-[10px]">{s.risk} risk</Badge>}
        {s.status === "pending" && !editing && (
          <>
            <Button size="icon-sm" variant="ghost" aria-label="Edit step" onClick={() => setEditing(true)}><Pencil className="h-3.5 w-3.5" /></Button>
            <Button size="icon-sm" variant="ghost" aria-label="Skip step" onClick={() => go("skip")}><SkipForward className="h-3.5 w-3.5" /></Button>
          </>
        )}
        {editing && <Button size="sm" onClick={() => go("edit")}>Save</Button>}
        {(s.status === "blocked" || s.status === "failed") && <Button size="sm" variant="outline" className="gap-1" onClick={() => go("retry")}><RotateCcw className="h-3.5 w-3.5" />Retry</Button>}
      </div>
      {(open || s.status === "blocked") && (
        <div className="space-y-1 pl-6 text-sm">
          {s.output?.result && <MessageResponse>{s.output.result}</MessageResponse>}
          {s.evidence && <p className="text-xs text-muted-foreground">Evidence: {s.evidence}</p>}
          {s.error && <p className="text-xs text-destructive">{s.error}</p>}
          {!s.output?.result && !s.error && <p className="text-xs text-muted-foreground">Not run yet.</p>}
        </div>
      )}
    </Card>
  );
}

