import { createFileRoute } from "@tanstack/react-router";

import { RunCard, StartAgentForm } from "@/components/agents/agent-parts";
import { KpiGrid, PageHeader } from "@/components/page-parts";
import { agents, RUN_STATUS_LABEL } from "@/data/agents";
import { useAgentRealtime, useAgentRuns } from "@/lib/agents/client";

export const Route = createFileRoute("/ai-agents")({
  head: () => ({
    meta: [
      { title: "Agent Operations Center — Nayera AI" },
      { name: "description", content: "Start HR agents, follow every step live, approve sensitive actions and read final execution reports." },
      { property: "og:title", content: "Agent Operations Center — Nayera AI" },
      { property: "og:description", content: "HR agents that plan, execute, request approval and report — tracked step by step." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OpsCenter,
});

const COLUMNS = ["running", "waiting_approval", "blocked", "completed"];

function OpsCenter() {
  useAgentRealtime();
  const { data: runs = [] } = useAgentRuns();
  const count = (s: string) => runs.filter((r) => r.status === s).length;
  const finished = runs.filter((r) => ["completed", "failed", "cancelled"].includes(r.status));
  const success = finished.length ? Math.round((count("completed") / finished.length) * 100) : 0;
  const other = runs.filter((r) => !COLUMNS.includes(r.status));

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <PageHeader eyebrow="Automation" title="Agent Operations Center" subtitle={`${agents.length} HR agents that plan, execute, ask for approval and report. Every step is tracked.`} />
      <KpiGrid kpis={[
        { label: "Active runs", value: String(count("running") + count("planning")) },
        { label: "Waiting approval", value: String(count("waiting_approval")) },
        { label: "Blocked", value: String(count("blocked")), tone: count("blocked") ? "down" : "flat" },
        { label: "Success rate", value: `${success}%` },
      ]} />
      <StartAgentForm />
      <div className="grid gap-4 lg:grid-cols-4">
        {COLUMNS.map((c) => (
          <div key={c} className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{RUN_STATUS_LABEL[c]} · {count(c)}</p>
            {runs.filter((r) => r.status === c).map((r) => <RunCard key={r.id} run={r} />)}
          </div>
        ))}
      </div>
      {other.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Paused, cancelled and failed</p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{other.map((r) => <RunCard key={r.id} run={r} />)}</div>
        </div>
      )}
    </div>
  );
}
