import { Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Bot, Loader2, Play } from "lucide-react";
import { toast } from "sonner";

import { useCurrentRole } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { agentById, agents, RUN_STATUS_LABEL } from "@/data/agents";
import { startAgentRun } from "@/lib/agents/agents.functions";
import type { AgentRun } from "@/lib/agents/client";
import { useDataSource } from "@/lib/data-source";

export function statusVariant(s: string): "default" | "secondary" | "destructive" | "outline" {
  if (s === "completed") return "secondary";
  if (s === "blocked" || s === "failed") return "destructive";
  if (s === "waiting_approval" || s === "running" || s === "planning") return "default";
  return "outline";
}

export function useStartRun() {
  const start = useServerFn(startAgentRun);
  const role = useCurrentRole();
  const { source } = useDataSource();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  const run = async (objective: string, agent?: string, priority = "Medium") => {
    if (!objective.trim() || pending) return;
    setPending(true);
    try {
      const r = await start({ data: { objective: objective.trim(), agent, roleId: role.id, priority, dataSource: source } });
      toast.success("Agent run started");
      navigate({ to: "/agents/$runId", params: { runId: r.id } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not start the agent");
    } finally {
      setPending(false);
    }
  };
  return { run, pending };
}

export function StartAgentForm({ defaultAgent }: { defaultAgent?: string }) {
  const { run, pending } = useStartRun();
  const [objective, setObjective] = useState("");
  const [agent, setAgent] = useState(defaultAgent ?? "auto");
  const [priority, setPriority] = useState("Medium");
  return (
    <Card className="gap-3 p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-2">
        <Bot className="h-4 w-4 text-primary" />
        <p className="font-display text-sm font-semibold">Start an agent</p>
      </div>
      <Textarea value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="e.g. Hire a Senior Data Analyst for my team" rows={2} />
      <div className="flex flex-wrap gap-2">
        <Select value={agent} onValueChange={setAgent}>
          <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="auto">Let Nayera choose the agent</SelectItem>
            {agents.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>{["Low", "Medium", "High", "Critical"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
        </Select>
        <Button className="ml-auto gap-2" disabled={pending || objective.trim().length < 3} onClick={() => run(objective, agent === "auto" ? undefined : agent, priority)}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          {pending ? "Planning…" : "Start agent"}
        </Button>
      </div>
    </Card>
  );
}

export function RunCard({ run }: { run: AgentRun }) {
  return (
    <Link to="/agents/$runId" params={{ runId: run.id }} className="block">
      <Card className="gap-2 p-3 shadow-[var(--shadow-card)] transition-colors hover:border-primary/50">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium text-muted-foreground">{agentById[run.agent]?.name ?? run.agent}</p>
          <Badge variant={statusVariant(run.status)}>{RUN_STATUS_LABEL[run.status] ?? run.status}</Badge>
        </div>
        <p className="line-clamp-2 text-sm font-medium">{run.objective}</p>
        <Progress value={run.progress} className="h-1.5" />
        <p className="text-xs text-muted-foreground">{run.progress}% · {run.priority} · {new Date(run.created_at).toLocaleDateString()}</p>
        {run.blocker && <p className="line-clamp-2 text-xs text-destructive">{run.blocker}</p>}
      </Card>
    </Link>
  );
}
