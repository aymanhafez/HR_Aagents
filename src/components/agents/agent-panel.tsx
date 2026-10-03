import { Link } from "@tanstack/react-router";
import { Bot, Loader2 } from "lucide-react";

import { RunCard, useStartRun } from "@/components/agents/agent-parts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { agentForModule } from "@/data/agents";
import { useAgentRealtime, useAgentRuns } from "@/lib/agents/client";

export function AgentPanel({ slug }: { slug: string }) {
  const agent = agentForModule(slug);
  useAgentRealtime();
  const { data: runs } = useAgentRuns({ agent: agent?.id });
  const { run, pending } = useStartRun();
  if (!agent) return null;
  return (
    <Card className="gap-3 p-4 shadow-[var(--shadow-card)]">
      <div className="flex flex-wrap items-center gap-2">
        <Bot className="h-4 w-4 text-primary" />
        <p className="font-display text-sm font-semibold">Run {agent.name}</p>
        <p className="text-xs text-muted-foreground">{agent.focus} Approvals go to {agent.approver}.</p>
        <Link to="/ai-agents" className="ml-auto text-xs font-medium text-primary underline">All agents</Link>
      </div>
      <div className="flex flex-wrap gap-2">
        {agent.starters.map((s) => (
          <Button key={s} variant="outline" size="sm" disabled={pending} onClick={() => run(s, agent.id, "High")} className="gap-2">
            {pending && <Loader2 className="h-3 w-3 animate-spin" />}{s}
          </Button>
        ))}
      </div>
      {runs && runs.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {runs.slice(0, 3).map((r) => <RunCard key={r.id} run={r} />)}
        </div>
      )}
    </Card>
  );
}
