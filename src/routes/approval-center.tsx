import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

import { AiInsightCard, KpiGrid, PageHeader } from "@/components/page-parts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { approvals } from "@/data/workspace";
import { agentById } from "@/data/agents";
import { useAgentRealtime, usePendingAgentApprovals } from "@/lib/agents/client";
import { ApprovalCard } from "@/routes/agents.$runId";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/approval-center")({
  head: () => ({
    meta: [
      { title: "Approval Center — Nayera AI" },
      {
        name: "description",
        content: "One inbox for leave, hiring, salary, payroll and AI recommendations awaiting human approval.",
      },
      { property: "og:title", content: "Approval Center — Nayera AI" },
      { property: "og:description", content: "Every sensitive decision waiting for a human approval." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ApprovalCenter,
});

function ApprovalCenter() {
  const [decisions, setDecisions] = useState<Record<string, string>>({});

  const decide = (id: string, action: string) => {
    setDecisions((d) => ({ ...d, [id]: action }));
    toast.success(`${id} ${action.toLowerCase()}`, { description: "Recorded in the AI audit log." });
  };

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <PageHeader
        eyebrow="Automation"
        title="Approval Center"
        subtitle="Sensitive actions never execute without a named human decision."
      />

      <KpiGrid
        kpis={[
          { label: "Awaiting you", value: String(approvals.length) },
          { label: "High risk", value: "1" },
          { label: "Avg decision time", value: "1.4 days", delta: "-0.6", tone: "down" },
          { label: "Auto-executable", value: "12" },
        ]}
      />

      <AgentApprovals />

      <div className="space-y-3">
        {approvals.map((a) => {
          const outcome = decisions[a.id];
          return (
            <Card key={a.id} className="flex-row flex-wrap items-center gap-4 p-4 shadow-[var(--shadow-card)]">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground">{a.id}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {a.type}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${
                      a.risk === "High"
                        ? "border-destructive/30 text-destructive"
                        : a.risk === "Medium"
                          ? "border-primary/30 text-primary"
                          : "border-[var(--success)]/30 text-[var(--success)]"
                    }`}
                  >
                    {a.risk} risk
                  </Badge>
                </div>
                <p className="mt-1 text-sm font-medium text-foreground">{a.subject}</p>
                <p className="text-xs text-muted-foreground">
                  {a.requestedBy} · {a.amount} · waiting {a.age}
                </p>
              </div>
              {outcome ? (
                <Badge variant="outline" className="border-[var(--success)]/30 text-[var(--success)]">
                  {outcome}
                </Badge>
              ) : (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => decide(a.id, "Approved")}>
                    <CheckCircle2 className="h-4 w-4" /> Approve
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => decide(a.id, "Rejected")}>
                    <XCircle className="h-4 w-4" /> Reject
                  </Button>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <AiInsightCard
        detected="Payroll approval AP-2208 has 9 unresolved anomalies and closes in 3 days."
        why="Anomaly review tasks sit with a team that is already 37 tasks overdue."
        recommend="Approve the redeployment first, then clear anomalies before releasing the run."
        impact="Avoids releasing $702K with known control findings."
      />
    </div>
  );
}

function AgentApprovals() {
  useAgentRealtime();
  const { data = [], refetch } = usePendingAgentApprovals();
  if (data.length === 0) return null;
  return (
    <div className="space-y-2">
      <p className="font-display text-sm font-semibold">From agent runs · {data.length}</p>
      {data.map((a) => (
        <div key={a.id} className="space-y-1">
          <Link to="/agents/$runId" params={{ runId: a.run_id }} className="text-xs text-primary underline">
            {agentById[a.agent_runs?.agent ?? ""]?.name ?? "Agent"} — {a.agent_runs?.objective}
          </Link>
          <ApprovalCard a={a} onDone={refetch} />
        </div>
      ))}
    </div>
  );
}
