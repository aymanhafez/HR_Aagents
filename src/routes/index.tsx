import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, PiggyBank, Sprout, CheckCircle2, XCircle, Pencil, UserCog } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-parts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { recommendations, type Recommendation } from "@/data/workspace";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Command Center — Nayera AI People Intelligence" },
      {
        name: "description",
        content:
          "Detect workforce risk, payroll leakage and cost-saving opportunities, then approve the next best action.",
      },
      { property: "og:title", content: "AI Command Center — Nayera AI" },
      {
        property: "og:description",
        content: "Workforce risk, cost savings and growth opportunities with human-approved AI actions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CommandCenter,
});

const CATEGORY_META = {
  Risk: { icon: AlertTriangle, label: "Critical risk" },
  "Cost saving": { icon: PiggyBank, label: "Cost saving" },
  Growth: { icon: Sprout, label: "Growth" },
} as const;

function severityClass(sev: Recommendation["severity"]) {
  if (sev === "Critical") return "border-destructive/30 bg-destructive/10 text-destructive";
  if (sev === "High") return "border-primary/30 bg-primary/10 text-primary";
  return "border-[var(--warning)]/35 bg-[var(--warning)]/15 text-[var(--warning-foreground)]";
}

function CommandCenter() {
  const [decided, setDecided] = useState<Record<string, string>>({});

  const decide = (rec: Recommendation, action: string) => {
    setDecided((d) => ({ ...d, [rec.id]: action }));
    toast.success(`${rec.id} ${action.toLowerCase()}`, { description: rec.approval });
  };

  const counts = {
    risks: recommendations.filter((r) => r.category === "Risk").length,
    savings: recommendations.filter((r) => r.category === "Cost saving").length,
    growth: recommendations.filter((r) => r.category === "Growth").length,
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        eyebrow="Intelligence"
        title="AI Command Center"
        subtitle="Everything Nayera AI detected across the workforce today, with the decision each item needs."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryTile
          tone="destructive"
          icon={<AlertTriangle className="h-4 w-4" />}
          label="Critical risks"
          value={counts.risks}
          note="Payroll control breach, skill dependency"
        />
        <SummaryTile
          tone="primary"
          icon={<PiggyBank className="h-4 w-4" />}
          label="Cost-saving opportunities"
          value={counts.savings}
          note="$234K identified this month"
        />
        <SummaryTile
          tone="success"
          icon={<Sprout className="h-4 w-4" />}
          label="Growth opportunities"
          value={counts.growth}
          note="Internal talent ready for open roles"
        />
      </div>

      <div>
        <h2 className="mb-3 font-display text-lg font-semibold">AI next best actions</h2>
        <div className="space-y-4">
          {recommendations.map((rec) => {
            const Meta = CATEGORY_META[rec.category];
            const CategoryIcon = Meta.icon;
            const outcome = decided[rec.id];
            return (
              <Card key={rec.id} className="gap-0 overflow-hidden p-0 shadow-[var(--shadow-card)]">
                <div className="flex flex-wrap items-start gap-3 border-b border-border bg-[var(--surface-raised)] px-5 py-4">
                  <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-md bg-primary/12 text-primary">
                    <CategoryIcon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground">{rec.id}</span>
                      <Badge variant="outline" className={`text-[10px] ${severityClass(rec.severity)}`}>
                        {rec.severity}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {Meta.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{rec.department}</span>
                    </div>
                    <h3 className="mt-1 font-display text-base font-semibold text-foreground">{rec.title}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Confidence</p>
                    <p className="font-display text-lg font-semibold tabular-nums">{rec.confidence}%</p>
                  </div>
                </div>

                <div className="grid gap-5 px-5 py-4 lg:grid-cols-3">
                  <div className="space-y-3 lg:col-span-2">
                    <Field label="Problem">{rec.problem}</Field>
                    <div>
                      <FieldLabel>Evidence</FieldLabel>
                      <ul className="mt-1 space-y-1">
                        {rec.evidence.map((e) => (
                          <li key={e} className="flex gap-2 text-sm text-foreground">
                            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                            {e}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Field label="Likely cause">{rec.cause}</Field>
                    <Field label="AI recommendation">
                      <span className="font-medium text-foreground">{rec.recommendation}</span>
                    </Field>
                    <div>
                      <FieldLabel>Alternatives</FieldLabel>
                      <ul className="mt-1 space-y-1">
                        {rec.alternatives.map((a) => (
                          <li key={a} className="text-sm text-muted-foreground">
                            • {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-3 rounded-lg border border-border bg-muted/40 p-4">
                    <Field label="Employees affected">{rec.affected}</Field>
                    <Field label="Financial impact">{rec.financial}</Field>
                    <Field label="Operational impact">{rec.operational}</Field>
                    <Field label="Action owner">{rec.owner}</Field>
                    <Field label="Approval">{rec.approval}</Field>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 border-t border-border px-5 py-3">
                  {outcome ? (
                    <Badge variant="outline" className="border-[var(--success)]/30 text-[var(--success)]">
                      {outcome} · logged to AI audit
                    </Badge>
                  ) : (
                    <>
                      <Button size="sm" onClick={() => decide(rec, "Approved")}>
                        <CheckCircle2 className="h-4 w-4" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => decide(rec, "Modified")}>
                        <Pencil className="h-4 w-4" /> Modify
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => decide(rec, "Delegated")}>
                        <UserCog className="h-4 w-4" /> Delegate
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => decide(rec, "Rejected")}>
                        <XCircle className="h-4 w-4" /> Reject
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{children}</p>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <p className="mt-0.5 text-sm text-foreground">{children}</p>
    </div>
  );
}

function SummaryTile({
  icon,
  label,
  value,
  note,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  note: string;
  tone: "destructive" | "primary" | "success";
}) {
  const toneClass =
    tone === "destructive"
      ? "bg-destructive/10 text-destructive"
      : tone === "primary"
        ? "bg-primary/12 text-primary"
        : "bg-[var(--success)]/12 text-[var(--success)]";
  return (
    <Card className="flex-row items-center gap-4 p-4 shadow-[var(--shadow-card)]">
      <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${toneClass}`}>{icon}</span>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="font-display text-xl font-semibold">{value}</p>
        <p className="text-xs text-muted-foreground">{note}</p>
      </div>
    </Card>
  );
}
